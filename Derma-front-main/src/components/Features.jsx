import React from 'react';
import { FaCamera, FaRobot, FaFileAlt, FaUserMd } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

const Features = () => {
  const { t } = useTranslation();

  const icons = [
    <FaCamera className="text-4xl" />,
    <FaRobot className="text-4xl" />,
    <FaFileAlt className="text-4xl" />,
    <FaUserMd className="text-4xl" />,
  ];

  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-teal-500",
    "from-orange-500 to-red-500",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t.features.title}
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          {t.features.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {t.features.items.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
          >
            <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${colors[index]} text-white mb-6`}>
              {icons[index]}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;