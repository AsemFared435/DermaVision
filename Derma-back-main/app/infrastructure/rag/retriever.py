"""RAG retriever built on the local vector store."""
from dataclasses import replace

from app.infrastructure.rag.disease_profiles import (
    KNOWN_DISEASE_KEYS,
    contains_alias,
    get_profile,
    has_treatment_content,
    is_treatment_question,
)
from app.infrastructure.rag.vector_store import LocalVectorStore, SearchResult


class Retriever:
    def __init__(self, vector_store: LocalVectorStore):
        self.vector_store = vector_store

    def retrieve(
        self,
        query: str,
        top_k: int = 4,
        predicted_label: str | None = None,
        intent: str = "overview",
    ) -> list[SearchResult]:
        profile = get_profile(predicted_label or query)
        expanded_query = self._expanded_query(query, profile)
        candidates = self.vector_store.search(query=expanded_query, top_k=max(top_k * 16, 48))
        if not candidates or profile is None:
            return candidates[:top_k]

        if profile.key == "healthy":
            return self._healthy_results(candidates, top_k)

        treatment_question = intent in {"treatment", "prescription_request"} or is_treatment_question(query)
        reranked: list[SearchResult] = []

        for result in candidates:
            disease_match = profile.key in result.disease_tags or contains_alias(result.text, profile)
            if not disease_match:
                continue

            score = result.score + 8.0
            if profile.key in result.disease_tags:
                score += 5.0
            if contains_alias(result.text, profile):
                score += 3.0

            other_tags = set(result.disease_tags).intersection(KNOWN_DISEASE_KEYS) - {profile.key}
            score -= len(other_tags) * 7.0

            if treatment_question:
                if has_treatment_content(result.text):
                    score += 4.0
            else:
                if self._is_qa_block(result.text):
                    score -= 5.0
                if self._has_educational_section(result.text):
                    score += 4.0

            score += self._intent_score(result.text, intent)

            reranked.append(replace(result, score=score))

        return self._dedupe(sorted(reranked, key=lambda item: item.score, reverse=True), top_k)

    def _expanded_query(self, query: str, profile) -> str:
        if profile is None:
            return query
        aliases = " ".join(profile.aliases)
        return f"{profile.display_en} {aliases} {query}".strip()

    def _healthy_results(self, candidates: list[SearchResult], top_k: int) -> list[SearchResult]:
        safe_terms = ("healthy", "healty", "skin care", "prevention", "moisturization", "hygiene")
        blocked_terms = (
            "methotrexate",
            "prednisolone",
            "chemotherapy",
            "biological treatment",
            "topical steroid",
            "antifungal",
            "antihistamine",
            "prescribed",
        )
        safe: list[SearchResult] = []
        for result in candidates:
            text = result.text.lower()
            other_disease_tags = set(result.disease_tags).intersection(KNOWN_DISEASE_KEYS) - {"healthy"}
            if other_disease_tags:
                continue
            if any(term in text for term in blocked_terms):
                continue
            if any(term in text for term in safe_terms):
                safe.append(result)
        return self._dedupe(safe, top_k)

    def _dedupe(self, results: list[SearchResult], top_k: int) -> list[SearchResult]:
        selected: list[SearchResult] = []
        seen: set[str] = set()
        for result in results:
            key = self._dedupe_key(result.text)
            if key in seen:
                continue
            seen.add(key)
            selected.append(result)
            if len(selected) >= top_k:
                break
        return selected

    def _dedupe_key(self, text: str) -> str:
        if "A:" in text:
            answer = text.split("A:", 1)[1]
            answer = answer.split("Q:", 1)[0]
            answer = answer.replace("=", " ")
            return " ".join(answer.lower().split())[:220]
        return " ".join(text.lower().split())[:220]

    def _is_qa_block(self, text: str) -> bool:
        stripped = text.lstrip()
        return stripped.startswith("Q:") or "\nQ:" in text or "\nA:" in text

    def _has_educational_section(self, text: str) -> bool:
        upper_text = text.upper()
        sections = (
            "OVERVIEW:",
            "KEY FACTS:",
            "SYMPTOMS",
            "PATIENT MANAGEMENT ADVICE:",
            "RED FLAGS",
            "TRANSMISSION",
        )
        return any(section in upper_text for section in sections)

    def _intent_score(self, text: str, intent: str) -> float:
        upper_text = text.upper()
        lower_text = text.lower()

        if intent == "urgent_care":
            score = 0.0
            if "RED FLAGS" in upper_text or "EMERGENCY CARE" in upper_text:
                score += 9.0
            if any(term in lower_text for term in ("breathing", "throat", "fever", "pus", "infection", "urgent", "emergency")):
                score += 3.0
            if self._is_qa_block(text):
                score -= 4.0
            return score

        if intent == "symptoms":
            score = 0.0
            if "SYMPTOMS" in upper_text:
                score += 8.0
            if "RED FLAGS" in upper_text:
                score += 2.0
            if self._is_qa_block(text):
                score -= 4.0
            return score

        if intent == "prevention_care":
            score = 0.0
            if "PATIENT MANAGEMENT ADVICE" in upper_text or "MONITORING" in upper_text:
                score += 8.0
            if any(term in lower_text for term in ("avoid", "hygiene", "moistur", "trigger", "follow-up", "follow up")):
                score += 3.0
            if self._is_qa_block(text):
                score -= 4.0
            return score

        if intent == "doctor_questions":
            score = 0.0
            if any(section in upper_text for section in ("OVERVIEW:", "KEY FACTS:", "PATIENT MANAGEMENT ADVICE:", "RED FLAGS", "TRANSMISSION")):
                score += 5.0
            if any(term in lower_text for term in ("follow-up", "follow up", "dermatologist", "doctor", "monitoring", "red flags", "transmission", "trigger")):
                score += 3.0
            if self._is_qa_block(text):
                score -= 3.0
            return score

        if intent == "contagion_transmission":
            score = 0.0
            if "TRANSMISSION" in upper_text:
                score += 10.0
            if "KEY FACTS" in upper_text and "CONTAGIOUS" in upper_text:
                score += 6.0
            if any(term in lower_text for term in (
                "contagious",
                "not contagious",
                "spread",
                "spreads",
                "transmission",
                "transmit",
                "infectious",
                "skin-to-skin",
                "contaminated",
                "shared towels",
                "shared clothing",
                "locker rooms",
            )):
                score += 5.0
            if self._is_qa_block(text):
                score -= 4.0
            return score

        if intent in {"treatment", "prescription_request"}:
            score = 0.0
            if has_treatment_content(text):
                score += 8.0
            if self._is_qa_block(text):
                score += 2.0
            return score

        if intent in {"overview", "diagnosis_result"}:
            score = 0.0
            if "OVERVIEW:" in upper_text or "KEY FACTS:" in upper_text:
                score += 6.0
            if self._is_qa_block(text):
                score -= 3.0
            return score

        return 0.0
