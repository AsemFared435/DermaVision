"""
Family Members API endpoints
"""
import json
import logging
from typing import Annotated, List
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user_id
from app.domain.services.file_service import FileService
from app.infrastructure.database.models.diagnosis import Diagnosis
from app.infrastructure.database.models.family_member import FamilyMember
from app.infrastructure.database.session import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# ===================== Schemas =====================

class FamilyMemberCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    relation: str = Field(..., pattern="^(self|spouse|child|parent|sibling|other)$")
    date_of_birth: date | None = None
    gender: str | None = Field(None, pattern="^(male|female|other)$")
    notes: str | None = Field(None, max_length=500)

class FamilyMemberUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    relation: str | None = Field(None, pattern="^(self|spouse|child|parent|sibling|other)$")
    date_of_birth: date | None = None
    gender: str | None = Field(None, pattern="^(male|female|other)$")
    notes: str | None = Field(None, max_length=500)


def _diagnosis_file_paths(diagnosis: Diagnosis) -> list[Path]:
    paths: list[Path] = []
    if diagnosis.image_path:
        paths.append(Path(diagnosis.image_path))

    try:
        metadata = json.loads(diagnosis.extra_metadata) if diagnosis.extra_metadata else {}
    except (TypeError, json.JSONDecodeError):
        metadata = {}

    processed_image_path = metadata.get("processed_image_path")
    if processed_image_path:
        paths.append(Path(str(processed_image_path)))

    return paths


async def _delete_family_member_with_diagnoses(
    family_member_id: int,
    user_id: int,
    db: AsyncSession,
) -> dict:
    result = await db.execute(
        select(FamilyMember).where(
            FamilyMember.id == family_member_id,
            FamilyMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Family member not found",
        )

    diagnoses_result = await db.execute(
        select(Diagnosis).where(
            Diagnosis.family_member_id == family_member_id,
            Diagnosis.user_id == user_id,
        )
    )
    diagnoses = list(diagnoses_result.scalars().all())
    file_paths = [path for diagnosis in diagnoses for path in _diagnosis_file_paths(diagnosis)]

    try:
        for diagnosis in diagnoses:
            await db.delete(diagnosis)
        await db.delete(member)
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    file_service = FileService()
    for file_path in file_paths:
        try:
            await file_service.delete_file(file_path)
        except Exception as exc:
            logger.warning(
                "Could not delete image file for removed family member %s: %s",
                family_member_id,
                exc,
            )

    logger.info(
        "Family member %s and %s related diagnoses deleted by user %s",
        family_member_id,
        len(diagnoses),
        user_id,
    )
    return {"message": "Family member and related diagnoses deleted successfully"}

# ===================== Endpoints =====================

@router.get(
    "/members",
    response_model=List[dict],
    summary="Get all family members",
)
async def get_family_members(
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        result = await db.execute(
            select(FamilyMember)
            .where(FamilyMember.user_id == user_id)
            .order_by(FamilyMember.created_at)
        )
        members = result.scalars().all()
        return [m.to_dict() for m in members]
    except Exception as e:
        logger.error(f"Error fetching family members: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch family members"
        )


@router.post(
    "/members",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Add family member",
)
async def add_family_member(
    data: FamilyMemberCreate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        result = await db.execute(
            select(FamilyMember).where(FamilyMember.user_id == user_id)
        )
        existing = result.scalars().all()
        if len(existing) >= 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 10 family members allowed per account"
            )

        member = FamilyMember(
            user_id=user_id,
            name=data.name,
            relation=data.relation,
            date_of_birth=data.date_of_birth,
            gender=data.gender,
            notes=data.notes,
        )
        db.add(member)
        await db.commit()
        await db.refresh(member)

        logger.info(f"Family member added: {member.name} for user {user_id}")
        return member.to_dict()

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error adding family member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add family member"
        )


@router.put(
    "/members/{member_id}",
    response_model=dict,
    summary="Update family member",
)
async def update_family_member(
    member_id: int,
    data: FamilyMemberUpdate,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        result = await db.execute(
            select(FamilyMember).where(
                FamilyMember.id == member_id,
                FamilyMember.user_id == user_id
            )
        )
        member = result.scalar_one_or_none()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Family member not found"
            )

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(member, field, value)

        await db.commit()
        await db.refresh(member)
        logger.info(f"Family member {member_id} updated by user {user_id}")
        return member.to_dict()

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating family member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update family member"
        )


@router.delete(
    "/members/{member_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete family member",
)
async def delete_family_member(
    member_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        return await _delete_family_member_with_diagnoses(member_id, user_id, db)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting family member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete family member"
        )


@router.delete(
    "/family-members/{family_member_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete family member and related diagnoses",
)
async def delete_family_member_and_related_data(
    family_member_id: int,
    user_id: Annotated[int, Depends(get_current_user_id)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    try:
        return await _delete_family_member_with_diagnoses(family_member_id, user_id, db)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting family member and diagnoses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete family member"
        )
