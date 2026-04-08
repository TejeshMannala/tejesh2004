import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate, formatTime } from '../utils/locale';

const AppointmentConfirmation = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    timeSlot: '',
    consultationType: 'online',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedPatientData = JSON.parse(localStorage.getItem('patientData'));
    const preferredDoctorId = localStorage.getItem('preferredDoctorId');
    if (!storedPatientData) {
      navigate('/patient-details');
      return;
    }

    if (!doctorId || !preferredDoctorId || preferredDoctorId !== doctorId) {
      navigate('/explore-doctors', {
        replace: true,
        state: {
          bookingGuardMessage: t('Please select a doctor first, then proceed to booking.'),
        },
      });
      return;
    }

    setPatientData(storedPatientData);
    fetchDoctorDetails();
  }, [doctorId, token, navigate, t]);

  useEffect(() => {
    if (doctor?.availableSlots?.length) {
      generateAvailableSlots(doctor.availableSlots);
    }
  }, [doctor, i18n.resolvedLanguage]);

  const fetchDoctorDetails = async () => {
    try {
      setIsDoctorLoading(true);
      const response = await axios.get(apiUrl(`/doctors/${doctorId}`), {
        headers: authHeaders(token),
      });

      if (response.data.success) {
        setDoctor(response.data.doctor);
        generateAvailableSlots(response.data.doctor.availableSlots || []);
      } else {
        setErrors({ doctor: t('Please select a valid doctor before booking.') });
      }
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      setErrors({ doctor: t('Please select a doctor before booking an appointment.') });
    } finally {
      setIsDoctorLoading(false);
    }
  };

  const generateAvailableSlots = (doctorSlots) => {
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = formatDate(date, i18n.resolvedLanguage, { weekday: 'long' }).toLowerCase();
      const daySlots = doctorSlots.find((slot) => slot.day.toLowerCase() === dayName);

      if (daySlots) {
        const startTime = new Date(`2000-01-01T${daySlots.startTime}`);
        const endTime = new Date(`2000-01-01T${daySlots.endTime}`);
        const timeSlots = [];
        const currentTime = new Date(startTime);

        while (currentTime < endTime) {
          timeSlots.push({
            time: formatTime(currentTime, i18n.resolvedLanguage, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
            value: currentTime.toTimeString().substring(0, 5),
          });
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        slots.push({
          date: date.toISOString().split('T')[0],
          displayDate: formatDate(date, i18n.resolvedLanguage, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          timeSlots,
        });
      }
    }

    setAvailableSlots(slots);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAppointmentData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!appointmentData.date) nextErrors.date = t('Please select a date');
    if (!appointmentData.timeSlot) nextErrors.timeSlot = t('Please select a time slot');

    const selectedDate = new Date(appointmentData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      nextErrors.date = t('Cannot book appointment for past date');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        apiUrl('/appointments'),
        {
          doctorId,
          date: appointmentData.date,
          timeSlot: appointmentData.timeSlot,
          consultationType: appointmentData.consultationType,
          patientDetails: patientData.patientDetails,
          healthInfo: patientData.healthInfo,
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        localStorage.removeItem('patientData');
        localStorage.removeItem('preferredDoctorId');
        navigate('/my-appointments', {
          state: {
            bookingSuccess: true,
            appointment: response.data.appointment,
          },
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ submit: t('Failed to book appointment. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDoctorLoading || !patientData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-slate-600">{t('Loading appointment details...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <BackButton />
          <div className="mt-6 rounded-[32px] border border-amber-200 bg-amber-50 p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">{t('Select Doctor First')}</h1>
            <p className="mt-3 text-slate-700">
              {errors.doctor || t('Please select a doctor before booking an appointment.')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => navigate('/explore-doctors')}>
                {t('Choose Doctor')}
              </button>
              <button className="btn-outline" onClick={() => navigate('/recommend-doctors')}>
                {t('Recommended Doctors')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedDateSlots = availableSlots.find((slot) => slot.date === appointmentData.date);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,212,255,0.45),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_50%,#eef2ff_100%)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BackButton />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.28)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Appointment Review')}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{t('Confirm Your Appointment')}</h1>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {t('Review patient details, choose a slot, and confirm your appointment.')}
              </p>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-900">{t('Patient Information')}</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Name')}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{patientData.patientDetails.fullName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Age')}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{patientData.patientDetails.age} {t('years')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Gender')}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{t(patientData.patientDetails.gender)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Mobile')}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{patientData.patientDetails.mobileNumber}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-900">{t('Health Concern')}</h2>
              <div className="mt-6 space-y-3 text-sm leading-7 text-slate-700">
                <p><strong>{t('Problem')}:</strong> {patientData.healthInfo.problemDescription}</p>
                {patientData.healthInfo.symptoms.length > 0 && (
                  <p><strong>{t('Symptoms')}:</strong> {patientData.healthInfo.symptoms.join(', ')}</p>
                )}
                <p><strong>{t('Severity')}:</strong> {t(patientData.healthInfo.severity)}</p>
                {patientData.healthInfo.duration && (
                  <p><strong>{t('Duration')}:</strong> {patientData.healthInfo.duration}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-900">{t('Selected Doctor')}</h2>
              <div className="mt-6 flex items-start justify-between gap-4 rounded-[28px] bg-slate-50 p-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{doctor.userId?.fullName}</h3>
                  <p className="mt-2 text-sm font-medium text-primary-700">{doctor.specialization}</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>{doctor.experience}+ {t('years experience')}</p>
                    <p>{Number(doctor.rating || 4.5).toFixed(1)} star rating</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-lg font-bold text-slate-900 shadow-sm">
                  Rs. {doctor.consultationFee}
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Doctor')}</p>
                  <p className="mt-2 font-semibold text-slate-900">{doctor.userId?.fullName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Experience')}</p>
                  <p className="mt-2 font-semibold text-slate-900">{doctor.experience} {t('years')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t('Consultation Fee')}</p>
                  <p className="mt-2 font-semibold text-slate-900">Rs. {doctor.consultationFee}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)] backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-900">{t('Schedule Appointment')}</h2>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="form-label">{t('Select Date')} *</label>
                  <select
                    name="date"
                    value={appointmentData.date}
                    onChange={handleInputChange}
                    className={`form-input ${errors.date ? 'error' : ''}`}
                  >
                    <option value="">{t('Choose a date')}</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.date} value={slot.date}>
                        {slot.displayDate}
                      </option>
                    ))}
                  </select>
                  {errors.date && <p className="form-error">{errors.date}</p>}
                </div>

                {appointmentData.date && selectedDateSlots && (
                  <div>
                    <label className="form-label">{t('Select Time Slot')} *</label>
                    <select
                      name="timeSlot"
                      value={appointmentData.timeSlot}
                      onChange={handleInputChange}
                      className={`form-input ${errors.timeSlot ? 'error' : ''}`}
                    >
                      <option value="">{t('Choose a time')}</option>
                      {selectedDateSlots.timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.time}
                        </option>
                      ))}
                    </select>
                    {errors.timeSlot && <p className="form-error">{errors.timeSlot}</p>}
                  </div>
                )}

                <div>
                  <label className="form-label">{t('Consultation Type')}</label>
                  <select
                    name="consultationType"
                    value={appointmentData.consultationType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="online">{t('Online Consultation')}</option>
                    <option value="offline">{t('In-Person Visit')}</option>
                  </select>
                </div>

                {errors.doctor && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.doctor}
                  </div>
                )}

                {errors.submit && (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.submit}
                  </div>
                )}

                <button
                  className="btn-primary w-full"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || !appointmentData.date || !appointmentData.timeSlot}
                >
                  {isSubmitting ? t('Booking...') : t('Confirm Booking')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
