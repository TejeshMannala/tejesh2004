import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageConfig, normalizeLanguage } from '../utils/locale';

const LanguageSync = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const activeLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
    const { dir } = getLanguageConfig(activeLanguage);

    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = dir;
    localStorage.setItem('locale', activeLanguage);
  }, [i18n.language, i18n.resolvedLanguage]);

  return null;
};

export default LanguageSync;
