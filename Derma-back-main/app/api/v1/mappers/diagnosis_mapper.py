"""
Mappers to convert database models to API response formats
Ensures consistent API contract across all diagnosis endpoints
"""
from typing import Dict, List


def _format_relation(relation: str | None) -> str | None:
    if not relation:
        return None
    return str(relation).replace("_", " ").title()


def _owner_info(source: Dict) -> Dict:
    family_member_id = source.get("family_member_id")
    if family_member_id:
        return {
            "family_member_id": family_member_id,
            "owner_type": "family_member",
            "owner_name": source.get("family_member_name") or "Family Member",
            "owner_relation": _format_relation(source.get("family_member_relation")),
        }

    return {
        "family_member_id": None,
        "owner_type": "self",
        "owner_name": "Me",
        "owner_relation": None,
    }


def _uncertainty_info(source: Dict) -> Dict:
    metadata = source.get("metadata") or {}
    saved_uncertainty = metadata.get("uncertainty") if isinstance(metadata, dict) else None
    uncertainty = saved_uncertainty if isinstance(saved_uncertainty, dict) else source
    is_uncertain = bool(uncertainty.get("is_uncertain", False))

    return {
        "result_status": uncertainty.get("result_status") or ("uncertain" if is_uncertain else "confident"),
        "is_uncertain": is_uncertain,
        "uncertainty_reasons": uncertainty.get("uncertainty_reasons") or [],
        "user_message": uncertainty.get("user_message"),
    }


def map_to_create_response(service_result: Dict) -> Dict:
    """
    Map service result to POST /api/v1/diagnosis response format
    
    Args:
        service_result: Result from diagnosis_service.create_diagnosis()
        
    Returns:
        Frontend-friendly normalized response
    """
    return {
        "predicted_label": service_result["top_prediction"]["disease_type"],
        "confidence": service_result["top_prediction"]["probability"],
        "top_k": [
            {
                "label": pred["disease_type"],
                "confidence": pred["probability"]
            }
            for pred in service_result["all_predictions"]
        ],
        "image_quality_score": service_result["image_quality"]["score"],
        "image_quality_label": service_result["image_quality"]["label"],
        "analysis_id": service_result["diagnosis_id"],
        **_uncertainty_info(service_result),
        **_owner_info(service_result),
    }


def map_to_detail_response(diagnosis_dict: Dict) -> Dict:
    """
    Map database model dict to GET /api/v1/diagnosis/{id} response format
    
    Args:
        diagnosis_dict: Result from diagnosis.to_dict()
        
    Returns:
        Frontend-friendly normalized response with full details
    """
    return {
        "id": diagnosis_dict["id"],
        "predicted_label": diagnosis_dict["top_prediction"]["disease_type"],
        "confidence": diagnosis_dict["top_prediction"]["probability"],
        "all_predictions": diagnosis_dict["all_predictions"],
        "image_quality_score": diagnosis_dict["image_quality"]["score"],
        "image_quality_label": diagnosis_dict["image_quality"]["label"],
        "created_at": diagnosis_dict["created_at"],
        **_uncertainty_info(diagnosis_dict),
        **_owner_info(diagnosis_dict),
    }


def map_to_history_item(diagnosis_dict: Dict) -> Dict:
    """
    Map database model dict to history item format
    
    Args:
        diagnosis_dict: Result from diagnosis.to_dict()
        
    Returns:
        Frontend-friendly normalized history item
    """
    return {
        "id": diagnosis_dict["id"],
        "predicted_label": diagnosis_dict["top_prediction"]["disease_type"],
        "confidence": diagnosis_dict["top_prediction"]["probability"],
        "image_quality_score": diagnosis_dict["image_quality"]["score"],
        "image_quality_label": diagnosis_dict["image_quality"]["label"],
        "created_at": diagnosis_dict["created_at"],
        **_uncertainty_info(diagnosis_dict),
        **_owner_info(diagnosis_dict),
    }


def map_to_history_response(diagnoses: List[Dict], limit: int) -> Dict:
    """
    Map list of diagnosis dicts to GET /api/v1/history response format
    
    Args:
        diagnoses: List of diagnosis.to_dict() results
        limit: Pagination limit
        
    Returns:
        Frontend-friendly normalized history response
    """
    return {
        "analyses": [map_to_history_item(d) for d in diagnoses],
        "total": len(diagnoses),
        "limit": limit
    }
