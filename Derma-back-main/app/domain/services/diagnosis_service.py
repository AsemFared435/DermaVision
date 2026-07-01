"""
Business logic for diagnosis operations
"""
import logging
from typing import Dict, Optional
from uuid import uuid4

from app.core.config import settings
from app.core.exceptions import ValidationError
from app.domain.services.file_service import FileService
from app.infrastructure.database.repositories.diagnosis_repository import DiagnosisRepository
from app.infrastructure.ml.predictor import SkinDiseasePredictor

logger = logging.getLogger(__name__)


class DiagnosisService:
    """Service layer for diagnosis business logic"""

    def __init__(
        self,
        predictor: SkinDiseasePredictor,
        file_service: FileService,
        diagnosis_repo: DiagnosisRepository
    ):
        self.predictor = predictor
        self.file_service = file_service
        self.diagnosis_repo = diagnosis_repo

    async def create_diagnosis(
        self,
        file_content: bytes,
        filename: str,
        user_id: int,
        family_member_id: Optional[int] = None,
        top_k: int = 3
    ) -> Dict:
        session_id = str(uuid4())

        try:
            file_path = await self.file_service.save_upload(
                file_content=file_content,
                filename=filename,
                session_id=session_id
            )

            logger.info(f"Processing diagnosis for session {session_id}")

            prediction_result = await self.predictor.predict(
                image_path=file_path,
                top_k=top_k
            )

            if not prediction_result.get("success"):
                raise ValidationError("Prediction failed", details=prediction_result)

            uncertainty = self._evaluate_uncertainty(prediction_result)
            metadata = {
                **(prediction_result.get("metadata") or {}),
                "uncertainty": uncertainty,
            }
            diagnosis_created = False

            diagnosis_data = {
                "user_id": user_id,
                "family_member_id": family_member_id,
                "session_id": session_id,
                "image_path": str(file_path),
                "image_quality_score": prediction_result["image_quality"]["score"],
                "image_quality_label": prediction_result["image_quality"]["label"],
                "disease_type": prediction_result["top_prediction"]["disease_type"],
                "probability": prediction_result["top_prediction"]["probability"],
                "confidence_percentage": prediction_result["top_prediction"]["confidence_percentage"],
                "all_predictions": prediction_result["all_predictions"],
                "metadata": metadata,
            }

            diagnosis = await self.diagnosis_repo.create(diagnosis_data)
            diagnosis_created = True

            logger.info(
                f"Diagnosis created: ID={diagnosis.id}, "
                f"Disease={diagnosis.disease_type}, "
                f"Confidence={diagnosis.confidence_percentage}%"
            )

            return {
                "success": True,
                "diagnosis_id": diagnosis.id,
                "family_member_id": diagnosis.family_member_id,
                "session_id": session_id,
                "top_prediction": prediction_result["top_prediction"],
                "all_predictions": prediction_result["all_predictions"],
                "image_quality": prediction_result["image_quality"],
                "metadata": metadata,
                **uncertainty,
                "created_at": diagnosis.created_at
            }

        except Exception as e:
            logger.error(f"Diagnosis creation failed: {e}", exc_info=True)
            if 'file_path' in locals() and not locals().get("diagnosis_created", False):
                await self.file_service.delete_file(file_path)
            raise

    async def get_diagnosis(self, diagnosis_id: int, user_id: int) -> Optional[Dict]:
        diagnosis = await self.diagnosis_repo.get_by_id(diagnosis_id)
        if diagnosis and diagnosis.user_id == user_id:
            return diagnosis.to_dict()
        return None

    async def get_user_history(
        self,
        user_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> list[Dict]:
        diagnoses = await self.diagnosis_repo.get_by_user(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        return [d.to_dict() for d in diagnoses]

    # ✅ NEW: Delete diagnosis
    async def delete_diagnosis(self, diagnosis_id: int, user_id: int) -> bool:
        """
        Delete diagnosis by ID - بيتأكد إن الـ record بتاع الـ user ده فعلاً
        """
        # ✅ تأكد إن الـ diagnosis بتاع الـ user ده
        diagnosis = await self.diagnosis_repo.get_by_id(diagnosis_id)

        if not diagnosis:
            return False

        if diagnosis.user_id != user_id:
            logger.warning(
                f"User {user_id} tried to delete diagnosis {diagnosis_id} "
                f"owned by user {diagnosis.user_id}"
            )
            return False

        # ✅ احذف الـ file من الـ storage
        try:
            from pathlib import Path
            if diagnosis.image_path:
                await self.file_service.delete_file(Path(diagnosis.image_path))
        except Exception as e:
            logger.warning(f"Could not delete image file: {e}")

        # ✅ احذف من الـ database
        deleted = await self.diagnosis_repo.delete(diagnosis_id)

        if deleted:
            logger.info(f"Diagnosis {diagnosis_id} deleted by user {user_id}")

        return deleted

    async def delete_all_diagnoses(self, user_id: int) -> int:
        """Delete all diagnosis records owned by the current user."""
        diagnoses = await self.diagnosis_repo.get_all_by_user(user_id)

        for diagnosis in diagnoses:
            try:
                from pathlib import Path
                if diagnosis.image_path:
                    await self.file_service.delete_file(Path(diagnosis.image_path))
            except Exception as e:
                logger.warning(
                    "Could not delete image file for diagnosis %s: %s",
                    diagnosis.id,
                    e,
                )

        deleted_count = await self.diagnosis_repo.delete_by_user(user_id)
        logger.info("Deleted all diagnoses for user %s: count=%s", user_id, deleted_count)
        return deleted_count

    def _evaluate_uncertainty(self, prediction_result: Dict) -> Dict:
        """Flag low-certainty closed-set predictions without changing raw model output."""
        predictions = prediction_result.get("all_predictions") or []
        top1 = predictions[0] if predictions else prediction_result.get("top_prediction", {})
        top2 = predictions[1] if len(predictions) > 1 else {}

        top1_confidence = self._normalize_confidence(
            top1.get("probability")
            or top1.get("confidence")
            or top1.get("confidence_percentage")
            or 0.0
        )
        top2_confidence = self._normalize_confidence(
            top2.get("probability")
            or top2.get("confidence")
            or top2.get("confidence_percentage")
            or 0.0
        )
        top2_margin = top1_confidence - top2_confidence
        image_quality_score = int((prediction_result.get("image_quality") or {}).get("score") or 0)

        reasons: list[str] = []
        if top1_confidence < settings.DIAGNOSIS_MIN_CONFIDENCE:
            reasons.append("low_confidence")
        if top2 and top2_margin < settings.DIAGNOSIS_MIN_TOP2_MARGIN:
            reasons.append("ambiguous_prediction")
        if image_quality_score < settings.DIAGNOSIS_MIN_IMAGE_QUALITY_SCORE:
            reasons.append("poor_image_quality")

        is_uncertain = bool(reasons)
        user_message = self._build_uncertainty_message(reasons) if is_uncertain else None

        return {
            "result_status": "uncertain" if is_uncertain else "confident",
            "is_uncertain": is_uncertain,
            "uncertainty_reasons": reasons,
            "user_message": user_message,
            "top1_label": top1.get("disease_type"),
            "top1_confidence": top1_confidence,
            "top2_label": top2.get("disease_type"),
            "top2_confidence": top2_confidence if top2 else None,
            "top2_margin": top2_margin if top2 else None,
            "uncertainty_thresholds": {
                "min_confidence": settings.DIAGNOSIS_MIN_CONFIDENCE,
                "min_top2_margin": settings.DIAGNOSIS_MIN_TOP2_MARGIN,
                "min_image_quality_score": settings.DIAGNOSIS_MIN_IMAGE_QUALITY_SCORE,
            },
        }

    @staticmethod
    def _normalize_confidence(value) -> float:
        """Normalize confidence from either 0..1 or 0..100 into 0..1."""
        try:
            confidence = float(value)
        except (TypeError, ValueError):
            return 0.0

        if confidence > 1.0:
            confidence = confidence / 100.0

        return max(0.0, min(confidence, 1.0))

    @staticmethod
    def _build_uncertainty_message(reasons: list[str]) -> str:
        reason_set = set(reasons)
        has_poor_quality = "poor_image_quality" in reason_set
        has_low_confidence = "low_confidence" in reason_set
        has_ambiguous = "ambiguous_prediction" in reason_set

        if has_poor_quality and len(reason_set) == 1:
            return (
                "The result is uncertain because the uploaded image quality is low. "
                "Please upload a clearer, well-lit skin image and try again."
            )
        if has_poor_quality:
            return (
                "The result is uncertain because the image quality is low and the model prediction is not confident. "
                "Please upload a clearer skin image. If the issue remains, consult a dermatologist."
            )
        if has_low_confidence and has_ambiguous:
            return (
                "The result is uncertain because the model confidence is low and the top predictions are close to each other. "
                "This may indicate an ambiguous case or a disease outside the supported model classes. "
                "Please consult a dermatologist."
            )
        if has_low_confidence:
            return (
                "The result is uncertain because the model confidence is low. "
                "This case may not be clearly supported by the current model classes. "
                "Please consult a dermatologist."
            )
        if has_ambiguous:
            return (
                "The result is uncertain because the top predictions are close to each other. "
                "The case may be ambiguous or outside the supported diseases. "
                "Please consult a dermatologist."
            )
        return "The result is uncertain. Please consult a dermatologist."
