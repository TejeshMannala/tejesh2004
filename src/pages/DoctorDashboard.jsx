import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/appointments/doctor'), {
        headers: authHeaders(token),
      });
      const appointmentsList = Array.isArray(response.data)
        ? response.data
        : response.data.appointments || [];
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      setError(t('Failed to load appointments.'));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptReject = async (appointmentId, status) => {
    try {
      await axios.put(
        apiUrl(`/appointments/${appointmentId}/status`),
        { status },
        { headers: authHeaders(token) }
      );
      fetchDoctorAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleStartConsultation = (appointmentId) => {
    // Implement video consultation
    alert('Starting video consultation...');
  };

  const handleGivePrescription = (appointmentId) => {
    navigate('/prescription', {
      state: { appointmentId },
    });
  };

  const uniquePatients = appointments.reduce((acc, appointment) => {
    const patient = appointment.patientId;
    if (patient && !acc.some((item) => item._id === patient._id)) {
      acc.push(patient);
    }
    return acc;
  }, []);

  return (
    <div className="doctor-dashboard page-container">
      <BackButton />
      <div className="dashboard-header">
        <h1>{t('Doctor Dashboard')}</h1>
        <p>{t('Welcome back')}, {user?.fullName || t('Doctor')}</p>
      </div>

      {loading ? (
        <div className="loading-container">{t('Loading appointments...')}</div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}

          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>{t('Upcoming Appointments')}</h3>
              <p>{appointments.length}</p>
            </div>
            <div className="summary-card">
              <h3>{t('Patients')}</h3>
              <p>{uniquePatients.length}</p>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>{t('Today\'s appointments')}</h2>
            <div className="appointments-list">
              {appointments.length === 0 ? (
                <div className="no-results">
                  <p>{t('No appointments found.')}</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment._id} className="appointment-card">
                    <div className="appointment-card-header">
                      <h3>{appointment.patientId?.fullName || t('Unknown')}</h3>
                      <span className={`status-badge status-${appointment.status}`}>
                        {t(appointment.status)}
                      </span>
                    </div>
                    <p><strong>{t('Time')}:</strong> {appointment.timeSlot}</p>
                    <p><strong>{t('Date')}:</strong> {formatDate(appointment.date, i18n.resolvedLanguage)}</p>
                    <p><strong>{t('Symptoms')}:</strong> {appointment.symptoms || t('Not provided')}</p>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button onClick={() => handleAcceptReject(appointment._id, 'confirmed')}>{t('Accept')}</button>
                          <button onClick={() => handleAcceptReject(appointment._id, 'cancelled')}>{t('Reject')}</button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button onClick={() => handleStartConsultation(appointment._id)}>{t('Start video consultation')}</button>
                          <button onClick={() => handleGivePrescription(appointment._id)}>{t('Give Prescription')}</button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <button onClick={() => handleGivePrescription(appointment._id)}>{t('Give Prescription')}</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h2>{t('Patient list')}</h2>
            <div className="patients-list">
              {uniquePatients.length === 0 ? (
                <div className="no-results">
                  <p>{t('No patients found.')}</p>
                </div>
              ) : (
                uniquePatients.map((patient) => (
                  <div key={patient._id} className="patient-card">
                    <p><strong>{patient.fullName}</strong></p>
                    <p>{patient.email}</p>
                    <button onClick={() => alert('View patient details')}>{t('View details')}</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
