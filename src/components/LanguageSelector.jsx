import React from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeLanguage, supportedLanguages } from '../utils/locale';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const selectedLanguage = normalizeLanguage(i18n.resolvedLanguage || i18n.language);

  const changeLanguage = async (lng) => {
    const nextLanguage = normalizeLanguage(lng);
    localStorage.setItem('locale', nextLanguage);
    await i18n.changeLanguage(nextLanguage);
  };

  return (
    <div className="w-full">
      <select
        value={selectedLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
      >
        {supportedLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
