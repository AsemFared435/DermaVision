"""RAG chat endpoint for DermaVision."""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import get_current_user_id, get_rag_service
from app.api.v1.schemas.rag import (
    RagChatRequest,
    RagChatResponse,
    RagFinalReportRequest,
    RagFinalReportResponse,
)
from app.domain.services.rag_service import RagService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/rag/chat", response_model=RagChatResponse)
async def rag_chat(
    data: RagChatRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    rag_service: Annotated[RagService, Depends(get_rag_service)],
) -> RagChatResponse:
    try:
        result = await rag_service.chat(
            analysis_id=data.analysis_id,
            message=data.message,
            language=data.language,
            user_id=user_id,
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found",
            )

        return RagChatResponse(
            answer=result.answer,
            diagnosis_context=result.diagnosis_context,
            sources=result.sources,
            disclaimer=result.disclaimer,
        )

    except HTTPException:
        raise
    except Exception:
        logger.error("RAG chat failed", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate a RAG answer right now.",
        )


@router.post("/rag/final-report", response_model=RagFinalReportResponse)
async def rag_final_report(
    data: RagFinalReportRequest,
    user_id: Annotated[int, Depends(get_current_user_id)],
    rag_service: Annotated[RagService, Depends(get_rag_service)],
) -> RagFinalReportResponse:
    try:
        result = await rag_service.final_report(
            analysis_id=data.analysis_id,
            messages=[message.model_dump() for message in data.messages],
            language=data.language,
            user_id=user_id,
        )

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis not found",
            )

        return RagFinalReportResponse(**result)

    except HTTPException:
        raise
    except Exception:
        logger.error("RAG final report generation failed", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate a final report right now.",
        )
