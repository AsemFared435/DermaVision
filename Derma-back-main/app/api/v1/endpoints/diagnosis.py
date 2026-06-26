"""
Diagnosis API endpoints
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id, get_diagnosis_service
from app.api.v1.schemas.diagnosis_response import (
    DiagnosisCreateResponse,
    DiagnosisDetailResponse,
    DiagnosisHistoryResponse
)
from app.api.v1.mappers import (
    map_to_create_response,
    map_to_detail_response,
    map_to_history_response
)
from app.core.config import settings
from app.core.exceptions import AppException
from app.domain.services.diagnosis_service import DiagnosisService
from app.infrastructure.database.models.family_member import FamilyMember
from app.infrastructure.database.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

MIME_TO_EXTENSION = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


def _parse_family_member_id(raw_value: str | None) -> int | None:
    if raw_value is None:
        return None

    normalized = str(raw_value).strip().lower()
    if normalized in {"", "null", "none", "undefined", "self"}:
        return None

    try:
        family_member_id = int(normalized)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid family member selected.",
        ) from exc

    if family_member_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid family member selected.",
        )

    return family_member_id


async def _get_owned_family_member(
    db: AsyncSession,
    user_id: int,
    family_member_id: int | None,
) -> FamilyMember | None:
    if family_member_id is None:
        return None

    result = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == family_member_id,
            FamilyMember.user_id == user_id,
        )
    )
    family_member = result.scalar_one_or_none()

    if family_member is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid family member selected.",
        )

    return family_member


@router.post(
    "/diagnosis",
    response_model=DiagnosisCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Diagnose skin disease from image",
    description="Upload an image and get AI-powered skin disease diagnosis"
)
async def diagnose_image(
    file: Annotated[UploadFile, File(description="Image file (JPG, JPEG, PNG)")],
    user_id: Annotated[int, Depends(get_current_user_id)],
    diagnosis_service: Annotated[DiagnosisService, Depends(get_diagnosis_service)],
    db: Annotated[AsyncSession, Depends(get_db)],
    family_member_id: Annotated[str | None, Form()] = None,
    top_k: int = settings.TOP_K_PREDICTIONS
) -> DiagnosisCreateResponse:
    try:
        content_type = (file.content_type or "").split(";")[0].strip().lower()
        if content_type not in settings.ALLOWED_IMAGE_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail="Unsupported image type. Please upload a JPG or PNG image.",
            )

        selected_family_member_id = _parse_family_member_id(family_member_id)
        selected_family_member = await _get_owned_family_member(
            db=db,
            user_id=user_id,
            family_member_id=selected_family_member_id,
        )

        logger.info(
            "Diagnosis request from user %s for %s",
            user_id,
            f"family_member:{selected_family_member_id}" if selected_family_member_id else "self",
        )

        file_content = await file.read(settings.MAX_UPLOAD_SIZE + 1)
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024:.1f}MB",
            )

        safe_filename = f"upload{MIME_TO_EXTENSION.get(content_type, '.jpg')}"

        result = await diagnosis_service.create_diagnosis(
            file_content=file_content,
            filename=safe_filename,
            user_id=user_id,
            family_member_id=selected_family_member_id,
            top_k=top_k
        )

        if selected_family_member:
            result["family_member_name"] = selected_family_member.name
            result["family_member_relation"] = selected_family_member.relation

        response_data = map_to_create_response(result)
        return DiagnosisCreateResponse(**response_data)

    except HTTPException:
        raise
    except AppException as e:
        logger.error(f"Diagnosis failed: {e.message}", exc_info=not settings.is_production)
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.error(f"Unexpected error during diagnosis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during diagnosis"
        )


@router.get(
    "/history",
    response_model=DiagnosisHistoryResponse,
    summary="Get diagnosis history",
    description="Get user's diagnosis history with pagination"
)
async def get_diagnosis_history(
    user_id: Annotated[int, Depends(get_current_user_id)],
    diagnosis_service: Annotated[DiagnosisService, Depends(get_diagnosis_service)],
    limit: int = Query(20, description="Number of records to return (default: 20)")
) -> DiagnosisHistoryResponse:
    try:
        diagnoses = await diagnosis_service.get_user_history(
            user_id=user_id,
            limit=limit,
            offset=0
        )
        response_data = map_to_history_response(diagnoses, limit)
        return DiagnosisHistoryResponse(**response_data)

    except Exception as e:
        logger.error(f"Error retrieving history: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving diagnosis history"
        )


@router.get(
    "/diagnosis/{analysis_id}",
    response_model=DiagnosisDetailResponse,
    summary="Get diagnosis by ID",
    description="Retrieve a specific diagnosis record by analysis ID"
)
async def get_diagnosis_by_id(
    analysis_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    diagnosis_service: Annotated[DiagnosisService, Depends(get_diagnosis_service)]
) -> DiagnosisDetailResponse:
    try:
        result = await diagnosis_service.get_diagnosis(analysis_id, user_id)

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Diagnosis {analysis_id} not found"
            )

        response_data = map_to_detail_response(result)
        return DiagnosisDetailResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving diagnosis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving diagnosis"
        )


# ✅ NEW: Delete diagnosis endpoint
@router.delete(
    "/diagnosis/{analysis_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete diagnosis",
    description="Delete a specific diagnosis record by ID"
)
async def delete_diagnosis(
    analysis_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    diagnosis_service: Annotated[DiagnosisService, Depends(get_diagnosis_service)]
) -> dict:
    try:
        deleted = await diagnosis_service.delete_diagnosis(analysis_id, user_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Diagnosis {analysis_id} not found or not authorized"
            )

        logger.info(f"Diagnosis {analysis_id} deleted by user {user_id}")
        return {"success": True, "message": f"Diagnosis {analysis_id} deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting diagnosis: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting diagnosis"
        )
