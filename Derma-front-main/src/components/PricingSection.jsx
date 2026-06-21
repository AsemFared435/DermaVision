import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaCrown, FaStar, FaRocket } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

const PricingSection = () => {
  const { t } = useTranslation();

  const icons = [
    <FaStar className="text-3xl" />,
    <FaCrown className="text-3xl" />,
    <FaRocket className="text-3xl" />,
  ];

  const iconBgs = [
    'from-gray-400 to-gray-600',
    'from-blue-500 to-purple-600',
    'from-green-500 to-emerald-600',
  ];

  const badgeColors = [null, 'bg-blue-600', 'bg-green-600'];
  const popularIndex = 1;

  return (
    <div className="py-20 bg-gradient-to-b from-[#F6F9FC] via-[#EEF4F8] to-[#F3F7FA] dark:bg-none dark:bg-gray-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.pricingSection.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {t.pricingSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {t.pricingSection.plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 ${
                index === popularIndex
                  ? 'shadow-2xl ring-2 ring-blue-500 transform md:scale-105'
                  : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <div className={`absolute top-0 right-0 rtl:right-auto rtl:left-0 ${badgeColors[index]} text-white px-4 py-1 text-sm font-bold rounded-bl-xl rtl:rounded-bl-none rtl:rounded-br-xl`}>
                  {plan.badge}
                </div>
              )}

              <div className={`bg-gradient-to-r ${iconBgs[index]} p-8 text-white text-center`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  {icons[index]}
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-xl text-gray-500 dark:text-gray-400">{plan.period}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 min-h-[4rem]">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3 rtl:space-x-reverse">
                      {feature.included ? (
                        <FaCheck className="text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/signup"
                  className={`block w-full py-4 text-center font-bold text-lg rounded-xl transition-all ${
                    index === popularIndex
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                      : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.pricingSection.needDetails}
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-blue-600 hover:text-blue-700 font-semibold text-lg"
          >
            <span>{t.pricingSection.viewFull}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PricingSection;
