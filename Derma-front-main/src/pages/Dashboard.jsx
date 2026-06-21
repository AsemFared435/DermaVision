import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaHistory, FaCrown, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { SkeletonTable } from '../components/SkeletonLoader';
import diagnosisService from '../services/diagnosisService'; // ✅ Changed

const Dashboard = () => {
  const { currentUser, userData } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // ✅ استدعاء Backend API
        const response = await diagnosisService.getHistory(5); // Last 5

        if (response.success) {
          const analyses = response.data.analyses.map((analysis) => ({
            id: analysis.id,
            disease: analysis.predicted_label,
            probability: Math.round(analysis.confidence * 100),
            affectedArea: analysis.predicted_label,
            imageQuality: analysis.image_quality_label,
            createdAt: analysis.created_at,
          }));

          setRecentAnalyses(analyses);
          setTotalAnalyses(response.data.total || analyses.length);
        }
      } catch {
        setRecentAnalyses([]);
        setTotalAnalyses(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAnalyses();
  }, [currentUser]);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userData?.username || userData?.name || 'User'}! 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Here's your dermatology dashboard overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaCrown className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscription</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {userData?.subscription || 'Free'}
                </p>
              </div>
            </div>
          </div>

          {/* Total Analyses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <FaFileAlt className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAnalyses}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaHistory className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recentAnalyses.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Analyses */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Analyses</h2>
                <Link
                  to="/history"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-sm"
                >
                  View All →
                </Link>
              </div>

              {loading ? (
                <SkeletonTable rows={3} />
              ) : recentAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No analyses yet</p>
                  <Link
                    to="/upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Start Your First Analysis
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                            <FaFileAlt className="text-2xl text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {analysis.disease || 'Unknown Condition'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {analysis.probability || 0}%
                          </div>
                          <p className="text-xs text-gray-500">Confidence</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          {analysis.affectedArea || 'N/A'}
                        </span>
                        <Link
                          to={`/result?id=${analysis.id}`}
                          state={{ analysisId: analysis.id }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-sm"
                        >
                          View Report →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">
                      {(userData?.username || userData?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {userData?.username || userData?.name || 'User'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{userData?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold"
              >
                <FaUser />
                <span>Edit Profile</span>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 transition-all group"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-300">New Analysis</span>
                  <span className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>

                <Link
                  to="/chat"
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/40 dark:hover:to-emerald-900/40 transition-all group"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-300">AI Chat</span>
                  <span className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>

                <Link
                  to="/history"
                  className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 transition-all group"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-300">View History</span>
                  <span className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Upgrade Card */}
            {(!userData?.subscription || userData?.subscription === 'free') && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-8 text-white">
                <FaCrown className="text-4xl mb-4" />
                <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-white/90 mb-6">Unlock unlimited analyses and detailed reports</p>
                <Link
                  to="/pricing"
                  className="block w-full py-3 bg-white text-orange-600 text-center font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  View Plans
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
