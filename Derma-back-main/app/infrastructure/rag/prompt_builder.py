"""Prompt builder for grounded medical RAG answers."""
from app.infrastructure.rag.vector_store import SearchResult


class PromptBuilder:
    """Build a constrained prompt for optional future LLM generation."""

    def build(
        self,
        message: str,
        predicted_label: str,
        confidence: float,
        chunks: list[SearchResult],
        language: str,
    ) -> str:
        context = "\n\n".join(
            f"[Source: {chunk.source}]\n{chunk.text}" for chunk in chunks
        )
        return (
            "You are DermaVision's medical education assistant.\n"
            "Answer only from the provided context. Do not invent medications, "
            "diagnoses, or treatment instructions. Say when context is insufficient. "
            "Mention that strong medications or specialist treatments are only under "
            "medical supervision. Always include a medical disclaimer.\n\n"
            f"Language: {language}\n"
            f"Diagnosis context: {predicted_label}, confidence={confidence:.2f}\n"
            f"User question: {message}\n\n"
            f"Retrieved context:\n{context}"
        )
