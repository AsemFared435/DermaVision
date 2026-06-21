"""Load RAG knowledge-base documents from local text files."""
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class LoadedDocument:
    source: str
    text: str
    path: Path
    mtime: float
    size: int


class DocumentLoader:
    """Loads the DermaVision RAG knowledge file."""

    def __init__(self, knowledge_path: str):
        self.knowledge_path = Path(knowledge_path)

    def load(self) -> LoadedDocument | None:
        path = self.knowledge_path
        if not path.exists() or not path.is_file():
            return None

        text = path.read_text(encoding="utf-8").strip()
        stat = path.stat()
        return LoadedDocument(
            source=path.name,
            text=text,
            path=path,
            mtime=stat.st_mtime,
            size=stat.st_size,
        )
