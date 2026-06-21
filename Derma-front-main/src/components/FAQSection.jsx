import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from '../hooks/useTranslation';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const { t } = useTranslation();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="py-20 bg-gradient-to-b from-[#EEF4F8] via-[#F6F9FC] to-[#F3F7FA] dark:bg-none dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.faqSection.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t.faqSection.subtitle}
          </p>
        </div>

        <div className="space-y-4">
          {t.faqSection.faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border-2 border-slate-200/80 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left rtl:text-right flex items-center justify-between hover:bg-[#F3F7FA] dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-bold text-gray-900 dark:text-white text-lg pr-8 rtl:pr-0 rtl:pl-8">
                  {faq.question}
                </span>
                <span className="text-blue-600 dark:text-blue-400 text-xl flex-shrink-0">
                  {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"}`}>
                <div className="px-6 pb-5 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
