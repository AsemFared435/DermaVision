import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaGlobe } from 'react-icons/fa';

const LanguageSwitcher = ({ variant = 'default' }) => {
  const { language, toggleLanguage, isArabic } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
        aria-label="Switch Language"
      >
        <FaGlobe className="text-lg" />
        <span className="font-semibold">{isArabic ? 'English' : 'العربية'}</span>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
        aria-label="Switch Language"
        title={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <FaGlobe className="text-gray-700 dark:text-gray-300 text-xl" />
      </button>
    );
  }

  // Default variant
  return (
    <div className="relative inline-block">
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 group"
        aria-label="Switch Language"
      >
        <FaGlobe className="text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          {language.toUpperCase()}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;