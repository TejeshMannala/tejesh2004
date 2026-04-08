import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const patientLinks = [{ to: '/', label: t('Home') }];

  const doctorLinks = [{ to: '/', label: t('Home') }];

  const guestLinks = [
    { to: '/', label: t('Home') },
    { to: '/help', label: t('Help') },
    { to: '/about', label: t('About') },
  ];

  const roleLinks = user?.role === 'patient' ? patientLinks : user?.role === 'doctor' ? doctorLinks : [{ to: '/', label: t('Home') }];

  const utilityLinks = user
    ? [
        { to: '/help', label: t('Help') },
        { to: '/about', label: t('About') },
      ]
    : guestLinks;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const isActive = (to) => location.pathname === to;

  const navLinkClass = (to) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive(to)
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-50 border-b border-white/70 bg-slate-50/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3" onClick={closeMobile}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 text-xl text-white shadow-sm">
            +
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">MedCare</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Smart Care Portal
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {roleLinks.map((item) => (
            <Link key={item.to} to={item.to} className={navLinkClass(item.to)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {utilityLinks
            .filter((item) => item.to !== '/login')
            .map((item) => (
              <Link key={item.to} to={item.to} className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900">
                {item.label}
              </Link>
            ))}

          <div className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <LanguageSelector />
          </div>

          {user ? (
            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="hidden text-right xl:block">
                <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
                {t('Logout')}
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          {mobileOpen ? 'X' : '='}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-2">
              {roleLinks.map((item) => (
                <Link key={item.to} to={item.to} onClick={closeMobile} className={navLinkClass(item.to)}>
                  {item.label}
                </Link>
              ))}
              {utilityLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <LanguageSelector />
            </div>

            {user ? (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
                  {t('Logout')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Navbar;
