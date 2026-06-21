"""Optional OpenAI-compatible semantic intent classification for RAG chat."""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any

from app.core.config import settings
from app.infrastructure.rag.intent import (
    NON_DERM_EMERGENCY_TERMS,
    OUT_OF_SCOPE_TERMS,
    contains_arabic,
    detect_question_intents,
    normalize_arabic,
)
from app.infrastructure.rag.disease_profiles import normalize_text

logger = logging.getLogger(__name__)

ALLOWED_INTENTS = {
    "diagnosis_result",
    "diagnosis_confirmation",
    "overview",
    "symptoms",
    "treatment",
    "prescription_request",
    "dosage_duration",
    "urgent_care",
    "contagion_transmission",
    "prevention_care",
    "doctor_questions",
    "age_groups",
    "unclear_medical",
    "out_of_scope",
    "non_derm_emergency",
}

MIN_SEMANTIC_CONFIDENCE = 0.45


@dataclass(frozen=True)
class SemanticIntentResult:
    intent: str
    intents: tuple[str, ...]
    confidence: float
    reason: str = ""


class SemanticIntentClassifier:
    """Use the configured OpenAI-compatible provider to classify RAG questions."""

    def is_configured(self) -> bool:
        provider = self._provider()
        if provider == "openai":
            return bool(settings.OPENAI_API_KEY)
        if provider == "xai":
            return bool(settings.XAI_API_KEY)
        if provider == "groq":
            return bool(settings.GROQ_API_KEY)
        return False

    def hard_guard_intent(self, message: str) -> str | None:
        """Return an intent for clearly invalid/unrelated messages without calling OpenAI."""
        text = normalize_text(normalize_arabic(message))
        if not text:
            return "unclear_medical"
        if not re.search(r"[a-z\u0600-\u06FF]", text):
            return "out_of_scope"
        if self._contains_any(text, NON_DERM_EMERGENCY_TERMS):
            return "non_derm_emergency"
        if self._contains_any(text, OUT_OF_SCOPE_TERMS):
            local_intents = detect_question_intents(message)
            has_medical_part = any(
                intent not in {"out_of_scope", "non_derm_emergency", "unclear_medical"}
                for intent in local_intents
            )
            if has_medical_part:
                return None
            return "out_of_scope"
        return None

    async def classify(
        self,
        *,
        message: str,
        predicted_label: str,
        language: str,
        local_intent: str,
    ) -> SemanticIntentResult | None:
        if not self.is_configured():
            return None

        try:
            from openai import AsyncOpenAI
        except ImportError:
            logger.warning("OpenAI-compatible SDK is not installed; using local RAG intent detector")
            return None

        try:
            provider = self._provider()
            client_kwargs = {
                "api_key": self._api_key(provider),
                "timeout": settings.RAG_LLM_TIMEOUT_SECONDS or 20,
            }
            base_url = self._base_url(provider)
            if base_url:
                client_kwargs["base_url"] = base_url
            client = AsyncOpenAI(**client_kwargs)
            response = await client.chat.completions.create(
                model=settings.RAG_LLM_MODEL or self._default_model(provider),
                messages=self._messages(
                    message=message,
                    predicted_label=predicted_label,
                    language=language,
                    local_intent=local_intent,
                ),
                temperature=0,
                max_tokens=180,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content if response.choices else None
            result = self._parse_result(content)
            if not result:
                return None
            if result.confidence < MIN_SEMANTIC_CONFIDENCE:
                logger.info("Semantic intent confidence too low; using local detector")
                return None
            return result
        except Exception as exc:
            logger.warning("Semantic intent classification failed; using local detector: %s", exc.__class__.__name__)
            return None

    def _messages(
        self,
        *,
        message: str,
        predicted_label: str,
        language: str,
        local_intent: str,
    ) -> list[dict[str, str]]:
        return [
            {
                "role": "system",
                "content": self._system_prompt(),
            },
            {
                "role": "user",
                "content": (
                    f"User message:\n{message}\n\n"
                    f"Selected diagnosis label: {predicted_label}\n"
                    f"Requested language: {language}\n"
                    f"Contains Arabic: {contains_arabic(message)}\n"
                    f"Local keyword intent: {local_intent}\n\n"
                    "Classify the user's intent now."
                ),
            },
        ]

    def _system_prompt(self) -> str:
        return (
            "You classify user messages for DermaVision, a dermatology diagnosis-report RAG chat.\n"
            "Return JSON only with this shape: "
            '{"intent":"primary_intent","intents":["intent1","intent2"],"confidence":0.0,"reason":"short reason without medical advice"}.\n'
            "Keep backward compatibility by making intent the first/primary item in intents.\n"
            f"Allowed intents: {', '.join(sorted(ALLOWED_INTENTS))}.\n"
            "Choose one or more intents when the message asks compound questions. Do not provide medical advice.\n"
            "Use out_of_scope only when the message is clearly unrelated to the selected dermatology diagnosis/report.\n"
            "If the message could reasonably be about the selected skin diagnosis, choose the closest medical intent.\n"
            "Classify Arabic colloquial wording semantically, not only by exact keywords.\n\n"
            "Rules and examples:\n"
            "- 'ينفع تعرفني انا عندي اي', 'انا عندي اي', 'عندي مرض اي', 'اي المرض اللي طلع', 'ما اسم المرض', 'what is my diagnosis' => diagnosis_result.\n"
            "- 'يعني عندي تينيا؟', 'يعني المرض اسمه تنيا؟', 'so I have tinea?' => diagnosis_confirmation.\n"
            "- 'اي المرض دا', 'عرفني عن المرض', 'اشرح المرض', 'what is this condition' => overview.\n"
            "- 'هل معدي', 'بيتنقل ازاي', 'هل بيعدي', 'is it contagious', 'how does it spread' => contagion_transmission.\n"
            "- 'هل خطير', 'امتى اروح دكتور', 'red flags', 'urgent care' => urgent_care.\n"
            "- 'ممكن اموت', 'هموت', 'ممكن المرض يسبب موتي', 'can I die', 'will I die', 'can this disease kill me' => urgent_care.\n"
            "- 'يعني لو لقيت المرض شديد لازم اروح لدكتور' => urgent_care.\n"
            "- 'ما الأسئلة التي أطرحها على طبيب الجلدية؟', 'what questions should I ask the dermatologist?' => doctor_questions.\n"
            "- 'بيجي للاطفال', 'هل يصيب الأطفال', 'هل يصيب الكبار', 'can children get it?', 'can adults get it?' => age_groups.\n"
            "- 'العلاج اي', 'اخد علاج اي', 'في كريم', 'treatment options' => treatment, unless asking for a personal medicine or what to take, then prescription_request.\n"
            "- 'اي هو المرض الي عندي وهل هو خطير؟' => diagnosis_result + urgent_care.\n"
            "- 'ما اسم المرض وهل معدي؟' => diagnosis_result + contagion_transmission.\n"
            "- 'اي المرض ده وعلاجه اي؟' => diagnosis_result + treatment.\n"
            "- 'هل معدي واعمل ايه؟' => contagion_transmission + prevention_care.\n"
            "- 'اي المرض ده واعراضه اي؟' => diagnosis_result + symptoms.\n"
            "- 'What is my diagnosis and is it dangerous?' => diagnosis_result + urgent_care.\n"
            "- 'What is it and what are treatment options?' => diagnosis_result + treatment.\n"
            "- Dose, frequency, number of times, or duration questions => dosage_duration.\n"
            "- If the message mixes a medical question with unrelated coding/joke/etc., include the medical intents and out_of_scope.\n"
            "- Casual/unrelated requests like 'بتحبني', 'عامل ايه', jokes, coding, sports, politics, food, travel, or capitals => out_of_scope.\n"
            "- Serious non-dermatology emergency symptoms such as chest pain or severe breathing issues unrelated to skin => non_derm_emergency.\n"
            "- If the user wording is medical but too vague to know what they want => unclear_medical.\n"
        )

    def _parse_result(self, content: Any) -> SemanticIntentResult | None:
        if not isinstance(content, str) or not content.strip():
            return None
        raw = content.strip()
        if raw.startswith("```"):
            raw = re.sub(r"^```(?:json)?", "", raw, flags=re.IGNORECASE).strip()
            raw = re.sub(r"```$", "", raw).strip()

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return None

        raw_intents = data.get("intents")
        intents = self._parse_intents(raw_intents)
        intent = str(data.get("intent", "")).strip()
        if intent in ALLOWED_INTENTS and intent not in intents:
            intents = (intent, *intents)
        if not intents and intent in ALLOWED_INTENTS:
            intents = (intent,)
        if not intents:
            return None

        confidence = self._coerce_confidence(data.get("confidence"))
        reason = str(data.get("reason", "")).strip()[:160]
        return SemanticIntentResult(intent=intents[0], intents=intents, confidence=confidence, reason=reason)

    def _coerce_confidence(self, value: Any) -> float:
        try:
            confidence = float(value)
        except (TypeError, ValueError):
            return 0.0
        return min(max(confidence, 0.0), 1.0)

    def _contains_any(self, text: str, terms: tuple[str, ...]) -> bool:
        return any(normalize_text(normalize_arabic(term)) in text for term in terms)

    def _parse_intents(self, value: Any) -> tuple[str, ...]:
        if isinstance(value, str):
            candidates = [value]
        elif isinstance(value, list):
            candidates = [str(item).strip() for item in value]
        else:
            candidates = []

        selected = []
        for intent in candidates:
            if intent in ALLOWED_INTENTS and intent not in selected:
                selected.append(intent)
        return tuple(selected)

    def _provider(self) -> str:
        return (settings.RAG_LLM_PROVIDER or "").lower().strip()

    def _api_key(self, provider: str) -> str | None:
        if provider == "xai":
            return settings.XAI_API_KEY
        if provider == "groq":
            return settings.GROQ_API_KEY
        if provider == "openai":
            return settings.OPENAI_API_KEY
        return None

    def _base_url(self, provider: str) -> str | None:
        if provider == "xai":
            return settings.XAI_BASE_URL or "https://api.x.ai/v1"
        if provider == "groq":
            return settings.GROQ_BASE_URL or "https://api.groq.com/openai/v1"
        return None

    def _default_model(self, provider: str) -> str:
        if provider == "xai":
            return "grok-4.3"
        if provider == "groq":
            return "llama-3.1-8b-instant"
        return "gpt-4o-mini"
