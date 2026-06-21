import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaTrash, FaEye, FaCalendar, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import diagnosisService from '../services/diagnosisService';
import toast from 'react-hot-toast';

// ===================== Skeleton Card =====================
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-12"></div>
      </div>
    </div>
  </div>
);

// ===================== Delete Modal =====================
const DeleteModal = ({ analysis, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500"></div>
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Analysis?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">This will permanently delete the analysis for:</p>
        <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
          <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">{analysis?.disease}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({analysis?.probability}% confidence)</span>
        </div>
        <p className="text-xs text-red-500 dark:text-red-400 mb-6">⚠️ This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={isDeleting}
            className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:border-gray-400 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center space-x-2">
            {isDeleting
              ? <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div><span>Deleting...</span></>
              : <><FaTrash className="text-sm" /><span>Delete</span></>
            }
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ===================== History Component =====================
const History = () => {
  const { currentUser } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    // ✅ امسح البيانات القديمة فوراً لما الـ user يتغير
    setAnalyses([]);
    setFilter('all');
    setDeleteModal(null);
    setRemovingId(null);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetchAnalyses();
  }, [currentUser?.id || currentUser?.uid]);
  // ✅ بنتابع الـ ID مش الـ object كله عشان مش كل render يعمل fetch

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await diagnosisService.getHistory(100);
      if (response.success) {
        const analysesData = (response.data.analyses || []).map((analysis) => ({
          id: analysis.id,
          disease: analysis.predicted_label || 'Unknown',
          probability: Math.round((analysis.confidence || 0) * 100),
          affectedArea: analysis.predicted_label || 'N/A',
          imageQuality: analysis.image_quality_score || 0,
          imageQualityLabel: analysis.image_quality_label || 'N/A',
          createdAt: analysis.created_at,
        }));
        setAnalyses(analysesData);
      } else {
        toast.error(response.error);
        setAnalyses([]);
      }
    } catch {
      toast.error('Failed to load history');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (analysis) => setDeleteModal(analysis);

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setDeletingId(deleteModal.id);
    try {
      const response = await diagnosisService.deleteAnalysis(deleteModal.id);
      if (response.success) {
        setDeleteModal(null);
        setRemovingId(deleteModal.id);
        setTimeout(() => {
          setAnalyses(prev => prev.filter(a => a.id !== deleteModal.id));
          setRemovingId(null);
          toast.success('✅ Analysis deleted successfully');
        }, 400);
      } else {
        toast.error(response.error);
      }
    } catch {
      toast.error('Failed to delete analysis');
    } finally {
      setDeletingId(null);
    }
  };

  const getProbColor = (prob) => {
    if (prob >= 80) return 'text-green-600 dark:text-green-400';
    if (prob >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProbBar = (prob) => {
    if (prob >= 80) return 'from-green-400 to-emerald-500';
    if (prob >= 60) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-rose-500';
  };

  const filteredAnalyses = analyses.filter((analysis) => {
    if (filter === 'all') return true;
    const daysDiff = Math.floor((new Date() - new Date(analysis.createdAt)) / (1000 * 60 * 60 * 24));
    if (filter === 'recent') return daysDiff <= 7;
    if (filter === 'old') return daysDiff > 30;
    return true;
  });

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {deleteModal && (
          <DeleteModal
            analysis={deleteModal}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteModal(null)}
            isDeleting={!!deletingId}
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Analysis History</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {currentUser ? `Your previous skin analyses` : 'Please login to view history'}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500 dark:text-gray-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: `All (${analyses.length})` },
                { key: 'recent', label: 'Last 7 days' },
                { key: 'old', label: 'Older (30+ days)' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    filter === f.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="text-4xl text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Analyses Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all' ? "You haven't performed any analyses yet" : 'No analyses found for this filter'}
            </p>
            <Link to="/upload"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all">
              Start Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((analysis) => (
              <div key={analysis.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                  removingId === analysis.id ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100 translate-x-0'
                }`}
                style={{ transition: 'all 0.4s ease' }}
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center relative overflow-hidden">
                  <FaFileAlt className="text-6xl text-gray-300 dark:text-gray-600" />
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-white text-xs font-black shadow-lg bg-gradient-to-r ${getProbBar(analysis.probability)}`}>
                    {analysis.probability}%
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate mb-3">
                    {analysis.disease || 'Unknown'}
                  </h3>

                  {/* Confidence bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Confidence</span>
                      <span className={`font-bold ${getProbColor(analysis.probability)}`}>{analysis.probability}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getProbBar(analysis.probability)} rounded-full`}
                        style={{ width: `${analysis.probability}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaCalendar className="text-xs" />
                      <span>{new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800 capitalize">
                        {analysis.affectedArea || 'N/A'}
                      </span>
                      <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-100 dark:border-purple-800">
                        {analysis.imageQualityLabel || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link to={`/result?id=${analysis.id}`}
                      state={{
                        analysisId: analysis.id,
                        analysisResult: {
                          disease: analysis.disease,
                          probability: analysis.probability,
                          affectedArea: analysis.affectedArea,
                          imageQuality: analysis.imageQuality,
                          imageQualityLabel: analysis.imageQualityLabel,
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold text-sm"
                    >
                      <FaEye /><span>View Report</span>
                    </Link>
                    <button onClick={() => handleDeleteClick(analysis)}
                      disabled={deletingId === analysis.id}
                      className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105 transition-all disabled:opacity-50 border border-red-100 dark:border-red-800">
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredAnalyses.length > 0 && (
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {[
                { value: analyses.length, label: 'Total Analyses', color: 'text-blue-600 dark:text-blue-400' },
                { value: new Set(analyses.map(a => a.disease)).size, label: 'Unique Conditions', color: 'text-purple-600 dark:text-purple-400' },
                {
                  value: analyses.length > 0
                    ? Math.round(analyses.reduce((s, a) => s + (a.probability || 0), 0) / analyses.length) + '%'
                    : '0%',
                  label: 'Avg. Confidence', color: 'text-green-600 dark:text-green-400'
                },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`text-4xl font-black ${stat.color} mb-2`}>{stat.value}</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default History;
