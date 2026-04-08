import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BackButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-50"
    >
      <span aria-hidden="true">&larr;</span>
      {t('Back')}
    </button>
  );
};

export default BackButton;
