import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaLock, FaTimesCircle } from 'react-icons/fa';
import authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { t, language } = useTranslation();
  const copy = t.auth?.resetPassword || {};
  const isArabic = language === 'ar';

  const validate = () => {
    if (newPassword.length < 8) {
      return copy.passwordTooShort || 'Password must be at least 8 characters.';
    }
    if (newPassword !== confirmPassword) {
      return copy.passwordMismatch || 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    const result = await authService.resetPassword(token, newPassword);
    if (result.success) {
      setIsSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || copy.error || 'Failed to reset password.');
    }
    setIsLoading(false);
  };

  if (!token) {
    return (
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4"
      >
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {copy.invalidTitle || 'Invalid Reset Link'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {copy.invalidMessage || 'This reset link is missing a token. Please request a new password reset link.'}
            </p>
            <Link
              to="/forgot-password"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              {copy.requestNewLink || 'Request New Link'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4"
      >
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {copy.successTitle || 'Password Reset Complete'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {copy.successMessage || 'Password has been reset successfully.'}
            </p>
            <Link
              to="/signin"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              {copy.backToSignIn || 'Back to Sign In'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">DERMAVISION</h1>
            <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>

          <div className="px-8 py-10">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLock className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {copy.title || 'Reset Password'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {copy.description || 'Enter a new password for your account.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {copy.newPassword || 'New password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={copy.newPasswordPlaceholder || 'Enter new password'}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {copy.confirmPassword || 'Confirm password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={copy.confirmPasswordPlaceholder || 'Confirm new password'}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className={`animate-spin h-5 w-5 ${isArabic ? 'ml-3' : 'mr-3'}`} viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {copy.submitting || 'Resetting...'}
                  </span>
                ) : (
                  copy.submit || 'Reset Password'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              <Link
                to="/signin"
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
              >
                {copy.backToSignIn || 'Back to Sign In'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
