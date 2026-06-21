"""Small local lexical vector store for RAG retrieval."""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from app.infrastructure.rag.disease_profiles import detect_disease_keys
from app.infrastructure.rag.text_splitter import TextChunk

TOKEN_PATTERN = re.compile(r"[\w\u0600-\u06FF]+", re.UNICODE)
INDEX_VERSION = 2


@dataclass(frozen=True)
class StoredChunk:
    chunk_id: str
    source: str
    text: str
    terms: dict[str, int]
    disease_tags: tuple[str, ...] = ()


@dataclass(frozen=True)
class SearchResult:
    chunk_id: str
    source: str
    text: str
    score: float
    disease_tags: tuple[str, ...] = ()


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(text or "") if len(token) > 1]


class LocalVectorStore:
    """Persist and search a lightweight TF-IDF-like index."""

    def __init__(self, index_dir: str):
        self.index_dir = Path(index_dir)
        self.index_path = self.index_dir / "index.json"
        self.chunks: list[StoredChunk] = []
        self.document_frequencies: Counter[str] = Counter()

    def load_or_build(
        self,
        chunks: list[TextChunk],
        source_mtime: float | None,
        source_size: int | None,
    ) -> None:
        if self._load_if_fresh(source_mtime, source_size):
            return
        self.build(chunks, source_mtime, source_size)

    def build(
        self,
        chunks: list[TextChunk],
        source_mtime: float | None,
        source_size: int | None,
    ) -> None:
        self.chunks = []
        self.document_frequencies = Counter()

        for chunk in chunks:
            disease_tags = tuple(sorted(set(chunk.disease_tags).union(detect_disease_keys(chunk.text))))
            terms = Counter(tokenize(chunk.text))
            self.chunks.append(StoredChunk(
                chunk_id=chunk.chunk_id,
                source=chunk.source,
                text=chunk.text,
                terms=dict(terms),
                disease_tags=disease_tags,
            ))
            self.document_frequencies.update(set(terms.keys()))

        self._save(source_mtime, source_size)

    def search(self, query: str, top_k: int = 4) -> list[SearchResult]:
        query_terms = Counter(tokenize(query))
        if not query_terms or not self.chunks:
            return []

        total_docs = len(self.chunks)
        results: list[SearchResult] = []

        for chunk in self.chunks:
            score = 0.0
            chunk_length = max(sum(chunk.terms.values()), 1)

            for term, query_count in query_terms.items():
                term_count = chunk.terms.get(term, 0)
                if term_count == 0:
                    continue

                tf = term_count / chunk_length
                idf = math.log((1 + total_docs) / (1 + self.document_frequencies.get(term, 0))) + 1
                score += query_count * tf * idf

            if score > 0:
                results.append(SearchResult(
                    chunk_id=chunk.chunk_id,
                    source=chunk.source,
                    text=chunk.text,
                    score=score,
                    disease_tags=chunk.disease_tags,
                ))

        return sorted(results, key=lambda result: result.score, reverse=True)[:top_k]

    def _load_if_fresh(self, source_mtime: float | None, source_size: int | None) -> bool:
        if not self.index_path.exists():
            return False

        try:
            data = json.loads(self.index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return False

        if data.get("index_version") != INDEX_VERSION:
            return False
        if data.get("source_mtime") != source_mtime or data.get("source_size") != source_size:
            return False

        self.chunks = [
            StoredChunk(
                chunk_id=item["chunk_id"],
                source=item["source"],
                text=item["text"],
                terms=item["terms"],
                disease_tags=tuple(item.get("disease_tags", ())),
            )
            for item in data.get("chunks", [])
        ]
        self.document_frequencies = Counter(data.get("document_frequencies", {}))
        return True

    def _save(self, source_mtime: float | None, source_size: int | None) -> None:
        self.index_dir.mkdir(parents=True, exist_ok=True)
        data = {
            "index_version": INDEX_VERSION,
            "source_mtime": source_mtime,
            "source_size": source_size,
            "document_frequencies": dict(self.document_frequencies),
            "chunks": [
                {
                    "chunk_id": chunk.chunk_id,
                    "source": chunk.source,
                    "text": chunk.text,
                    "terms": chunk.terms,
                    "disease_tags": list(chunk.disease_tags),
                }
                for chunk in self.chunks
            ],
        }
        self.index_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
