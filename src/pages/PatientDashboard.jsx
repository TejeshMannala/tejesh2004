import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const items = [
    {
      title: t('Book Appointment'),
      description: t('Schedule an appointment with your preferred doctor'),
      to: '/patient-details',
    },
    {
      title: t('My Appointments'),
      description: t('View and manage your scheduled appointments'),
      to: '/my-appointments',
    },
    {
      title: t('Explore Doctors'),
      description: t('Browse doctors by specialization'),
      to: '/explore-doctors',
    },
    {
      title: t('My Prescriptions'),
      description: t('Access your medical prescriptions and history'),
      to: '/prescription',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Welcome')}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            {t('Welcome')}, {user?.fullName}!
          </h1>
          <p className="mt-4 text-slate-600">{t('Manage your appointments and health records')}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="rounded-[28px] bg-gradient-to-br from-primary-600 to-primary-400 p-6 text-white shadow-sm"
            >
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-primary-100">{item.description}</p>
              <Link to={item.to} className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm">
                {t('Open')}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
