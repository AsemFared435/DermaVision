"""Optional xAI/Grok-backed answer generation for DermaVision RAG."""
from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings
from app.infrastructure.rag.openai_generator import OpenAIGenerator
from app.infrastructure.rag.vector_store import SearchResult

logger = logging.getLogger(__name__)


class XaiGenerator(OpenAIGenerator):
    """Generate RAG answers with xAI/Grok through the OpenAI-compatible API."""

    def is_configured(self) -> bool:
        return (
            (settings.RAG_LLM_PROVIDER or "").lower() == "xai"
            and bool(settings.XAI_API_KEY)
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
            logger.warning("OpenAI-compatible SDK is not installed; falling back to local RAG generator")
            return None

        try:
            client = AsyncOpenAI(
                api_key=settings.XAI_API_KEY,
                base_url=settings.XAI_BASE_URL or "https://api.x.ai/v1",
                timeout=settings.RAG_LLM_TIMEOUT_SECONDS or 20,
            )
            response = await client.chat.completions.create(
                model=settings.RAG_LLM_MODEL or "grok-4.3",
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
            logger.warning("xAI RAG generation failed; falling back to local generator: %s", exc.__class__.__name__)
            return None
