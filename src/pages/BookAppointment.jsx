import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalReports, setMedicalReports] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const symptomOptions = [
    'Fever',
    'Cold',
    'Headache',
    'Stomach pain',
    'Skin issues',
    'Cough',
    'Body pain',
    'Others'
  ];

  const genderOptions = ['Male', 'Female', 'Other'];

  const validateForm = () => {
    const newErrors = {};

    if (!date) newErrors.date = t('Date is required');
    if (!timeSlot) newErrors.timeSlot = t('Time slot is required');
    if (!problemDescription.trim()) newErrors.problemDescription = t('Problem description is mandatory');
    if (!severity) newErrors.severity = t('Severity level is required');
    if (!age) newErrors.age = t('Age is required');
    if (!gender) newErrors.gender = t('Gender is required');
    if (!mobileNumber) newErrors.mobileNumber = t('Mobile number is required');

    // Validate past date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.date = t('Cannot book appointment for past date');
    }

    // Validate mobile number
    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = t('Mobile number must be 10 digits');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadReceipt = () => {
    if (!appointmentData) return;

    const receiptContent = `
APPOINTMENT BOOKING RECEIPT
============================

Appointment ID: ${appointmentData._id}
Date: ${new Date(appointmentData.date).toLocaleDateString()}
Time: ${appointmentData.timeSlot}

DOCTOR INFORMATION
Doctor Name: ${doctor?.userId?.fullName}
Specialization: ${doctor?.specialization}
Rating: ${doctor?.rating || 4.5}⭐
Consultation Fee: ₹${doctor?.consultationFee}

PATIENT INFORMATION
Patient Name: ${user?.fullName}
Age: ${age}
Gender: ${gender}
Mobile: ${mobileNumber}

HEALTH INFORMATION
Problem: ${problemDescription}
Symptoms: ${selectedSymptoms.join(', ') || 'None'}
Duration: ${duration || 'Not specified'}
Severity: ${severity}
Medications: ${medications || 'None'}
Allergies: ${allergies || 'None'}

Status: Booking Confirmed
Booking Date: ${new Date().toLocaleDateString()}

Thank you for booking with us!
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `appointment_receipt_${appointmentData._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (date) {
      fetchAvailableSlots();
    }
  }, [date]);

  const fetchDoctor = async () => {
    try {
      const response = await axios.get(apiUrl(`/doctors/${doctorId}`), {
        headers: authHeaders(token),
      });
      setDoctor(response.data.doctor || response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(apiUrl(`/doctors/${doctorId}/slots?date=${date}`), {
        headers: authHeaders(token),
      });
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleFileChange = (e) => {
    setMedicalReports(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentPayload = {
        doctorId,
        date,
        timeSlot,
        symptoms: {
          description: problemDescription,
          selectedSymptoms,
          duration,
          severity,
          medications,
          allergies
        },
        patientId: user._id,
        patientDetails: {
          age: parseInt(age),
          gender,
          mobileNumber
        }
      };

      const response = await axios.post(apiUrl('/appointments'), appointmentPayload, {
        headers: authHeaders(token),
      });
      setAppointmentData({
        ...response.data,
        date: date
      });
      setBookingSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ submit: error.response?.data?.message || t('Error booking appointment') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!doctor) return <div className="loading">{t('Loading...')}</div>;

  // Success Modal Component
  if (bookingSuccess && appointmentData) {
    return (
      <div className="book-appointment">
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h2>{t('Booking Successful!')}</h2>
            <p className="success-message">{t('Your appointment has been confirmed.')}</p>

            <div className="appointment-summary">
              <div className="summary-item">
                <span className="label">{t('Appointment ID')}:</span>
                <span className="value">{appointmentData._id}</span>
              </div>
              <div className="summary-item">
                <span className="label">{t('Doctor Name')}:</span>
                <span className="value">{doctor.userId?.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="label">{t('Specialization')}:</span>
                <span className="value">{doctor.specialization}</span>
              </div>
              <div className="summary-item">
                <span className="label">{t('Date & Time')}:</span>
                <span className="value">{new Date(appointmentData.date).toLocaleDateString()} at {appointmentData.timeSlot}</span>
              </div>
              <div className="summary-item">
                <span className="label">{t('Consultation Fee')}:</span>
                <span className="value">₹{doctor.consultationFee}</span>
              </div>
              <div className="summary-item">
                <span className="label">{t('Status')}:</span>
                <span className="value status-badge">Confirmed ✅</span>
              </div>
            </div>

            <div className="success-actions">
              <button 
                className="btn-primary" 
                onClick={() => navigate('/my-appointments')}
              >
                {t('Go to My Appointments')}
              </button>
              <button 
                className="btn-secondary" 
                onClick={downloadReceipt}
              >
                {t('Download Receipt')} 📥
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-appointment">
      <BackButton />
      <h1>{t('Book Appointment')}</h1>

      {errors.submit && <div className="error-banner">{errors.submit}</div>}

      {/* Doctor Information Card */}
      <div className="doctor-card">
        <div className="doctor-image-container">
          <img 
            src={doctor.photo || '/default-doctor.png'} 
            alt={doctor.userId?.fullName}
            className="doctor-image"
            onError={(e) => {e.target.src = '/default-doctor.png'}}
          />
        </div>
        <div className="doctor-info-content">
          <h2>{doctor.userId?.fullName}</h2>
          <p className="specialization">🩺 {doctor.specialization}</p>
          <div className="info-row">
            <span>⭐ {doctor.rating || 4.5}</span>
            <span>💼 {doctor.experience} {t('years')}</span>
            <span>💰 ₹{doctor.consultationFee}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="appointment-form">
        {/* Schedule Section */}
        <fieldset className="form-section">
          <legend>📅 {t('Schedule')}</legend>

          <div className="form-group">
            <label htmlFor="date">{t('Select Date')} *</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.date ? 'input-error' : ''}
              required
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label>{t('Select Time Slot')} *</label>
            {!date ? (
              <p className="info-text">{t('Please select a date first')}</p>
            ) : availableSlots.length === 0 ? (
              <p className="info-text">{t('No slots available for selected date')}</p>
            ) : (
              <div className="time-slots-grid">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot-btn ${timeSlot === slot ? 'active' : ''}`}
                    onClick={() => setTimeSlot(slot)}
                  >
                    🕐 {slot}
                  </button>
                ))}
              </div>
            )}
            {errors.timeSlot && <span className="error-text">{errors.timeSlot}</span>}
          </div>
        </fieldset>

        {/* Patient Details Section */}
        <fieldset className="form-section">
          <legend>👤 {t('Your Details')}</legend>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="patientName">{t('Patient Name')}</label>
              <input 
                id="patientName"
                type="text" 
                value={user?.fullName || ''} 
                readOnly 
              />
            </div>

            <div className="form-group form-group-half">
              <label htmlFor="age">{t('Age')} *</label>
              <input 
                id="age"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t('Enter your age')}
                className={errors.age ? 'input-error' : ''}
              />
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="gender">{t('Gender')} *</label>
              <select 
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={errors.gender ? 'input-error' : ''}
              >
                <option value="">{t('Select Gender')}</option>
                {genderOptions.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div className="form-group form-group-half">
              <label htmlFor="mobile">{t('Mobile Number')} *</label>
              <input 
                id="mobile"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder={t('10-digit mobile number')}
                className={errors.mobileNumber ? 'input-error' : ''}
              />
              {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
            </div>
          </div>
        </fieldset>

        {/* Problem / Symptoms Section */}
        <fieldset className="form-section">
          <legend>⭐ {t('Problem & Symptoms')} ({t('IMPORTANT')})</legend>

          <div className="form-group">
            <label htmlFor="problem">{t('Describe Your Problem')} * ({t('Mandatory')})</label>
            <textarea
              id="problem"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder={t('Example: I have fever and headache for 2 days')}
              required
              rows="4"
              className={errors.problemDescription ? 'input-error' : ''}
            />
            {errors.problemDescription && <span className="error-text">{errors.problemDescription}</span>}
          </div>

          {/* Symptoms Selection */}
          <div className="form-group">
            <label>{t('Symptoms Selection')} ({t('Optional')})</label>
            <div className="checkbox-group">
              {symptomOptions.map(symptom => (
                <label key={symptom} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom)}
                    onChange={() => handleSymptomChange(symptom)}
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="form-group">
            <label htmlFor="duration">{t('Duration of Problem')} ({t('Optional')})</label>
            <select 
              id="duration"
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="">{t('Select Duration')}</option>
              <option value="1-day">{t('1 day')}</option>
              <option value="2-3-days">{t('2-3 days')}</option>
              <option value="1-week">{t('1 week')}</option>
              <option value="more-than-1-week">{t('More than 1 week')}</option>
            </select>
          </div>

          {/* Severity Level */}
          <div className="form-group">
            <label>{t('Severity Level')} *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="severity"
                  value="mild"
                  checked={severity === 'mild'}
                  onChange={(e) => setSeverity(e.target.value)}
                  required
                />
                <span>🟢 {t('Mild')}</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="severity"
                  value="moderate"
                  checked={severity === 'moderate'}
                  onChange={(e) => setSeverity(e.target.value)}
                />
                <span>🟡 {t('Moderate')}</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="severity"
                  value="severe"
                  checked={severity === 'severe'}
                  onChange={(e) => setSeverity(e.target.value)}
                />
                <span>🔴 {t('Severe')}</span>
              </label>
            </div>
            {errors.severity && <span className="error-text">{errors.severity}</span>}
          </div>
        </fieldset>

        {/* Optional Medical Info */}
        <fieldset className="form-section">
          <legend>📎 {t('Optional Medical Information')}</legend>

          {/* Current Medications */}
          <div className="form-group">
            <label htmlFor="medications">{t('Current Medications')} ({t('Optional')})</label>
            <input
              id="medications"
              type="text"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder={t('Example: Paracetamol, Antibiotics')}
            />
          </div>

          {/* Allergies */}
          <div className="form-group">
            <label htmlFor="allergies">{t('Allergies')} ({t('Optional')})</label>
            <input
              id="allergies"
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder={t('Example: No penicillin')}
            />
          </div>

          {/* Medical Reports Upload */}
          <div className="form-group">
            <label htmlFor="reports">{t('Upload Medical Reports')} ({t('Optional')})</label>
            <input
              id="reports"
              type="file"
              onChange={handleFileChange}
              accept="application/pdf,image/*"
            />
            {medicalReports && (
              <p className="file-info">✅ {t('Selected file')}: {medicalReports.name}</p>
            )}
          </div>
        </fieldset>

        {/* Payment Section */}
        <fieldset className="form-section payment-section">
          <legend>💳 {t('Payment')}</legend>
          <p className="fee-info">
            <strong>{t('Consultation Fee')}:</strong> <span className="fee-amount">₹{doctor.consultationFee}</span>
          </p>
          <p className="payment-method">
            <strong>{t('Payment Methods')}:</strong> UPI • Cards • Net Banking
          </p>
          <p className="payment-info">{t('Payment will be processed after confirmation')}</p>
        </fieldset>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary btn-large"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('Processing...') : '💳 ' + t('Pay & Book Appointment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
