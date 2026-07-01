import api from '../config/api';

const normalizeConfidenceToPercent = (value) => {
  const numeric = Number(value) || 0;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
};

const diagnosisService = {
  /**
   * POST /api/v1/diagnosis
   */
  uploadImage: async (file, familyMemberId = null, onUploadProgress = null) => {
    try {
      if (typeof familyMemberId === 'function') {
        onUploadProgress = familyMemberId;
        familyMemberId = null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'family_member_id',
        familyMemberId === null || familyMemberId === undefined ? 'null' : String(familyMemberId)
      );

      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      };

      if (onUploadProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percent);
        };
      }

      const response = await api.post('/diagnosis', formData, config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Analysis failed',
      };
    }
  },

  /**
   * GET /api/v1/diagnosis/:id
   */
  getDiagnosisById: async (analysisId) => {
    try {
      const response = await api.get(`/diagnosis/${analysisId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch diagnosis',
      };
    }
  },

  /**
   * GET /api/v1/history?limit=20
   */
  getHistory: async (limit = 20) => {
    try {
      const response = await api.get('/history', { params: { limit } });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch history',
      };
    }
  },

  /**
   * ✅ DELETE /api/v1/diagnosis/:id
   */
  deleteAnalysis: async (analysisId) => {
    try {
      const response = await api.delete(`/diagnosis/${analysisId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete analysis',
      };
    }
  },

  /**
   * DELETE /api/v1/diagnosis
   */
  deleteAllAnalyses: async () => {
    try {
      const response = await api.delete('/diagnosis');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete diagnosis history',
      };
    }
  },

  /**
   * Helper: Normalize response للـ UI
   */
  normalizeResponse: (data) => {
    if (!data) return null;
    return {
      id: data.analysis_id || data.id,
      topDisease: data.predicted_label || data.top_prediction?.disease_type || data.disease_type || 'Unknown',
      confidence: data.confidence ?? data.top_prediction?.probability ?? data.top_prediction?.confidence_percentage ?? 0,
      confidencePercent: normalizeConfidenceToPercent(data.confidence ?? data.top_prediction?.probability ?? data.top_prediction?.confidence_percentage ?? 0),
      allPredictions: data.top_k || data.predictions || data.all_predictions || [],
      imageQuality: data.image_quality_score ?? data.image_quality ?? null,
      imageQualityLabel: data.image_quality_label || data.image_quality?.label || null,
      affectedArea: data.affected_area || 'N/A',
      createdAt: data.created_at || new Date().toISOString(),
      familyMemberId: data.family_member_id ?? null,
      ownerType: data.owner_type || (data.family_member_id ? 'family_member' : 'self'),
      ownerName: data.owner_name || data.family_member_name || 'Me',
      ownerRelation: data.owner_relation || data.family_member_relation || null,
      resultStatus: data.result_status || 'confident',
      isUncertain: Boolean(data.is_uncertain) || (data.is_uncertain === undefined && normalizeConfidenceToPercent(data.confidence ?? data.top_prediction?.probability ?? data.top_prediction?.confidence_percentage ?? 0) < 60),
      uncertaintyReasons: data.uncertainty_reasons || [],
      userMessage: data.user_message || null,
    };
  },
};

export default diagnosisService;
