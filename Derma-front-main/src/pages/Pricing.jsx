import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/ month',
      description: 'Basic access to AI-based dermatological diagnosis for occasional users.',
      badge: null,
      popular: false,
      features: [
        { text: 'Diagnose up to 14 types of skin diseases', included: true },
        { text: 'Fast AI inference', included: true },
        { text: 'Basic ML models', included: true },
        { text: '1 analysis per month', included: true },
        { text: 'Detailed diagnostic report', included: false },
        { text: 'Personalized treatment plan', included: false },
        { text: 'Unlimited analyses', included: false },
        { text: 'Priority support', included: false },
        { text: 'Early access to new features', included: false },
        { text: 'Dedicated account manager', included: false }
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/signup',
      buttonStyle: 'outline'
    },
    {
      name: 'Monthly',
      price: '$19.99',
      period: '/ month',
      description: 'Ideal for regular users who need continuous monitoring and detailed analysis.',
      badge: 'Popular',
      badgeColor: 'bg-blue-600',
      popular: true,
      features: [
        { text: 'Diagnose 14 types of skin diseases', included: true },
        { text: 'Fast generation', included: true },
        { text: 'Advanced ML & LLM models', included: true },
        { text: 'Detailed diagnostic report', included: true },
        { text: 'Personalized treatment plan', included: true },
        { text: 'Unlimited analyses', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early access to new features', included: false },
        { text: 'Dedicated account manager', included: false }
      ],
      buttonText: 'Buy Monthly Now',
      buttonLink: '/signup',
      buttonStyle: 'primary'
    },
    {
      name: 'Yearly',
      price: '$99.99',
      period: '/ year',
      description: 'Best value plan with maximum features and long-term savings.',
      badge: 'Best Value',
      badgeColor: 'bg-green-600',
      popular: false,
      features: [
        { text: 'Diagnose 14 types of skin diseases', included: true },
        { text: 'Fast generation', included: true },
        { text: 'Advanced ML & LLM models', included: true },
        { text: 'Detailed diagnostic report', included: true },
        { text: 'Personalized treatment plan', included: true },
        { text: 'Unlimited analyses', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early access to new features', included: true },
        { text: 'Dedicated account manager', included: true }
      ],
      buttonText: 'Buy Yearly Now',
      buttonLink: '/signup',
      buttonStyle: 'primary'
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Unlock all the features of DERMAVISION and enjoy advanced AI-powered skin disease 
            diagnosis with flexible plans that fit your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-center">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                plan.popular 
                  ? 'lg:scale-110 lg:shadow-2xl border-2 border-blue-500' 
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-0 right-0 ${plan.badgeColor} text-white px-4 py-1 text-sm font-bold rounded-bl-xl`}>
                  {plan.badge}
                </div>
              )}

              {/* Card Content */}
              <div className="p-8">
                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-xl text-gray-500">{plan.period}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start space-x-3"
                    >
                      {feature.included ? (
                        <FaCheck className="text-green-600 text-lg mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-300 text-lg mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to={plan.buttonLink}
                  className={`block w-full py-4 text-center font-bold text-lg rounded-xl transition-all ${
                    plan.buttonStyle === 'primary'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              All Plans Include
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">HIPAA Compliant</h4>
                <p className="text-sm text-gray-600 text-center">
                  Your data is secure and protected
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Encrypted Data</h4>
                <p className="text-sm text-gray-600 text-center">
                  End-to-end encryption guaranteed
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">24/7 Support</h4>
                <p className="text-sm text-gray-600 text-center">
                  We're here to help anytime
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">
              Have questions about our plans?
            </p>
            <Link
              to="/#faqs"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              View Frequently Asked Questions
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-left">
                <h4 className="font-bold text-green-900">30-Day Money Back Guarantee</h4>
                <p className="text-sm text-green-700">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;