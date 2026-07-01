"""
Data access layer for diagnosis operations
"""
import json
import logging
from typing import List, Optional

from sqlalchemy import select, desc, delete as sqlalchemy_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models.diagnosis import Diagnosis

logger = logging.getLogger(__name__)


class DiagnosisRepository:
    """Repository for diagnosis data access"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data: dict) -> Diagnosis:
        """Create new diagnosis record"""
        db_data = data.copy()

        # Convert all_predictions to JSON string
        if "all_predictions" in db_data and isinstance(db_data["all_predictions"], list):
            db_data["all_predictions"] = json.dumps(db_data["all_predictions"])
        
        # Convert metadata to JSON string
        if "metadata" in db_data and isinstance(db_data["metadata"], dict):
            db_data["extra_metadata"] = json.dumps(db_data["metadata"])
            del db_data["metadata"]
        
        diagnosis = Diagnosis(**db_data)
        self.session.add(diagnosis)
        await self.session.commit()
        await self.session.refresh(diagnosis)
        
        logger.info(f"Created diagnosis: {diagnosis.id}")
        return diagnosis
    
    async def get_by_id(self, diagnosis_id: int) -> Optional[Diagnosis]:
        """Get diagnosis by ID"""
        result = await self.session.execute(
            select(Diagnosis)
            .options(selectinload(Diagnosis.family_member))
            .where(Diagnosis.id == diagnosis_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_session_id(self, session_id: str) -> Optional[Diagnosis]:
        """Get diagnosis by session ID"""
        result = await self.session.execute(
            select(Diagnosis).where(Diagnosis.session_id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(
        self,
        user_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> List[Diagnosis]:
        """Get user's diagnosis history"""
        result = await self.session.execute(
            select(Diagnosis)
            .options(selectinload(Diagnosis.family_member))
            .where(Diagnosis.user_id == user_id)
            .order_by(desc(Diagnosis.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_all_by_user(self, user_id: int) -> List[Diagnosis]:
        """Get all diagnosis records for one user."""
        result = await self.session.execute(
            select(Diagnosis).where(Diagnosis.user_id == user_id)
        )
        return list(result.scalars().all())
    
    async def delete(self, diagnosis_id: int) -> bool:
        """Delete diagnosis record"""
        diagnosis = await self.get_by_id(diagnosis_id)
        if diagnosis:
            await self.session.delete(diagnosis)
            await self.session.commit()
            logger.info(f"Deleted diagnosis: {diagnosis_id}")
            return True
        return False

    async def delete_by_user(self, user_id: int) -> int:
        """Delete all diagnosis records owned by one user only."""
        result = await self.session.execute(
            sqlalchemy_delete(Diagnosis).where(Diagnosis.user_id == user_id)
        )
        await self.session.commit()
        deleted_count = result.rowcount or 0
        logger.info("Deleted %s diagnoses for user %s", deleted_count, user_id)
        return deleted_count
