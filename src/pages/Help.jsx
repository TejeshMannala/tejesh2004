import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { API_URL } from '../config/api';
import { formatDateTime } from '../utils/locale';

const Help = () => {
  const { user, token } = useContext(AuthContext);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { t, i18n } = useTranslation();

  const fetchFeedbackHistory = async () => {
    if (!token) return;

    setFetching(true);
    try {
      const response = await axios.get(`${API_URL}/support/feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedbacks(response.data.feedbacks || []);
    } catch (error) {
      console.error('Failed to load feedback history:', error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setStatus(t('Please login to send feedback.'));
      return;
    }

    if (!subject || !message) {
      setStatus(t('Please fill in both fields.'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/support/feedback`,
        { subject, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(t('Feedback sent successfully. Support will contact you soon.'));
      setSubject('');
      setMessage('');
      fetchFeedbackHistory();
    } catch (error) {
      setStatus(error.response?.data?.message || t('Unable to send feedback.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,212,255,0.45),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_50%,#eef2ff_100%)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BackButton />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.35)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Help')}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{t('Contact Support')}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {t('Need help? Contact support for technical issues.')}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Fast Response')}</p>
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    {t('Our team reviews feedback and helps rectify technical issues quickly.')}
                  </p>
                </div>
                <div className="rounded-[24px] bg-gradient-to-br from-primary-600 to-sky-500 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100">{t('Support Flow')}</p>
                  <p className="mt-3 text-lg font-semibold">
                    {t('Send your issue, track your request, and stay updated from one place.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('Feedback History')}</h2>
                  <p className="mt-2 text-sm text-slate-600">{t('Review your previous support requests here.')}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {fetching ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">{t('Loading...')}</div>
                ) : feedbacks.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                    {t('No feedback yet. Send a message and support will reach out.')}
                  </div>
                ) : (
                  feedbacks.map((feedback) => (
                    <div key={feedback._id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{feedback.subject}</h3>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {formatDateTime(feedback.createdAt, i18n.resolvedLanguage)}
                          </p>
                        </div>
                        <span className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                          {t(feedback.status)}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{feedback.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Support Form')}</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">{t('Send Feedback')}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {user
                ? t('Share your issue and our support team will follow up.')
                : t('Please login to send feedback and get support.')}
            </p>

            {user ? (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="subject" className="form-label">
                    {t('Subject')}
                  </label>
                  <input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t('Describe your issue')}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="form-label">
                    {t('Message')}
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="7"
                    placeholder={t('Your feedback helps us fix the problem')}
                    className="form-input min-h-[180px] resize-y"
                  />
                </div>

                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? t('Submitting...') : t('Send Feedback')}
                </button>

                {status && (
                  <div className="rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
                    {status}
                  </div>
                )}
              </form>
            ) : (
              <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
                {t('Please login to send feedback and get support.')}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Help;
