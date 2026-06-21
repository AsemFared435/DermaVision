import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import familyService from '../services/familyService';
import toast from 'react-hot-toast';

// ===================== Delete Confirmation =====================
const DeleteModal = ({ member, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500"></div>
      <div className="p-6 text-center">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-red-500 text-xl" />
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Remove Member?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">This will remove:</p>
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
          <span className="text-xl">{familyService.getRelationInfo(member?.relation)?.icon}</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{member?.name}</span>
        </div>
        <p className="text-xs text-red-500 mb-5">⚠️ Their diagnosis history will remain but won't be linked.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-gray-400 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center space-x-2">
            {isDeleting
              ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              : <><FaTrash className="text-xs" /><span>Remove</span></>
            }
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ===================== Member Form =====================
const MemberForm = ({ initial, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    relation: initial?.relation || 'child',
    date_of_birth: initial?.date_of_birth || '',
    gender: initial?.gender || '',
    notes: initial?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const payload = {
      name: form.name.trim(),
      relation: form.relation,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      notes: form.notes.trim() || null,
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          Full Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Enter name"
          maxLength={100}
          required
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-sm"
        />
      </div>

      {/* Relation */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          Relation *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {familyService.relations.map(r => (
            <button key={r.value} type="button"
              onClick={() => setForm(p => ({ ...p, relation: r.value }))}
              className={`flex flex-col items-center py-2.5 px-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                form.relation === r.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}>
              <span className="text-lg mb-0.5">{r.icon}</span>
              <span className="text-xs">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DOB + Gender */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
            Gender
          </label>
          <select
            value={form.gender}
            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          Medical Notes (Optional)
        </label>
        <textarea
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          placeholder="Allergies, chronic conditions, medications..."
          rows={2}
          maxLength={500}
          className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 outline-none transition-all text-sm resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={isSaving}
          className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-gray-400 transition-all text-sm disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSaving}
          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all text-sm disabled:opacity-70 flex items-center justify-center space-x-2">
          {isSaving
            ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            : <><FaCheck className="text-xs" /><span>{initial ? 'Save Changes' : 'Add Member'}</span></>
          }
        </button>
      </div>
    </form>
  );
};

// ===================== Member Card =====================
const MemberCard = ({ member, onEdit, onDelete, isRemoving }) => {
  const rel = familyService.getRelationInfo(member.relation);

  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
    gray: 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600',
  };

  const age = member.date_of_birth
    ? Math.floor((new Date() - new Date(member.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
      isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
    } ${colorMap[rel.color] || colorMap.gray} hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{rel.icon}</div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">{rel.label}</span>
              {age !== null && <span className="text-xs text-gray-400">• {age}y</span>}
              {member.gender && <span className="text-xs text-gray-400 capitalize">• {member.gender}</span>}
            </div>
            {member.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[180px] truncate" title={member.notes}>
                📝 {member.notes}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-1.5 flex-shrink-0">
          <button onClick={() => onEdit(member)}
            className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-gray-200 dark:border-gray-600">
            <FaEdit className="text-xs" />
          </button>
          <button onClick={() => onDelete(member)}
            className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all border border-gray-200 dark:border-gray-600">
            <FaTrash className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===================== Main FamilyManager =====================
const FamilyManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    setLoading(true);
    const result = await familyService.getMembers();
    if (result.success) setMembers(result.data);
    else toast.error(result.error);
    setLoading(false);
  };

  const handleAdd = async (data) => {
    setIsSaving(true);
    const result = await familyService.addMember(data);
    if (result.success) {
      setMembers(prev => [...prev, result.data]);
      setShowForm(false);
      toast.success(`✅ ${result.data.name} added to your family!`);
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleUpdate = async (data) => {
    setIsSaving(true);
    const result = await familyService.updateMember(editingMember.id, data);
    if (result.success) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? result.data : m));
      setEditingMember(null);
      toast.success('✅ Member updated!');
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    const result = await familyService.deleteMember(deleteModal.id);
    if (result.success) {
      setRemovingId(deleteModal.id);
      setTimeout(() => {
        setMembers(prev => prev.filter(m => m.id !== deleteModal.id));
        setRemovingId(null);
        toast.success('Member removed');
      }, 350);
      setDeleteModal(null);
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

      {deleteModal && (
        <DeleteModal
          member={deleteModal}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaUsers className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Family Members</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{members.length}/10 members</p>
          </div>
        </div>
        {!showForm && !editingMember && members.length < 10 && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all text-sm">
            <FaPlus className="text-xs" /><span>Add Member</span>
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Add/Edit Form */}
        {(showForm || editingMember) && (
          <div className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>{editingMember ? '✏️ Edit Member' : '➕ Add New Member'}</span>
            </h3>
            <MemberForm
              initial={editingMember}
              onSave={editingMember ? handleUpdate : handleAdd}
              onCancel={() => { setShowForm(false); setEditingMember(null); }}
              isSaving={isSaving}
            />
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">No Family Members Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
              Add your family members to track their skin health separately.
            </p>
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="mt-5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm">
                Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={m => { setEditingMember(m); setShowForm(false); }}
                onDelete={m => setDeleteModal(m)}
                isRemoving={removingId === member.id}
              />
            ))}
          </div>
        )}

        {/* Limit warning */}
        {members.length >= 10 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium text-center">
              ⚠️ Maximum 10 family members reached
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyManager;
