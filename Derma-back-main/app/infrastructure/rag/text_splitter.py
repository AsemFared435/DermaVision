"""Simple text splitter for local RAG documents."""
from dataclasses import dataclass

from app.infrastructure.rag.document_loader import LoadedDocument
from app.infrastructure.rag.disease_profiles import detect_disease_keys


@dataclass(frozen=True)
class TextChunk:
    chunk_id: str
    source: str
    text: str
    disease_tags: tuple[str, ...] = ()


class TextSplitter:
    """Split text into overlapping character chunks without external dependencies."""

    def __init__(self, chunk_size: int = 900, chunk_overlap: int = 150):
        self.chunk_size = max(200, chunk_size)
        self.chunk_overlap = max(0, min(chunk_overlap, self.chunk_size // 2))

    def split(self, document: LoadedDocument | None) -> list[TextChunk]:
        if document is None or not document.text:
            return []

        paragraphs = [p.strip() for p in document.text.splitlines() if p.strip()]
        chunks: list[TextChunk] = []
        buffer = ""
        buffer_tags: set[str] = set()
        current_tags: set[str] = set()

        for paragraph in paragraphs:
            paragraph_tags = set(detect_disease_keys(paragraph))
            starts_new_topic = paragraph.startswith("Q:") or paragraph.startswith("DISEASE #")
            if starts_new_topic and paragraph_tags and buffer and buffer_tags and not paragraph_tags.intersection(buffer_tags):
                chunks.extend(self._split_text(buffer, document.source, len(chunks), tuple(sorted(buffer_tags))))
                buffer = ""
                buffer_tags = set()

            if paragraph.startswith("DISEASE #") and paragraph_tags:
                current_tags = paragraph_tags

            effective_tags = paragraph_tags or current_tags
            candidate = f"{buffer}\n\n{paragraph}".strip() if buffer else paragraph
            if len(candidate) <= self.chunk_size:
                buffer = candidate
                buffer_tags.update(effective_tags)
                continue

            if buffer:
                chunks.extend(self._split_text(buffer, document.source, len(chunks), tuple(sorted(buffer_tags))))
            buffer = paragraph
            buffer_tags = set(effective_tags)

        if buffer:
            chunks.extend(self._split_text(buffer, document.source, len(chunks), tuple(sorted(buffer_tags))))

        return chunks

    def _split_text(
        self,
        text: str,
        source: str,
        start_index: int,
        disease_tags: tuple[str, ...],
    ) -> list[TextChunk]:
        if len(text) <= self.chunk_size:
            return [TextChunk(
                chunk_id=f"{source}:{start_index}",
                source=source,
                text=text,
                disease_tags=disease_tags,
            )]

        chunks: list[TextChunk] = []
        start = 0
        index = start_index
        while start < len(text):
            end = min(len(text), start + self.chunk_size)
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(TextChunk(
                    chunk_id=f"{source}:{index}",
                    source=source,
                    text=chunk_text,
                    disease_tags=disease_tags,
                ))
                index += 1
            if end >= len(text):
                break
            start = max(end - self.chunk_overlap, start + 1)
        return chunks
