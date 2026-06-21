"""Schemas for RAG chat endpoint."""
from typing import Literal

from pydantic import BaseModel, Field


class RagChatRequest(BaseModel):
    analysis_id: int = Field(..., ge=1)
    message: str = Field(..., min_length=1, max_length=1200)
    language: Literal["en", "ar"] = "en"


class RagDiagnosisContext(BaseModel):
    analysis_id: int
    predicted_label: str
    confidence: float


class RagSource(BaseModel):
    source: str
    snippet: str


class RagChatResponse(BaseModel):
    answer: str
    diagnosis_context: RagDiagnosisContext
    sources: list[RagSource]
    disclaimer: str


class RagFinalReportMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)
    timestamp: str | None = None


class RagFinalReportRequest(BaseModel):
    analysis_id: int = Field(..., ge=1)
    messages: list[RagFinalReportMessage] = Field(default_factory=list, max_length=80)
    language: Literal["en", "ar"] = "en"


class RagFinalReportDiagnosis(BaseModel):
    predicted_label: str
    display_name: str
    confidence: float
    is_ai_result: bool = True


class RagFinalReportResponse(BaseModel):
    report_title: str
    generated_at: str
    analysis_id: int
    diagnosis: RagFinalReportDiagnosis
    summary: str
    patient_questions_summary: list[str]
    general_care_guidance: list[str]
    common_treatment_options: list[str]
    red_flags: list[str]
    doctor_questions: list[str]
    disclaimer: str
