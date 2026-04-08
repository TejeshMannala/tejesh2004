import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const About = () => {
  const { t } = useTranslation();

  const highlights = [
    {
      title: t('Appointments'),
      description: t('Manage bookings and appointment updates in a simple patient-friendly flow.'),
    },
    {
      title: t('Doctors'),
      description: t('Connect patients with verified doctors across trusted specializations.'),
    },
    {
      title: t('Support'),
      description: t('Reach the support team quickly whenever you face a technical issue.'),
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_48%,#f1f5f9_100%)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BackButton />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6 space-y-6"
        >
          <div className="rounded-[34px] border border-white/80 bg-white/85 p-8 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.28)] backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('About')}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{t('About MedCare')}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              {t('MedCare helps you book doctors, manage appointments, and get prescriptions quickly.')}
            </p>

            <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] bg-gradient-to-br from-primary-600 to-sky-500 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100">{t('Purpose')}</p>
                <p className="mt-3 text-2xl font-bold">{t('Healthcare access made easier for patients and doctors')}</p>
                <p className="mt-4 text-sm leading-7 text-primary-100">
                  {t('MedCare is designed to make healthcare easier for patients, doctors, and admins.')}
                </p>
              </div>

              <div className="rounded-[28px] bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('One Platform')}</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {t('You can explore doctors, book appointments, view prescriptions, and reach support from one place.')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-sm backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">{item.title}</p>
                <p className="mt-4 text-xl font-semibold text-slate-900">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-900">{t('Contact Support')}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {t('If you encounter any technical issues, please use the Help page to submit your feedback.')}
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
