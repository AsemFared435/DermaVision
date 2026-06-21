import React from 'react';
import { FaBrain, FaFileAlt, FaLock, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FaBrain className="text-3xl" />,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/30',
      border: 'hover:border-blue-400',
      stat: t.featuresSection.stats?.[0]?.value || '6',
      statLabel: t.featuresSection.stats?.[0]?.label || 'Supported Classes',
    },
    {
      icon: <FaFileAlt className="text-3xl" />,
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/30',
      border: 'hover:border-purple-400',
      stat: t.featuresSection.stats?.[1]?.value || 'Report',
      statLabel: t.featuresSection.stats?.[1]?.label || 'AI Diagnosis',
    },
    {
      icon: <FaLock className="text-3xl" />,
      gradient: 'from-green-500 to-emerald-500',
      shadow: 'shadow-green-500/30',
      border: 'hover:border-green-400',
      stat: t.featuresSection.stats?.[2]?.value || 'History',
      statLabel: t.featuresSection.stats?.[2]?.label || 'Saved Results',
    },
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-[#F6F9FC] via-[#F3F7FA] to-[#EEF4F8] dark:bg-none dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-full mb-4">
            {t.featuresSection.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t.featuresSection.title}
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t.featuresSection.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {t.featuresSection.items.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl ${features[index].shadow} border-2 border-slate-200/80 dark:border-gray-700 ${features[index].border} transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${features[index].gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon + Stat Row */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${features[index].gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {features[index].icon}
                </div>
                <div className="text-right rtl:text-left">
                  <div className={`text-3xl font-black bg-gradient-to-r ${features[index].gradient} bg-clip-text text-transparent`}>
                    {features[index].stat}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {features[index].statLabel}
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className={`flex items-center space-x-2 rtl:space-x-reverse text-sm font-bold bg-gradient-to-r ${features[index].gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <span>{t.featuresSection.learnMore}</span>
                <FaArrowRight className="text-xs" />
              </div>

              {/* Bottom accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${features[index].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div data-aos="fade-up" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-black mb-3">{t.featuresSection.ctaTitle}</h3>
          <p className="text-blue-100 text-lg mb-6 max-w-xl mx-auto">
            {t.featuresSection.ctaDescription}
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center space-x-3 rtl:space-x-reverse px-10 py-4 bg-white text-blue-600 font-black text-lg rounded-2xl hover:shadow-xl hover:scale-105 transition-all"
          >
            <span>{t.featuresSection.ctaButton}</span>
            <FaArrowRight />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default FeaturesSection;
