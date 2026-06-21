"""Optional OpenAI-backed answer generation for DermaVision RAG."""
from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import settings
from app.infrastructure.rag.disease_profiles import canonical_name_instructions
from app.infrastructure.rag.vector_store import SearchResult

logger = logging.getLogger(__name__)


class OpenAIGenerator:
    """Generate RAG answers with OpenAI when explicitly configured."""

    def is_configured(self) -> bool:
        return (
            (settings.RAG_LLM_PROVIDER or "").lower() == "openai"
            and bool(settings.OPENAI_API_KEY)
        )

    async def generate(
        self,
        *,
        message: str,
        intent: str,
        language: str,
        diagnosis_context: dict[str, Any],
        chunks: list[SearchResult],
    ) -> str | None:
        if not self.is_configured():
            return None

        try:
            from openai import AsyncOpenAI
        except ImportError:
            logger.warning("OpenAI SDK is not installed; falling back to local RAG generator")
            return None

        try:
            model = settings.RAG_LLM_MODEL or "gpt-4o-mini"
            client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=settings.RAG_LLM_TIMEOUT_SECONDS or 20,
            )
            response = await client.chat.completions.create(
                model=model,
                messages=self._messages(
                    message=message,
                    intent=intent,
                    language=language,
                    diagnosis_context=diagnosis_context,
                    chunks=chunks,
                ),
                temperature=0.1,
                max_tokens=settings.RAG_LLM_MAX_OUTPUT_TOKENS or 700,
            )
            content = response.choices[0].message.content if response.choices else None
            answer = self._extract_text(content)
            return answer or None
        except Exception as exc:
            logger.warning("OpenAI RAG generation failed; falling back to local generator: %s", exc.__class__.__name__)
            return None

    def _messages(
        self,
        *,
        message: str,
        intent: str,
        language: str,
        diagnosis_context: dict[str, Any],
        chunks: list[SearchResult],
    ) -> list[dict[str, str]]:
        return [
            {
                "role": "system",
                "content": self._system_prompt(language=language, intent=intent),
            },
            {
                "role": "user",
                "content": self._user_prompt(
                    message=message,
                    intent=intent,
                    language=language,
                    diagnosis_context=diagnosis_context,
                    chunks=chunks,
                ),
            },
        ]

    def _system_prompt(self, *, language: str, intent: str) -> str:
        output_language = "Arabic" if language == "ar" else "English"
        return (
            "You are DermaVision Assistant, a safe educational dermatology RAG assistant.\n"
            f"Answer in {output_language}.\n"
            f"Detected intent: {intent}.\n"
            "Use only the selected diagnosis context and retrieved knowledge-base context.\n"
            "Use the canonical disease name exactly as provided in the user prompt.\n"
            "Do not invent disease names or replace the predicted disease with only a generic term such as allergy.\n"
            "Do not translate Urticaria as nausea, vomiting, or الغثيان.\n"
            "If the diagnosis is Urticaria and the answer is Arabic, write الشرى / الأرتيكاريا (Urticaria).\n"
            "Never call Urticaria التهاب الجلد.\n"
            "Never write الشرى / الأرتيكاريا (التهاب الجلد).\n"
            "Never say Urticaria is contagious.\n"
            "Never say Urticaria spreads by touch, kissing, shared towels, shared items, or person-to-person contact.\n"
            "If asked هل معدي or is it contagious for Urticaria, answer لا / No and explain that hives itself is not contagious.\n"
            "Avoid the inaccurate Arabic phrase الانفجار التحسسي. Use تفاعل تحسسي شديد or صدمة تحسسية when medically appropriate.\n"
            "Keep Arabic answers fully Arabic except for the canonical English disease name in parentheses.\n"
            "Do not mix random English words like Formation into Arabic answers.\n"
            "Do not invent medical facts, medicines, sources, doses, frequency, or treatment duration.\n"
            "Do not provide a personal prescription or say that a treatment is definitely appropriate for this user.\n"
            "If the retrieved context is insufficient, say the knowledge base does not contain enough information.\n"
            "Keep the answer concise and conversational, not a long report.\n"
            "Do not include a full medical disclaimer paragraph; the UI displays a separate disclaimer.\n"
            "A short safety sentence is allowed when the user asks about treatment, prescription, dosage, or urgent care.\n"
            "For strong treatments such as Methotrexate, systemic steroids, biological treatment, chemotherapy, oncology referral, or phototherapy, state that they are only under medical supervision.\n"
            "For out-of-scope or unrelated requests, provide only the scoped refusal.\n"
            "For dosage/duration requests, do not give a dose or duration unless explicitly present in retrieved context, and still say a dermatologist must decide.\n"
            "For diagnosis_confirmation, answer briefly using the diagnosis context and say the AI result should be confirmed by a dermatologist.\n"
            "For contagion_transmission, answer directly from retrieved context and avoid unrelated report sections.\n"
            "For doctor_questions, provide practical questions to ask a dermatologist, not only emergency red flags.\n"
            "If asked about death or life danger, answer carefully: usually the condition is not life-threatening, but urgent care is needed for breathing difficulty, swelling of the face/lips/tongue/throat, severe dizziness, fainting, or signs of a severe allergic reaction.\n"
            "If Detected intent contains multiple intents separated by '+', answer each medical part in a single concise chatbot response.\n"
            "If one part is out_of_scope but another part is medical, answer the medical part and briefly say the unrelated part is outside scope.\n"
        )

    def _user_prompt(
        self,
        *,
        message: str,
        intent: str,
        language: str,
        diagnosis_context: dict[str, Any],
        chunks: list[SearchResult],
    ) -> str:
        context = self._context_text(chunks)
        canonical_names = canonical_name_instructions(str(diagnosis_context.get("predicted_label", "")))
        return (
            f"User question:\n{message}\n\n"
            f"Language code: {language}\n"
            f"Intent: {intent}\n\n"
            f"Diagnosis context JSON:\n{json.dumps(diagnosis_context, ensure_ascii=False)}\n\n"
            f"Canonical disease naming rules:\n{canonical_names}\n\n"
            f"Retrieved knowledge-base context:\n{context or 'No retrieved context was available.'}\n\n"
            "Write the final answer only. Do not output JSON. Do not invent sources."
        )

    def _context_text(self, chunks: list[SearchResult]) -> str:
        lines: list[str] = []
        for index, chunk in enumerate(chunks, start=1):
            text = self._clean_context(chunk.text)
            if not text:
                continue
            lines.append(
                f"[{index}] source={chunk.source}; disease_tags={list(chunk.disease_tags)}\n"
                f"{text[:1400].strip()}"
            )
        return "\n\n".join(lines)

    def _clean_context(self, text: str) -> str:
        return "\n".join(
            line.strip()
            for line in (text or "").splitlines()
            if line.strip() and not set(line.strip()) == {"="}
        )

    def _extract_text(self, content: Any) -> str:
        if isinstance(content, str):
            return content.strip()
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, dict) and isinstance(item.get("text"), str):
                    parts.append(item["text"])
            return "\n".join(parts).strip()
        return ""
