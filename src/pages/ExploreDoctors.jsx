import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { apiUrl } from '../config/api';

const ExploreDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    if (specializationFilter) {
      filtered = filtered.filter((doctor) => doctor.specialization === specializationFilter);
    }

    if (experienceFilter) {
      const minExp = parseInt(experienceFilter, 10);
      filtered = filtered.filter((doctor) => doctor.experience >= minExp);
    }

    if (feeFilter) {
      const maxFee = parseInt(feeFilter, 10);
      filtered = filtered.filter((doctor) => doctor.consultationFee <= maxFee);
    }

    setFilteredDoctors(filtered);
  }, [doctors, specializationFilter, experienceFilter, feeFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/doctors'));
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (doctorId) => {
    localStorage.setItem('preferredDoctorId', doctorId);
    navigate('/patient-details');
  };

  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization))].filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600">{t('Loading doctors...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <BackButton />

        <div className="mt-6 rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">{t('Explore Doctors')}</h1>
          <p className="mt-2 text-slate-600">{t('Find the best doctor for your needs')}</p>

          {location.state?.bookingGuardMessage && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
              {location.state.bookingGuardMessage}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-primary-900">
                  {t('Enter patient details first, then proceed to the doctor page and choose the best doctor.')}
                </p>
              </div>
              <button className="btn-primary" onClick={() => navigate('/patient-details')}>
                {t('Start Appointment')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">{t('Specialization')}</label>
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="form-input"
              >
                <option value="">{t('All Specializations')}</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">{t('Experience')}</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="form-input"
              >
                <option value="">{t('All Experience Levels')}</option>
                <option value="0">{t('0+ years')}</option>
                <option value="5">{t('5+ years')}</option>
                <option value="10">{t('10+ years')}</option>
                <option value="15">{t('15+ years')}</option>
              </select>
            </div>

            <div>
              <label className="form-label">{t('Fee Range')}</label>
              <select
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                className="form-input"
              >
                <option value="">{t('Any Fee')}</option>
                <option value="500">{t('Under Rs. 500')}</option>
                <option value="1000">{t('Under Rs. 1000')}</option>
                <option value="1500">{t('Under Rs. 1500')}</option>
                <option value="2000">{t('Under Rs. 2000')}</option>
              </select>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredDoctors.length}</span> {t('doctors found')}
          </p>
        </div>

        <div className="mt-8">
          {filteredDoctors.length === 0 ? (
            <div className="rounded-[28px] bg-white p-12 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">{t('No doctors found')}</h3>
              <p className="mt-3 text-slate-600">
                {t('Run npm run seed inside backend to insert doctor details into the database.')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="overflow-hidden rounded-[28px] bg-white shadow-sm"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                    <img
                      src={doctor.userId?.profileImage || '/default-doctor.png'}
                      alt={doctor.userId?.fullName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-doctor.png';
                      }}
                    />
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{doctor.userId?.fullName}</h3>
                        <p className="mt-1 text-sm font-medium text-primary-700">{doctor.specialization}</p>
                      </div>
                      <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                        {Number(doctor.rating || 4.5).toFixed(1)}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-700">
                      <p><strong>{t('Experience')}:</strong> {doctor.experience} {t('years')}</p>
                      <p><strong>{t('Qualification')}:</strong> {doctor.qualification}</p>
                      <p><strong>{t('Fee')}:</strong> Rs. {doctor.consultationFee}</p>
                      <p><strong>{t('Email')}:</strong> {doctor.userId?.email}</p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {doctor.bio || t('Experienced healthcare professional dedicated to patient care.')}
                    </p>

                    <div className="mt-6 flex gap-3">
                      <button className="btn-secondary flex-1" onClick={() => setSelectedDoctor(doctor)}>
                        {t('View Details')}
                      </button>
                      <button className="btn-primary flex-1" onClick={() => handleBookNow(doctor._id)}>
                        {t('Book Appointment')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-8 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedDoctor.userId?.fullName}</h2>
                  <p className="mt-1 text-primary-700">{selectedDoctor.specialization}</p>
                </div>
                <button className="btn-outline px-4 py-2" onClick={() => setSelectedDoctor(null)}>
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Experience')}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{selectedDoctor.experience} {t('years')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Consultation Fee')}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">Rs. {selectedDoctor.consultationFee}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Qualification')}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{selectedDoctor.qualification}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Contact')}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{selectedDoctor.userId?.email}</p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-600">{selectedDoctor.bio}</p>

              <div className="mt-8">
                <button
                  className="btn-primary w-full"
                  onClick={() => {
                    setSelectedDoctor(null);
                    handleBookNow(selectedDoctor._id);
                  }}
                >
                  {t('Proceed With This Doctor')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreDoctors;
