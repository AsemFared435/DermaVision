import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-[150px] md:text-[200px] font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none">
            404
          </h1>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
            <FaSearch className="relative text-6xl text-gray-400 mx-auto" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved or deleted, or you may have mistyped the URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all"
          >
            <FaHome />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/upload"
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 font-bold text-lg rounded-xl hover:bg-blue-50 transition-all"
          >
            <span>Start Analysis</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="mt-12">
          <p className="text-gray-600 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/pricing" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-all">
              Pricing
            </Link>
            <Link to="/chat" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all">
              AI Chat
            </Link>
            <Link to="/dashboard" className="px-4 py-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-all">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;