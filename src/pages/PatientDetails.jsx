import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

const PatientDetails = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    mobileNumber: '',
    email: '',
    problemDescription: '',
    symptoms: [],
    duration: '',
    severity: '',
    hasMedicalHistory: false,
    medicalHistoryDetails: '',
    currentMedications: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const symptomOptions = [
    'Fever',
    'Cold',
    'Cough',
    'Headache',
    'Stomach pain',
    'Skin issues',
    'Body pain',
    'Joint pain',
    'Chest pain',
    'Breathing difficulty',
    'Fatigue',
    'Nausea',
    'Dizziness',
    'Others',
  ];

  const severityOptions = ['Mild', 'Moderate', 'Severe'];

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSymptomChange = (symptom) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((entry) => entry !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) nextErrors.fullName = t('Full name is required');
    if (!formData.age || formData.age < 1 || formData.age > 120) nextErrors.age = t('Valid age is required');
    if (!formData.gender) nextErrors.gender = t('Gender is required');
    if (!formData.mobileNumber || !/^\d{10}$/.test(formData.mobileNumber)) {
      nextErrors.mobileNumber = t('Valid 10-digit mobile number is required');
    }
    if (!formData.problemDescription.trim()) nextErrors.problemDescription = t('Problem description is required');
    if (!formData.severity) nextErrors.severity = t('Severity level is required');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(apiUrl('/appointments/patient-details'), formData, {
        headers: authHeaders(token),
      });

      if (response.data.success) {
        localStorage.setItem('patientData', JSON.stringify(response.data.patientData));
        setSavedMessage(t('Patient details saved successfully. Redirecting to doctors page...'));

        const preferredDoctorId = localStorage.getItem('preferredDoctorId');
        window.setTimeout(() => {
          navigate(preferredDoctorId ? `/book-appointment/${preferredDoctorId}` : '/recommend-doctors');
        }, 1400);
      }
    } catch (error) {
      console.error('Error collecting patient details:', error);
      setErrors({ submit: t('Failed to save patient details. Please try again.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <BackButton />

        <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-7">
            <h2 className="text-2xl font-bold text-white">{t('Patient Details')}</h2>
            <p className="mt-2 text-primary-100">
              {t('Enter the patient problem first. After saving, you can proceed to the doctor page.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <AnimatePresence>
              {savedMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
                >
                  {savedMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">{t('Personal Information')}</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="form-label">{t('Full Name')} *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    placeholder={t('Enter patient full name')}
                  />
                  {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="form-label">{t('Age')} *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`form-input ${errors.age ? 'error' : ''}`}
                    placeholder={t('Age')}
                    min="1"
                    max="120"
                  />
                  {errors.age && <p className="form-error">{errors.age}</p>}
                </div>

                <div>
                  <label className="form-label">{t('Gender')} *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`form-input ${errors.gender ? 'error' : ''}`}
                  >
                    <option value="">{t('Select Gender')}</option>
                    <option value="Male">{t('Male')}</option>
                    <option value="Female">{t('Female')}</option>
                    <option value="Other">{t('Other')}</option>
                  </select>
                  {errors.gender && <p className="form-error">{errors.gender}</p>}
                </div>

                <div>
                  <label className="form-label">{t('Mobile Number')} *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
                    placeholder={t('10-digit mobile number')}
                    maxLength="10"
                  />
                  {errors.mobileNumber && <p className="form-error">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="form-label">{t('Email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('patient@example.com')}
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">{t('Problem Details')}</h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label">{t('Problem Description')} *</label>
                  <textarea
                    name="problemDescription"
                    value={formData.problemDescription}
                    onChange={handleInputChange}
                    className={`form-input ${errors.problemDescription ? 'error' : ''}`}
                    rows="3"
                    placeholder={t('Describe the symptoms and health problem')}
                  />
                  {errors.problemDescription && <p className="form-error">{errors.problemDescription}</p>}
                </div>

                <div>
                  <label className="form-label">{t('Symptoms')}</label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {symptomOptions.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={formData.symptoms.includes(symptom)}
                          onChange={() => handleSymptomChange(symptom)}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        {t(symptom)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label">{t('Duration')}</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={t('Example: 3 days')}
                    />
                  </div>

                  <div>
                    <label className="form-label">{t('Severity')} *</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className={`form-input ${errors.severity ? 'error' : ''}`}
                    >
                      <option value="">{t('Select Severity')}</option>
                      {severityOptions.map((level) => (
                        <option key={level} value={level}>
                          {t(level)}
                        </option>
                      ))}
                    </select>
                    {errors.severity && <p className="form-error">{errors.severity}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="hasMedicalHistory"
                      checked={formData.hasMedicalHistory}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    {t('Previous medical history available')}
                  </label>
                </div>

                {formData.hasMedicalHistory && (
                  <div>
                    <label className="form-label">{t('Medical History Details')}</label>
                    <textarea
                      name="medicalHistoryDetails"
                      value={formData.medicalHistoryDetails}
                      onChange={handleInputChange}
                      className="form-input"
                      rows="3"
                      placeholder={t('Enter previous medical history details')}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">{t('Current Medications')}</label>
                  <textarea
                    name="currentMedications"
                    value={formData.currentMedications}
                    onChange={handleInputChange}
                    className="form-input"
                    rows="2"
                    placeholder={t('Enter current medications')}
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? t('Saving patient details...') : t('Save And Continue To Doctors')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
