"""Domain service for DermaVision RAG chat."""
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timezone

from app.core.config import settings
from app.infrastructure.database.repositories.diagnosis_repository import DiagnosisRepository
from app.infrastructure.rag.disease_profiles import canonical_display_name, get_profile, get_safety_facts
from app.infrastructure.rag.document_loader import DocumentLoader
from app.infrastructure.rag.generator import Generator
from app.infrastructure.rag.groq_generator import GroqGenerator
from app.infrastructure.rag.intent import (
    ANSWER_INTENT_ORDER,
    contains_arabic,
    detect_question_intent,
    detect_question_intents,
    has_life_danger_terms,
)
from app.infrastructure.rag.openai_generator import OpenAIGenerator
from app.infrastructure.rag.prompt_builder import PromptBuilder
from app.infrastructure.rag.retriever import Retriever
from app.infrastructure.rag.semantic_intent_classifier import SemanticIntentClassifier
from app.infrastructure.rag.text_splitter import TextSplitter
from app.infrastructure.rag.vector_store import LocalVectorStore, SearchResult
from app.infrastructure.rag.xai_generator import XaiGenerator

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RagAnswer:
    answer: str
    diagnosis_context: dict
    sources: list[dict]
    disclaimer: str


@dataclass(frozen=True)
class ValidationResult:
    answer: str | None
    status: str
    reason: str | None = None


