import api from '../config/api';

const familyService = {

  // ✅ GET /members
  getMembers: async () => {
    try {
      const response = await api.get('/members');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to load family members' };
    }
  },

  // ✅ POST /members
  addMember: async (memberData) => {
    try {
      const response = await api.post('/members', memberData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add member' };
    }
  },

  // ✅ PUT /members/:id
  updateMember: async (memberId, memberData) => {
    try {
      const response = await api.put(`/members/${memberId}`, memberData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to update member' };
    }
  },

  // ✅ DELETE /members/:id
  deleteMember: async (memberId) => {
    try {
      await api.delete(`/members/${memberId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to delete member' };
    }
  },

  relations: [
    { value: 'self',    label: 'Myself',  icon: '👤', color: 'blue' },
    { value: 'spouse',  label: 'Spouse',  icon: '💑', color: 'pink' },
    { value: 'child',   label: 'Child',   icon: '👶', color: 'green' },
    { value: 'parent',  label: 'Parent',  icon: '👴', color: 'purple' },
    { value: 'sibling', label: 'Sibling', icon: '👫', color: 'orange' },
    { value: 'other',   label: 'Other',   icon: '👥', color: 'gray' },
  ],

  getRelationInfo: (relation) => {
    return familyService.relations.find(r => r.value === relation)
      || { value: relation, label: relation, icon: '👥', color: 'gray' };
  },
};

export default familyService;