import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaUpload, FaBrain, FaFileAlt } from 'react-icons/fa';
import AOS from 'aos';
import { useTranslation } from '../hooks/useTranslation';

const STEP_ICONS = [<FaUpload />, <FaBrain />, <FaFileAlt />];

const Hero = () => {
  const { t, language } = useTranslation();
  const isArabic = language === 'ar';
  const [activeStep, setActiveStep] = useState(0);
  const steps = t.hero.steps || [
    { title: 'Upload Photo', desc: 'Upload a clear photo of the skin area' },
    { title: 'AI Analysis', desc: 'The model provides a preliminary result and confidence score' },
    { title: 'Get Report', desc: 'Review the report and consult a dermatologist when needed' },
  ];
  const heroStats = t.hero.stats || [
    { value: '6', label: 'Supported Classes' },
    { value: 'Report', label: 'AI Diagnosis' },
    { value: 'History', label: 'Diagnosis History' },
  ];

  useEffect(() => {
    AOS.refresh();
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative overflow-hidden">

      {/* ===== Full-screen Hero Image Section ===== */}
      <div className="relative min-h-screen flex items-center">

        {/* Background Image - تملى الشاشة */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dermavision-hero.png"
            alt="DermaVision AI Skin Analysis"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay للنص يبقى واضح */}
          <div className={`absolute inset-0 ${
            isArabic
              ? 'bg-gradient-to-l from-black/90 via-black/65 to-black/35 dark:from-black/95 dark:via-black/75 dark:to-black/45'
              : 'bg-gradient-to-r from-black/85 via-black/60 to-black/35 dark:from-black/95 dark:via-black/70 dark:to-black/40'
          }`}></div>
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F3F7FA] dark:from-gray-900 to-transparent"></div>
        </div>

        {/* ===== Content over image ===== */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className={`max-w-2xl ${isArabic ? 'ml-auto text-right' : 'text-left'}`} data-aos={isArabic ? 'fade-left' : 'fade-right'}>

            {/* Badge */}
            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="text-white font-semibold text-sm tracking-wide">{t.hero.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
              {t.hero.title}
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mt-2">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl">
              {t.hero.description}
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row gap-4 mb-12 ${isArabic ? 'sm:justify-end' : ''}`}>
              <Link
                to="/upload"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transition-all flex items-center justify-center space-x-3 rtl:space-x-reverse"
              >
                <FaUpload className="text-base" />
                <span>{t.hero.getStarted}</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-base" />
              </Link>

              <Link
                to="/chat"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 font-bold text-lg rounded-2xl hover:bg-white/20 hover:border-white/50 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <span>💬</span>
                <span>{t.hero.tryAIChat}</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap gap-5 text-sm ${isArabic ? 'justify-end' : ''}`}>
              {[
                { label: t.hero.hipaa, color: 'text-green-400' },
                { label: t.hero.accuracy, color: 'text-cyan-400' },
                { label: t.hero.users, color: 'text-purple-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <FaCheckCircle className={`text-lg ${item.color}`} />
                  <span className="font-semibold text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== Floating Stats - يمين الصورة ===== */}
          <div className={`absolute top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 ${isArabic ? 'left-8 right-auto' : 'right-8'}`} data-aos="fade-up" data-aos-delay="400">

            {/* Skin Health Score */}
            <div className="bg-black/35 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-5 text-center min-w-[130px] shadow-2xl shadow-black/20">
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#scoreGrad)" strokeWidth="2.5"
                    strokeDasharray="92 100" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee"/>
                      <stop offset="100%" stopColor="#818cf8"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-sm">{heroStats[0].value}</span>
                </div>
              </div>
              <p className="text-white/85 text-xs font-medium tracking-wider uppercase">{heroStats[0].label}</p>
            </div>

            {/* Report */}
            <div className="bg-black/35 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-5 text-center shadow-2xl shadow-black/20">
              <div className="text-3xl font-black text-cyan-400 mb-1">{heroStats[1].value}</div>
              <p className="text-white/85 text-xs font-medium tracking-wider uppercase">{heroStats[1].label}</p>
            </div>

            {/* History */}
            <div className="bg-black/35 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-5 text-center shadow-2xl shadow-black/20">
              <div className="text-3xl font-black text-purple-400 mb-1">{heroStats[2].value}</div>
              <p className="text-white/85 text-xs font-medium tracking-wider uppercase">{heroStats[2].label}</p>
            </div>

            {/* Live indicator */}
            <div className="bg-green-950/45 dark:bg-green-500/20 backdrop-blur-xl border border-green-300/40 rounded-2xl p-4 flex items-center space-x-3 rtl:space-x-reverse shadow-2xl shadow-black/20">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
              <div>
                <p className="text-green-400 font-bold text-sm">{t.hero.aiActive}</p>
                <p className="text-white/80 text-xs">{t.hero.readyToScan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== How It Works Steps ===== */}
      <div className="relative z-10 bg-gradient-to-b from-[#F3F7FA] via-[#EEF4F8] to-[#F6F9FC] dark:bg-none dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3">
              {t.hero.howItWorks}
            </h2>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              {t.hero.howItWorksSubtitle}
            </p>
          </div>
          <div className="mb-8" data-aos="fade-up" data-aos-delay="50">
            <img
              src="/images/dermavision-how-it-works.png"
              alt="DermaVision how it works"
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700 object-cover"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="100">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex items-center space-x-4 rtl:space-x-reverse p-6 min-h-[112px] rounded-2xl border-2 transition-all duration-500 ${
                  activeStep === index
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-all duration-500 ${
                  activeStep === index
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className={isArabic ? 'text-right' : 'text-left'}>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base md:text-lg leading-tight">{step.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 rtl:right-auto rtl:-left-4 top-1/2 -translate-y-1/2 z-10 text-gray-300 dark:text-gray-600 text-xl">
                    {isArabic ? '←' : '→'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Hero;
