export const supportedLanguages = [
  { code: 'en', label: 'English', locale: 'en-IN', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', locale: 'hi-IN', dir: 'ltr' },
  { code: 'te', label: 'Telugu', locale: 'te-IN', dir: 'ltr' },
  { code: 'ta', label: 'Tamil', locale: 'ta-IN', dir: 'ltr' },
];

export const normalizeLanguage = (language = 'en') => {
  const baseLanguage = String(language).toLowerCase().split('-')[0];
  return supportedLanguages.some(({ code }) => code === baseLanguage) ? baseLanguage : 'en';
};

export const getLanguageConfig = (language = 'en') =>
  supportedLanguages.find(({ code }) => code === normalizeLanguage(language)) || supportedLanguages[0];

export const getLocaleFromLanguage = (language = 'en') => getLanguageConfig(language).locale;

export const formatDate = (value, language = 'en', options = {}) =>
  new Intl.DateTimeFormat(getLocaleFromLanguage(language), options).format(new Date(value));

export const formatTime = (value, language = 'en', options = {}) =>
  new Intl.DateTimeFormat(getLocaleFromLanguage(language), options).format(new Date(value));

export const formatDateTime = (value, language = 'en', options = {}) =>
  new Intl.DateTimeFormat(getLocaleFromLanguage(language), options).format(new Date(value));
