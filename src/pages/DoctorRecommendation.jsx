import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

const DoctorRecommendation = () => {
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRecommendedDoctors = async () => {
      try {
        const patientData = JSON.parse(localStorage.getItem('patientData'));
        if (!patientData) {
          navigate('/patient-details');
          return;
        }

        const response = await axios.post(
          apiUrl('/appointments/recommend-doctors'),
          {
            problemDescription: patientData.healthInfo.problemDescription,
            symptoms: patientData.healthInfo.symptoms,
          },
          {
            headers: authHeaders(token),
          }
        );

        if (response.data.success) {
          setRecommendedDoctors(response.data.doctors || []);
          setSpecialization(response.data.recommendedSpecialization || '');
        }
      } catch (fetchError) {
        console.error('Error fetching recommended doctors:', fetchError);
        setError(t('Failed to load recommended doctors. Please try again.'));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedDoctors();
  }, [navigate, t, token]);

  const handleBookAppointment = (doctorId) => {
    localStorage.setItem('preferredDoctorId', doctorId);
    navigate(`/book-appointment/${doctorId}`);
  };

  const handleTryDifferentProblem = () => {
    navigate('/patient-details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-600">{t('Finding the best doctors for you...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <BackButton />

        <div className="mt-6 rounded-[28px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">{t('Recommended Doctors')}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            {t('Based on your symptoms, we recommend consulting a')}{' '}
            <strong>{specialization || t('General Physician')}</strong>
          </p>
        </div>

        {error ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-8 shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
            <button onClick={handleTryDifferentProblem} className="btn-outline mt-6">
              {t('Try Again')}
            </button>
          </div>
        ) : recommendedDoctors.length === 0 ? (
          <div className="mt-8 rounded-[28px] bg-white p-10 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              {t('No doctors available for the recommended specialization at the moment.')}
            </p>
            <button onClick={handleTryDifferentProblem} className="btn-secondary mt-6">
              {t('Try with Different Problem Description')}
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendedDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="rounded-[28px] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {doctor.userId?.fullName || doctor.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-primary-700">{doctor.specialization}</p>
                  </div>
                  <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                    {Number(doctor.rating || 4.5).toFixed(1)}
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-700">
                  <p><strong>{t('Experience')}:</strong> {doctor.experience} {t('years')}</p>
                  <p><strong>{t('Qualification')}:</strong> {doctor.qualification}</p>
                  <p><strong>{t('Consultation Fee')}:</strong> Rs. {doctor.consultationFee}</p>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {doctor.bio || t('Experienced healthcare professional dedicated to patient care.')}
                </p>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {t('Available Slots')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {doctor.availableSlots?.length > 0 ? (
                      doctor.availableSlots.slice(0, 3).map((slot, slotIndex) => (
                        <span
                          key={`${doctor._id}-${slot.day}-${slotIndex}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">{t('Check availability')}</span>
                    )}
                  </div>
                </div>

                <button className="btn-primary mt-6 w-full" onClick={() => handleBookAppointment(doctor._id)}>
                  {t('Proceed With This Doctor')}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-[28px] bg-white p-8 shadow-sm">
          <p className="text-slate-700">{t('Not satisfied with recommendations?')}</p>
          <button onClick={handleTryDifferentProblem} className="btn-outline mt-4">
            {t('Change Problem Description')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorRecommendation;
