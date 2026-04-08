import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { apiUrl, authHeaders } from '../config/api';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const [appointmentCount, setAppointmentCount] = useState(0);

  const featureCards = [
    {
      eyebrow: t('Privacy First'),
      title: t('Secure & Private'),
      desc: t('Your health data is encrypted and protected'),
    },
    {
      eyebrow: t('Fast Support'),
      title: t('Simple Tracking'),
      desc: t('Keep your care journey organized in one place'),
    },
    {
      eyebrow: t('Remote Care'),
      title: t('Trusted Access'),
      desc: t('Connect with doctors and follow your care updates easily'),
    },
  ];

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      if (user?.role !== 'patient' || !token) {
        setAppointmentCount(0);
        return;
      }

      try {
        const response = await axios.get(apiUrl('/appointments/patient'), {
          headers: authHeaders(token),
        });
        setAppointmentCount(response.data.appointments?.length || 0);
      } catch (error) {
        console.error('Error fetching appointment count:', error);
        setAppointmentCount(0);
      }
    };

    fetchPatientAppointments();
  }, [token, user?.role]);

  const quickActions = useMemo(() => {
    if (user?.role !== 'patient') {
      return [];
    }

    const actions = [
      {
        title: t('My Booking'),
        desc: t('Start with patient details and continue to the right doctor.'),
        cta: t('My Booking'),
        to: '/patient-details',
        accent: 'from-primary-600 to-sky-500',
      },
      {
        title: t('Explore Doctors'),
        desc: t('Find the best doctor for your needs'),
        cta: t('Explore Doctors'),
        to: '/explore-doctors',
        accent: 'from-slate-900 to-slate-700',
      },
      {
        title: t('My Appointments'),
        desc: t('Track booking ID and status'),
        cta: t('My Appointments'),
        to: '/my-appointments',
        accent: 'from-amber-500 to-orange-500',
      },
      {
        title: t('Prescription'),
        desc: t('Access your prescriptions anytime'),
        cta: t('Prescription'),
        to: '/prescription',
        accent: 'from-emerald-500 to-teal-500',
      },
    ];

    return actions;
  }, [t, user?.role]);

  const showQuickActions = quickActions.length > 0;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.22),_transparent_32%),radial-gradient(circle_at_85%_20%,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_46%,#eef4ff_100%)]">
      <section className="relative">
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial="hidden"
          animate="visible"
          variants={container}
        >
          <motion.div
            variants={fadeUp}
            animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-sky-200/45 blur-3xl"
          />
          <motion.div
            variants={fadeUp}
            animate={{ y: [0, 18, 0], x: [0, -14, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-primary-200/45 blur-3xl"
          />
        </motion.div>

        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 lg:grid-cols-1 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="relative z-10"
          >
            <div className="relative mx-auto flex min-h-[480px] max-w-[720px] items-center justify-center overflow-hidden rounded-[40px] border border-white/80 bg-[linear-gradient(145deg,#0f172a_0%,#1e3a8a_55%,#0ea5e9_100%)] p-8 shadow-[0_35px_90px_-35px_rgba(15,23,42,0.75)]">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.22, 0.38, 0.22] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute h-72 w-72 rounded-full bg-white/10 blur-3xl"
              />
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                className="absolute h-[340px] w-[340px] rounded-full border border-white/10"
              />
              <motion.div
                animate={{ rotate: [360, 180, 0] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                className="absolute h-[240px] w-[240px] rounded-full border border-dashed border-sky-200/30"
              />

              <div className="relative z-10 max-w-[520px] text-center text-white">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="mb-5 flex flex-col gap-3 sm:flex-row sm:justify-center"
                >
                  <Link to="/patient-details" className="inline-flex min-w-[150px] items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-slate-100">
                    {t('My Booking')}
                  </Link>
                  <Link to="/explore-doctors" className="inline-flex min-w-[170px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                    {t('Explore Doctors')}
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  className="text-base font-medium text-sky-100"
                >
                  {t('Your trusted healthcare partner')}
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-4 text-5xl font-black leading-tight md:text-7xl"
                >
                  {t('Welcome to MedCare')}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-5 text-sm leading-7 text-slate-100"
                >
                  {appointmentCount > 0
                    ? t('Your appointments, doctors, and prescriptions stay organized in one smooth experience.')
                    : t('Start your first booking and move through the app with a simpler, guided healthcare flow.')}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Better Care')}</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">{t('Why Choose MedCare?')}</h2>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={container}
          className="grid gap-6 lg:grid-cols-3"
        >
          {featureCards.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/85 p-7 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400 opacity-80"></div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">{feature.eyebrow}</p>
              <h3 className="mt-4 text-2xl font-black text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {showQuickActions && (
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Quick Access')}</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">{t('Continue Your Journey')}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/85 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}></div>
                <div className={`inline-flex rounded-full bg-gradient-to-r ${item.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white`}>
                  {item.title}
                </div>
                <h3 className="mt-5 text-2xl font-black text-slate-900">{item.title}</h3>
                <p className="mt-3 min-h-[88px] text-slate-600">{item.desc}</p>
                <Link to={item.to} className="btn-secondary mt-6 inline-flex w-full justify-center">
                  {item.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
