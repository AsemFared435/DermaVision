import { useLanguage } from '../context/LanguageContext';
import { en } from '../locales/en';
import { ar } from '../locales/ar';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const translations = {
    en,
    ar
  };

  const t = translations[language];

  return { t, language };
};