import React from 'react';
import { FaBrain, FaFileAlt, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from '../hooks/useTranslation';

const ImpactStats = () => {
  const { t } = useTranslation();

  const statsData = [
    { icon: <FaBrain className="text-3xl" />, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { icon: <FaFileAlt className="text-3xl" />, gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { icon: <FaCheckCircle className="text-3xl" />, gradient: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { icon: <FaShieldAlt className="text-3xl" />, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  ];
  const statLabels = t.impactStats.stats || [];
  const notes = t.impactStats.notes || [];

  return (
    <div className="py-24 bg-gray-950 dark:bg-gray-950 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <span className="inline-block px-4 py-2 bg-white/10 text-white text-sm font-bold rounded-full mb-4 border border-white/20">
            {t.impactStats.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {t.impactStats.title}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t.impactStats.subtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className={`group relative ${stat.bg} border ${stat.border} backdrop-blur-lg rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300`}
            >
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white mb-5 shadow-lg`}>
                {stat.icon}
              </div>

              {/* Number */}
              <div className={`text-4xl lg:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                {statLabels[index]?.value}
              </div>

              {/* Label */}
              <div className="text-white font-bold text-lg mb-1">
                {statLabels[index]?.label}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {statLabels[index]?.description}
              </p>
            </div>
          ))}
        </div>

        {/* Safety notes */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="200">
          {notes.map((note, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{note.title}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{note.text}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ImpactStats;