class RagService:
    """Coordinates diagnosis context, retrieval, and safe answer generation."""

    def __init__(self, diagnosis_repo: DiagnosisRepository):
        self.diagnosis_repo = diagnosis_repo
        self.document_loader = DocumentLoader(settings.RAG_KNOWLEDGE_PATH)
        self.text_splitter = TextSplitter(
            chunk_size=settings.RAG_CHUNK_SIZE,
            chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        )
        self.vector_store = LocalVectorStore(settings.RAG_VECTOR_INDEX_DIR)
        self.retriever = Retriever(self.vector_store)
        self.prompt_builder = PromptBuilder()
        self.generator = Generator()
        self.openai_generator = OpenAIGenerator()
        self.xai_generator = XaiGenerator()
        self.groq_generator = GroqGenerator()
        self.semantic_intent_classifier = SemanticIntentClassifier()

    async def chat(
        self,
        analysis_id: int,
        message: str,
        language: str,
        user_id: int,
    ) -> RagAnswer | None:
        diagnosis = await self.diagnosis_repo.get_by_id(analysis_id)
        if not diagnosis or diagnosis.user_id != user_id:
            return None

        predicted_label = diagnosis.disease_type
        rag_label = self._rag_label(predicted_label)
        confidence = float(diagnosis.probability) if diagnosis.probability is not None else None
        response_confidence = confidence if confidence is not None else 0.0
        local_intent = detect_question_intent(message)
        local_intents = detect_question_intents(message)
        response_language = "ar" if contains_arabic(message) else language
        intent_resolution = await self._resolve_intent(
            message=message,
            rag_label=rag_label,
            response_language=response_language,
            local_intent=local_intent,
            local_intents=local_intents,
        )
        intents = intent_resolution["final_intents"]
        intent = intents[0]
        intent_label = "+".join(intents)

        document = self.document_loader.load()
        chunks = self.text_splitter.split(document)
        self.vector_store.load_or_build(
            chunks=chunks,
            source_mtime=document.mtime if document else None,
            source_size=document.size if document else None,
        )

        query = f"{rag_label} {message}"
        retrieved_chunks = self._retrieve_for_intents(
            query=query,
            rag_label=rag_label,
            intents=intents,
        )

        # The prompt is built now so optional LLM generation can be added later without
        # changing the endpoint contract.
        self.prompt_builder.build(
            message=message,
            predicted_label=rag_label,
            confidence=response_confidence,
            chunks=retrieved_chunks,
            language=response_language,
        )

        diagnosis_context = {
            "analysis_id": diagnosis.id,
            "predicted_label": predicted_label,
            "confidence": response_confidence,
        }
        generation_provider = "local_fallback"
        generation_fallback_reason = None
        post_generation_validation = "not_applicable"
        validation_reason = None
        answer = None

        if not self._requires_deterministic_answer(intents) and self._should_use_llm(intents):
            provider = self._llm_provider()
            if provider == "groq":
                answer = await self.groq_generator.generate(
                    message=message,
                    intent=intent_label,
                    language=response_language,
                    diagnosis_context=diagnosis_context,
                    chunks=retrieved_chunks,
                )
            elif provider == "xai":
                answer = await self.xai_generator.generate(
                    message=message,
                    intent=intent_label,
                    language=response_language,
                    diagnosis_context=diagnosis_context,
                    chunks=retrieved_chunks,
                )
            elif provider == "openai":
                answer = await self.openai_generator.generate(
                    message=message,
                    intent=intent_label,
                    language=response_language,
                    diagnosis_context=diagnosis_context,
                    chunks=retrieved_chunks,
                )
            if answer:
                validation = self._validate_provider_answer(
                    answer=answer,
                    predicted_label=predicted_label,
                    intents=intents,
                    language=response_language,
                )
                post_generation_validation = validation.status
                validation_reason = validation.reason
                if validation.answer:
                    answer = validation.answer
                    generation_provider = provider
                else:
                    answer = None
                    generation_fallback_reason = self._fallback_reason(
                        generation_fallback_reason,
                        f"post_generation_validation_discarded:{validation.reason}",
                    )
            elif provider in {"openai", "xai", "groq"}:
                generation_fallback_reason = f"{provider}_generation_failed_or_unavailable"

        if not answer:
            answer = self.generator.generate(
                message=message,
                predicted_label=rag_label,
                chunks=retrieved_chunks,
                language=response_language,
                intent=intent,
                intents=intents,
                confidence=confidence,
            )

        self._log_development_request(
            analysis_id=analysis_id,
            predicted_label=predicted_label,
            local_intent=local_intent,
            semantic_intent=intent_resolution["semantic_intent"],
            semantic_intents=intent_resolution["semantic_intents"],
            final_intent=intent_label,
            final_intents=intents,
            semantic_confidence=intent_resolution["semantic_confidence"],
            generation_provider=generation_provider,
            fallback_reason=self._fallback_reason(
                intent_resolution["fallback_reason"],
                generation_fallback_reason,
            ),
            post_generation_validation=post_generation_validation,
            validation_reason=validation_reason,
        )

        return RagAnswer(
            answer=answer,
            diagnosis_context=diagnosis_context,
            sources=self._build_sources(retrieved_chunks),
            disclaimer=self._disclaimer(response_language),
        )

    async def final_report(
        self,
        analysis_id: int,
        messages: list[dict],
        language: str,
        user_id: int,
    ) -> dict | None:
        diagnosis = await self.diagnosis_repo.get_by_id(analysis_id)
        if not diagnosis or diagnosis.user_id != user_id:
            return None

        response_language = "ar" if language == "ar" else "en"
        predicted_label = diagnosis.disease_type
        profile = get_profile(predicted_label)
        display_name = canonical_display_name(predicted_label, response_language)
        confidence = float(diagnosis.probability) if diagnosis.probability is not None else 0.0

        report = {
            "report_title": "التقرير النهائي للاستشارة" if response_language == "ar" else "Final Consultation Report",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "analysis_id": diagnosis.id,
            "diagnosis": {
                "predicted_label": predicted_label,
                "display_name": display_name,
                "confidence": confidence,
                "is_ai_result": True,
            },
            "summary": self._final_report_summary(
                language=response_language,
                display_name=display_name,
                confidence=confidence,
            ),
            "patient_questions_summary": self._patient_questions_summary(messages, response_language),
            "general_care_guidance": self._final_report_care(profile, response_language),
            "common_treatment_options": self._final_report_treatment(profile, response_language),
            "red_flags": self._final_report_red_flags(profile, response_language),
            "doctor_questions": self._final_report_doctor_questions(response_language),
            "disclaimer": self._final_report_disclaimer(response_language),
        }

        validated_report, validation_reason = self._validate_final_report(report, predicted_label, response_language)
        self._log_final_report(
            analysis_id=analysis_id,
            predicted_label=predicted_label,
            validation_reason=validation_reason,
        )
        return validated_report

    def _final_report_summary(self, *, language: str, display_name: str, confidence: float) -> str:
        confidence_percent = confidence * 100 if confidence <= 1 else confidence
        if language == "ar":
            return (
                f"تشير نتيجة الذكاء الاصطناعي إلى {display_name} بنسبة ثقة تقريبًا {confidence_percent:.1f}%. "
                "هذه نتيجة مبدئية تساعد على الفهم والتوعية، وليست تشخيصًا طبيًا نهائيًا."
            )
        return (
            f"The AI-assisted result suggests {display_name} with confidence around {confidence_percent:.1f}%. "
            "This is a preliminary educational result, not a final medical diagnosis."
        )

    def _patient_questions_summary(self, messages: list[dict], language: str) -> list[str]:
        user_text = " ".join(
            self._clean_report_message(message.get("content", ""))
            for message in messages
            if message.get("role") == "user"
        )
        normalized = user_text.lower()
        is_ar = language == "ar"
        topics: list[str] = []

        def add(condition: bool, ar_text: str, en_text: str) -> None:
            if condition:
                topics.append(ar_text if is_ar else en_text)

        add(
            self._has_any(normalized, ("تشخيص", "النتيجة", "نتيجة", "اسم المرض", "diagnosis", "result")),
            "سأل المريض عن نتيجة التشخيص واسم الحالة.",
            "The patient asked about the diagnosis result and condition name.",
        )
        add(
            self._has_any(normalized, ("خطير", "اموت", "موت", "مميت", "قاتل", "طوارئ", "danger", "die", "death", "fatal", "urgent")),
            "أبدى المريض قلقًا من خطورة الحالة ومتى يحتاج إلى رعاية عاجلة.",
            "The patient expressed concern about danger level and when urgent care is needed.",
        )
        add(
            self._has_any(normalized, ("معدي", "ينتقل", "بيعدي", "عدوى", "contagious", "spread", "transmission")),
            "سأل المريض هل الحالة معدية أو يمكن أن تنتقل للآخرين.",
            "The patient asked whether the condition is contagious or can spread to others.",
        )
        add(
            self._has_any(normalized, ("علاج", "دواء", "ادويه", "أدوية", "كريم", "treatment", "medicine", "cream")),
            "سأل المريض عن الإرشادات العامة للعناية والخيارات العلاجية الشائعة.",
            "The patient asked about general care guidance and common treatment options.",
        )
        add(
            self._has_any(normalized, ("اطفال", "الأطفال", "الاطفال", "كبار", "children", "kids", "adults", "elderly")),
            "سأل المريض هل يمكن أن تظهر الحالة عند الأطفال أو الكبار.",
            "The patient asked whether the condition can affect children or adults.",
        )
        add(
            self._has_any(normalized, ("جرعة", "جرعه", "كام مره", "مدة", "مده", "dose", "dosage", "duration", "how often")),
            "سأل المريض عن الجرعة أو عدد مرات الاستخدام أو مدة العلاج، وهي أمور يجب أن يحددها الطبيب.",
            "The patient asked about dose, frequency, or duration, which must be decided by a doctor.",
        )
        add(
            self._has_any(normalized, ("طبيب", "دكتور", "اسئلة", "أسئلة", "doctor", "dermatologist", "questions")),
            "سأل المريض عن الأسئلة المناسبة التي يمكن طرحها على طبيب الجلدية.",
            "The patient asked what questions to discuss with the dermatologist.",
        )

        if topics:
            return topics[:7]

        if not user_text.strip():
            return [
                "لم يتم إرسال أسئلة في المحادثة قبل إنشاء التقرير." if is_ar
                else "No patient questions were sent before generating this report."
            ]

        return [
            "ناقش المريض الحالة بشكل عام، وتم إعداد التقرير بناءً على نتيجة التشخيص والإرشادات الآمنة." if is_ar
            else "The patient discussed the condition generally, so this report is based on the diagnosis result and safe guidance."
        ]

    def _final_report_care(self, profile, language: str) -> list[str]:
        facts = get_safety_facts(profile.display_en if profile else None)
        if language == "ar":
            if facts:
                guidance = []
                if facts.contagion_ar:
                    guidance.append(facts.contagion_ar)
                if facts.age_groups_ar:
                    guidance.append(facts.age_groups_ar)
                guidance.extend(facts.care_ar)
                if guidance:
                    return guidance
            return ["اتبع عناية لطيفة بالجلد.", "تجنب الحك أو استخدام علاجات عشوائية.", "راجع طبيب الجلدية إذا استمرت الأعراض أو ساءت."]
        if facts:
            guidance = []
            if facts.contagion_en:
                guidance.append(facts.contagion_en)
            if facts.age_groups_en:
                guidance.append(facts.age_groups_en)
            guidance.extend(facts.care_en)
            if guidance:
                return guidance
        return ["Use gentle skin care.", "Avoid scratching or random treatments.", "Consult a dermatologist if symptoms persist or worsen."]

    def _final_report_treatment(self, profile, language: str) -> list[str]:
        facts = get_safety_facts(profile.display_en if profile else None)
        if language == "ar":
            if facts and facts.treatment_ar:
                return list(facts.treatment_ar)
            return [
                "هذه إرشادات عامة وليست وصفة علاجية شخصية.",
                "يجب أن يحدد طبيب الجلدية العلاج والجرعة والمدة المناسبة.",
            ]
        if facts and facts.treatment_en:
            return list(facts.treatment_en)
        return [
            "These are general options, not a personal prescription.",
            "A dermatologist must determine the appropriate treatment, dose, and duration.",
        ]

    def _final_report_red_flags(self, profile, language: str) -> list[str]:
        facts = get_safety_facts(profile.display_en if profile else None)
        if language == "ar":
            if facts and facts.urgent_red_flags_ar:
                return list(facts.urgent_red_flags_ar)
            return ["ألم شديد أو انتشار سريع", "صديد أو علامات عدوى", "أعراض عامة شديدة أو قلق واضح"]
        if facts and facts.urgent_red_flags_en:
            return list(facts.urgent_red_flags_en)
        return ["Severe pain or rapid spread", "Pus or signs of infection", "Severe general symptoms or significant concern"]

    def _final_report_doctor_questions(self, language: str) -> list[str]:
        if language == "ar":
            return [
                "ما مدى دقة التشخيص؟",
                "هل أحتاج فحص سريري أو تحاليل؟",
                "ما المحفزات المحتملة لحالتي؟",
                "ما العلاج المناسب ومدة المتابعة؟",
                "ما العلامات التي تستدعي الطوارئ؟",
                "هل الحالة معدية؟",
                "كيف أتجنب تكرارها أو زيادتها؟",
            ]
        return [
            "How accurate is the diagnosis?",
            "Do I need a clinical exam or tests?",
            "What are the possible triggers for my case?",
            "What treatment is appropriate and how should follow-up be planned?",
            "Which signs require urgent care?",
            "Is the condition contagious?",
            "How can I avoid recurrence or worsening?",
        ]

    def _final_report_disclaimer(self, language: str) -> str:
        if language == "ar":
            return (
                "هذا التقرير للتوعية فقط ومبني على نتيجة ذكاء اصطناعي ومحادثة مساعدة، "
                "ولا يُعد تشخيصًا نهائيًا أو وصفة علاجية. يجب مراجعة طبيب جلدية لتأكيد التشخيص وتحديد العلاج المناسب."
            )
        return (
            "This report is for educational purposes only and is based on an AI-assisted result and chat summary. "
            "It is not a final diagnosis or a personal prescription. Please consult a dermatologist to confirm the diagnosis and determine appropriate treatment."
        )

    def _validate_final_report(self, report: dict, predicted_label: str, language: str) -> tuple[dict, str]:
        sanitized = self._sanitize_report(report)
        profile = get_profile(predicted_label)
        text = self._report_text(sanitized)
        if profile and profile.key == "urticaria" and self._has_unsafe_urticaria_text(text):
            # The deterministic builder should not hit this path, but keep a safe repair
            # path so future wording or optional LLM summaries cannot leak unsafe facts.
            facts = get_safety_facts(predicted_label)
            if language == "ar" and facts:
                sanitized["general_care_guidance"] = list(facts.care_ar)
                sanitized["common_treatment_options"] = list(facts.treatment_ar)
                sanitized["red_flags"] = list(facts.urgent_red_flags_ar)
            elif facts:
                sanitized["general_care_guidance"] = list(facts.care_en)
                sanitized["common_treatment_options"] = list(facts.treatment_en)
                sanitized["red_flags"] = list(facts.urgent_red_flags_en)
            return sanitized, "repaired_unsafe_urticaria_text"
        return sanitized, "passed"

    def _sanitize_report(self, value):
        if isinstance(value, str):
            return value.replace("الانفجار التحسسي", "تفاعل تحسسي شديد").replace("Formation", "")
        if isinstance(value, list):
            return [self._sanitize_report(item) for item in value]
        if isinstance(value, dict):
            return {key: self._sanitize_report(item) for key, item in value.items()}
        return value

    def _report_text(self, report: dict) -> str:
        parts: list[str] = []

        def collect(value) -> None:
            if isinstance(value, str):
                parts.append(value)
            elif isinstance(value, list):
                for item in value:
                    collect(item)
            elif isinstance(value, dict):
                for item in value.values():
                    collect(item)

        collect(report)
        return "\n".join(parts)

    def _has_unsafe_urticaria_text(self, text: str) -> bool:
        normalized = text.lower()
        always_bad = ("الغثيان", "الشرى / الأرتيكاريا (التهاب الجلد)", "formation")
        if any(term in normalized for term in always_bad):
            return True
        positive_phrases = (
            "ينتقل باللمس",
            "ينتقل بالتقبيل",
            "ينتقل من شخص لآخر",
            "ينتقل من شخص لاخر",
            "spread by touch",
            "spread through touch",
            "spread through kissing",
            "spreads from person to person",
            "is contagious",
        )
        return any(self._positive_claim_present(normalized, phrase) for phrase in positive_phrases)

    def _positive_claim_present(self, text: str, phrase: str) -> bool:
        start = 0
        while True:
            index = text.find(phrase, start)
            if index == -1:
                return False
            prefix = text[max(0, index - 18):index]
            if not any(marker in prefix for marker in ("لا", "ليس", "ليست", "not ", "does not", "is not", "isn't")):
                return True
            start = index + len(phrase)

    def _clean_report_message(self, value: str) -> str:
        return re.sub(r"\s+", " ", str(value or "")).strip()[:500]

    def _has_any(self, text: str, terms: tuple[str, ...]) -> bool:
        return any(term.lower() in text for term in terms)

    def _log_final_report(self, analysis_id: int, predicted_label: str, validation_reason: str) -> None:
        if settings.ENVIRONMENT != "development":
            return
        logger.info(
            "RAG final report debug: analysis_id=%s predicted_label=%s post_generation_validation=%s",
            analysis_id,
            predicted_label,
            validation_reason,
        )

    def _build_sources(self, chunks: list[SearchResult]) -> list[dict]:
        sources = []
        for chunk in chunks:
            snippet = self._clean_source_snippet(chunk.text)
            if not snippet:
                continue
            if len(snippet) > settings.RAG_SOURCE_SNIPPET_CHARS:
                snippet = f"{snippet[:settings.RAG_SOURCE_SNIPPET_CHARS].rstrip()}..."
            sources.append({"source": chunk.source, "snippet": snippet})
        return sources

    def _disclaimer(self, language: str) -> str:
        if language == "ar":
            return "هذه المعلومات للتوعية فقط ولا تغني عن استشارة الطبيب أو التشخيص الطبي المتخصص."
        return "This information is educational only and is not a substitute for professional medical advice."

    def _rag_label(self, predicted_label: str) -> str:
        profile = get_profile(predicted_label)
        return profile.display_en if profile else predicted_label

    def _should_use_llm(self, intents: list[str]) -> bool:
        allowed = {
            "diagnosis_result",
            "diagnosis_confirmation",
            "overview",
            "treatment",
            "prescription_request",
            "urgent_care",
            "symptoms",
            "prevention_care",
            "contagion_transmission",
            "doctor_questions",
            "age_groups",
        }
        blocked = {"out_of_scope", "non_derm_emergency", "dosage_duration", "unclear_medical"}
        return bool(intents) and not any(intent in blocked for intent in intents) and all(intent in allowed for intent in intents)

    def _requires_deterministic_answer(self, intents: list[str]) -> bool:
        deterministic_intents = {
            "diagnosis_result",
            "contagion_transmission",
            "urgent_care",
            "dosage_duration",
            "doctor_questions",
            "age_groups",
        }
        return any(intent in deterministic_intents for intent in intents)

    def _llm_provider(self) -> str:
        provider = (settings.RAG_LLM_PROVIDER or "").lower().strip()
        if provider in {"openai", "xai", "groq"}:
            return provider
        return ""

    def _fallback_reason(self, *reasons: object) -> str | None:
        selected = [str(reason) for reason in reasons if reason]
        return ";".join(selected) if selected else None

    async def _resolve_intent(
        self,
        *,
        message: str,
        rag_label: str,
        response_language: str,
        local_intent: str,
        local_intents: list[str],
    ) -> dict[str, object]:
        if has_life_danger_terms(message):
            return {
                "final_intent": "urgent_care",
                "final_intents": self._order_intents(local_intents if "urgent_care" in local_intents else [*local_intents, "urgent_care"]),
                "semantic_intent": None,
                "semantic_intents": None,
                "semantic_confidence": None,
                "fallback_reason": "hard_urgent_override",
            }

        hard_guard_intent = self.semantic_intent_classifier.hard_guard_intent(message)
        if hard_guard_intent:
            return {
                "final_intent": hard_guard_intent,
                "final_intents": [hard_guard_intent],
                "semantic_intent": None,
                "semantic_intents": None,
                "semantic_confidence": None,
                "fallback_reason": "hard_guard",
            }

        fallback_reason = "semantic_classifier_not_configured"
        semantic_result = None
        if self.semantic_intent_classifier.is_configured():
            semantic_result = await self.semantic_intent_classifier.classify(
                message=message,
                predicted_label=rag_label,
                language=response_language,
                local_intent=local_intent,
            )
            fallback_reason = "semantic_classifier_failed"

        if semantic_result:
            return {
                "final_intent": semantic_result.intent,
                "final_intents": self._order_intents(list(semantic_result.intents)),
                "semantic_intent": semantic_result.intent,
                "semantic_intents": list(semantic_result.intents),
                "semantic_confidence": semantic_result.confidence,
                "fallback_reason": None,
            }

        return {
            "final_intent": local_intent,
            "final_intents": self._order_intents(local_intents),
            "semantic_intent": None,
            "semantic_intents": None,
            "semantic_confidence": None,
            "fallback_reason": fallback_reason,
        }

    def _order_intents(self, intents: list[str]) -> list[str]:
        selected = []
        for intent in ANSWER_INTENT_ORDER:
            if intent in intents and intent not in selected:
                selected.append(intent)
        for intent in intents:
            if intent not in selected:
                selected.append(intent)
        return selected or ["overview"]

    def _retrieve_for_intents(
        self,
        *,
        query: str,
        rag_label: str,
        intents: list[str],
    ) -> list[SearchResult]:
        retrieval_intents = [
            intent for intent in intents
            if intent not in {"out_of_scope", "non_derm_emergency", "dosage_duration", "unclear_medical"}
        ]
        if not retrieval_intents:
            return []

        selected: list[SearchResult] = []
        seen: set[str] = set()
        for retrieval_intent in retrieval_intents:
            chunks = self.retriever.retrieve(
                query=query,
                top_k=settings.RAG_TOP_K,
                predicted_label=rag_label,
                intent=retrieval_intent,
            )
            for chunk in chunks:
                key = chunk.chunk_id or chunk.text[:220]
                if key in seen:
                    continue
                seen.add(key)
                selected.append(chunk)
                if len(selected) >= settings.RAG_TOP_K * 2:
                    return selected
        return selected

    def _validate_provider_answer(
        self,
        *,
        answer: str,
        predicted_label: str,
        intents: list[str],
        language: str,
    ) -> ValidationResult:
        corrected = (answer or "").replace("الانفجار التحسسي", "تفاعل تحسسي شديد")
        if language == "ar" and "Formation" in corrected:
            return ValidationResult(None, "discarded", "arabic_answer_contains_english_formation")

        profile = get_profile(predicted_label)
        normalized = corrected.lower()
        if profile and profile.key == "urticaria":
            bad_phrases = (
                "الغثيان",
                "ينتقل من شخص لآخر",
                "ينتقل من شخص لاخر",
                "ينتقل باللمس",
                "ينتقل بالتقبيل",
                "معدي",
                "التهاب الجلد",
                "formation",
                "العلاجات المضادة للالتهاب",
                "touching",
                "kissing",
                "shared items",
                "spread from person to person",
                "contagious",
            )
            if any(phrase in normalized for phrase in bad_phrases):
                return ValidationResult(None, "discarded", "unsafe_urticaria_contagion_or_naming")

        if "الغثيان" in corrected or "Formation" in corrected:
            return ValidationResult(None, "discarded", "bad_medical_wording")

        return ValidationResult(corrected, "passed")

    def _clean_source_snippet(self, text: str) -> str:
        if "A:" in text:
            answer_lines = []
            for answer_match in re.finditer(r"A:\s*(.*?)(?=\nQ:|\n={3,}|\Z)", text, flags=re.DOTALL):
                for line in answer_match.group(1).splitlines():
                    cleaned = self._clean_source_line(line)
                    if cleaned:
                        answer_lines.append(cleaned)
            if answer_lines:
                return self._dedupe_source_lines(answer_lines)

        cleaned_lines = []
        for line in text.splitlines():
            cleaned = self._clean_source_line(line)
            if cleaned:
                cleaned_lines.append(cleaned)

        return self._dedupe_source_lines(cleaned_lines)

    def _clean_source_line(self, line: str) -> str:
        stripped = line.strip()
        if not stripped or re.fullmatch(r"=+", stripped):
            return ""
        if stripped.startswith("Q:"):
            return ""
        stripped = re.sub(r"^[A]:\s*", "", stripped)
        stripped = re.sub(r"^\d+[.)]\s*", "", stripped)
        blocked_prefixes = (
            "DERMATOLOGICAL",
            "RAG-Optimized",
            "DISEASE #",
            "Classification:",
            "Tags:",
        )
        if stripped.startswith(blocked_prefixes):
            return ""
        return stripped

    def _dedupe_source_lines(self, lines: list[str]) -> str:
        deduped = []
        seen = set()
        for line in lines:
            key = re.sub(r"\s+", " ", line.lower()).strip()
            if key in seen:
                continue
            seen.add(key)
            deduped.append(line)
            if len(deduped) >= 8:
                break

        return "\n".join(deduped).strip()

    def _log_development_request(
        self,
        analysis_id: int,
        predicted_label: str,
        local_intent: str,
        semantic_intent: object,
        semantic_intents: object,
        final_intent: str,
        final_intents: object,
        semantic_confidence: object,
        generation_provider: str,
        fallback_reason: object,
        post_generation_validation: object,
        validation_reason: object,
    ) -> None:
        if settings.ENVIRONMENT != "development":
            return

        logger.info(
            (
                "RAG chat debug: analysis_id=%s predicted_label=%s local_intent=%s "
                "semantic_intent=%s semantic_intents=%s final_intent=%s final_intents=%s semantic_confidence=%s "
                "generation_provider=%s fallback_reason=%s post_generation_validation=%s validation_reason=%s"
            ),
            analysis_id,
            predicted_label,
            local_intent,
            semantic_intent,
            semantic_intents,
            final_intent,
            final_intents,
            semantic_confidence,
            generation_provider,
            fallback_reason,
            post_generation_validation,
            validation_reason,
        )
