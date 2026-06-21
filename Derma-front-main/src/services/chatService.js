import api from '../config/api';

/**
 * Chat requests use the DermaVision backend RAG endpoint.
 * No Groq/OpenAI or private LLM key is called from the browser.
 */
const chatService = {
  sendRagMessage: async ({ analysisId, message, language }) => {
    try {
      const response = await api.post('/rag/chat', {
        analysis_id: Number(analysisId),
        message,
        language,
      }, { _skipToast: true });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.response?.data?.error;

      return {
        success: false,
        status,
        error: detail || error.message || 'Unable to send chat message.',
      };
    }
  },

  generateFinalReport: async ({ analysisId, messages, language }) => {
    try {
      const response = await api.post('/rag/final-report', {
        analysis_id: Number(analysisId),
        messages,
        language,
      }, { _skipToast: true });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail || error.response?.data?.error;

      return {
        success: false,
        status,
        error: detail || error.message || 'Unable to generate the report.',
      };
    }
  },
};

export default chatService;
