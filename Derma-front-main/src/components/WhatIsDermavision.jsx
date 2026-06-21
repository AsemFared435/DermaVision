import React from 'react';
import { FaCheckCircle, FaBrain, FaShieldAlt, FaClock } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

const WhatIsDermavision = () => {
  const { t } = useTranslation();

  const icons = [
    <FaBrain className="text-2xl" />,
    <FaClock className="text-2xl" />,
    <FaShieldAlt className="text-2xl" />,
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-[#EEF4F8] via-[#F6F9FC] to-[#E8F1F7] dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Image */}
          <div className="relative order-2 lg:order-1" data-aos="fade-right">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                <img
                  src="/images/dermavision-about-report.png"
                  alt="DERMAVISION Application Preview"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl px-3 py-2 hidden md:block"
                data-aos="zoom-in" data-aos-delay="200">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {t.whatIsDermavision.aiActive}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2" data-aos="fade-left">
            <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
              <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                {t.whatIsDermavision.badge}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t.whatIsDermavision.title}
            </h2>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {t.whatIsDermavision.description1}
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {t.whatIsDermavision.description2}
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {t.whatIsDermavision.features.map((feature, index) => (
                <div
                  key={index}
                  data-aos="fade-left"
                  data-aos-delay={100 + index * 100}
                  className="flex items-start space-x-4 rtl:space-x-reverse p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {icons[index]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{feature.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              {t.whatIsDermavision.highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 rtl:space-x-reverse"
                  data-aos="fade-left"
                  data-aos-delay={400 + index * 50}
                >
                  <FaCheckCircle className="text-green-600 dark:text-green-400 text-lg mt-1 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WhatIsDermavision;
