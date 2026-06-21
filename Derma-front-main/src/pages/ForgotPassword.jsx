import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const { t, language } = useTranslation();
  const copy = t.auth?.forgotPassword || {};
  const isArabic = language === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await authService.forgotPassword(email);
    if (result.success) {
      setEmailSent(true);
    } else {
      setError(copy.error || result.error || 'Failed to request password reset.');
    }
    setIsLoading(false);
  };

  if (emailSent) {
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
              {copy.successTitle || 'Check Your Email'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {copy.successMessage || 'If an account exists, password reset instructions have been sent.'}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 mb-8">
              {copy.inboxNote || 'Please check your email inbox and spam folder for the reset link.'}
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
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">DERMAVISION</h1>
            <div className="w-20 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEnvelope className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {copy.title || 'Forgot Password?'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {copy.description || 'Enter your email to request password reset instructions.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {copy.emailLabel || 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder || 'Enter Your E-mail'}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all outline-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit Button */}
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
                    {copy.sending || 'Sending...'}
                  </span>
                ) : (
                  copy.submit || 'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Sign In */}
            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              {copy.rememberPassword || 'Remember your password?'}{' '}
              <Link 
                to="/signin" 
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
              >
                {copy.signIn || 'Sign In'}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition font-medium"
          >
            {isArabic ? `${copy.backToHome || 'العودة للرئيسية'} ←` : `← ${copy.backToHome || 'Back to Home'}`}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
