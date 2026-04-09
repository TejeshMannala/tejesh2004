import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { apiUrl, authHeaders } from '../config/api';

const Prescription = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instruction: '' }]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user, token } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDoctorAppointments();
    } else {
      fetchPatientPrescriptions();
    }
  }, [user?.role, token]);

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
      const preselectedAppointmentId = location.state?.appointmentId;
      if (preselectedAppointmentId) {
        const matchedAppointment = appointmentsList.find(
          (appointment) => appointment._id === preselectedAppointmentId
        );
        if (matchedAppointment) {
          setSelectedAppointment(matchedAppointment);
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl('/prescriptions/patient'), {
        headers: authHeaders(token),
      });
      const prescriptionsList = Array.isArray(response.data)
        ? response.data
        : response.data.prescriptions || [];
      setAppointments(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instruction: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  const handleFileChange = (e) => {
    setReports(e.target.files[0]);
  };

  const handleSubmitPrescription = async () => {
    if (!selectedAppointment) return;

    if (medicines.some((m) => !m.name || !m.dosage)) {
      alert(t('Please fill in medicine name and dosage'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('appointmentId', selectedAppointment._id);
      formData.append('medicines', JSON.stringify(medicines));
      formData.append('notes', prescriptionNotes);
      if (reports) {
        formData.append('reports', reports);
      }

      await axios.post(apiUrl('/prescriptions'), formData, {
        headers: {
          ...authHeaders(token),
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        resetForm();
        fetchDoctorAppointments();
        navigate('/doctor-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting prescription:', error);
      alert(error.response?.data?.message || t('Error submitting prescription'));
    }
  };

  const resetForm = () => {
    setSelectedAppointment(null);
    setMedicines([{ name: '', dosage: '', duration: '', instruction: '' }]);
    setPrescriptionNotes('');
    setReports(null);
    setShowSuccessModal(false);
  };

  const downloadPDF = (appointment) => {
    const doc = `
PRESCRIPTION
============================
Date: ${new Date().toLocaleDateString()}

DOCTOR INFORMATION
Doctor: ${user?.fullName}
Specialization: ${appointment.doctorId?.specialization || 'General'}

PATIENT INFORMATION
Patient: ${appointment.patientId?.fullName}
Age: ${appointment.appointmentId?.patientDetails?.age || 'N/A'}
Gender: ${appointment.appointmentId?.patientDetails?.gender || 'N/A'}

APPOINTMENT
Date: ${new Date(appointment.appointmentId?.date).toLocaleDateString()}
Time: ${appointment.appointmentId?.timeSlot}
Problem: ${appointment.appointmentId?.symptoms?.description || 'General Checkup'}

MEDICINES
${appointment.medicines
  ?.map(
    (m, i) => `${i + 1}. ${m.name}
   Dosage: ${m.dosage}
   Duration: ${m.duration}
   Instructions: ${m.instructions || m.instruction}`
  )
  .join('\n\n')}

DOCTOR'S NOTES
${appointment.notes || 'No additional notes'}
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc));
    element.setAttribute('download', `prescription_${appointment._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = (appointment) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Prescription</title></head>
        <body>
          <h1>Medical Prescription</h1>
          <p>Doctor: ${appointment.doctorId?.userId?.fullName || ''}</p>
          <p>Patient: ${appointment.patientId?.fullName || ''}</p>
          <p>Date: ${new Date(appointment.appointmentId?.date).toLocaleDateString()}</p>
          <p>Time: ${appointment.appointmentId?.timeSlot || ''}</p>
          <hr />
          ${appointment.medicines
            ?.map(
              (m) => `<p><strong>${m.name}</strong> - ${m.dosage} - ${m.duration} - ${m.instructions || m.instruction}</p>`
            )
            .join('')}
          <p>${appointment.notes || ''}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-slate-600">{t('Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'doctor') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,212,255,0.45),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_50%,#eef2ff_100%)] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <BackButton />

          <div className="mt-6 rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">{t('Create Prescription')}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">{t('Create Prescription')}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t('Write prescriptions for your patients')}</p>
          </div>

          {showSuccessModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
              <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  OK
                </div>
                <h2 className="mt-5 text-2xl font-black text-slate-900">{t('Prescription Submitted!')}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t('Your prescription has been saved successfully.')}</p>
              </div>
            </div>
          )}

          {!selectedAppointment ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {appointments.length === 0 ? (
                <div className="rounded-[28px] bg-white p-12 text-center shadow-sm md:col-span-2">{t('No appointments found')}</div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment._id} className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">{appointment.patientId?.fullName}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                        {t('Appointment')}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-slate-700">
                      <p><strong>{t('Problem')}:</strong> {appointment.healthInfo?.problemDescription || appointment.symptoms || t('Not provided')}</p>
                      <p><strong>{t('Severity')}:</strong> {appointment.healthInfo?.severity || t('Not provided')}</p>
                    </div>

                    <button className="btn-primary mt-6" onClick={() => setSelectedAppointment(appointment)}>
                      {t('Add Prescription')}
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button className="btn-secondary" onClick={() => setSelectedAppointment(null)}>{t('Back')}</button>
                <h2 className="text-2xl font-black text-slate-900">{t('Prescription for')} {selectedAppointment.patientId?.fullName}</h2>
              </div>

              <div className="mt-8 space-y-8">
                <section className="rounded-[28px] bg-slate-50 p-6">
                  <h3 className="text-xl font-bold text-slate-900">{t('Patient Information')}</h3>
                  <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                    <p><strong>{t('Name')}:</strong> {selectedAppointment.patientId?.fullName}</p>
                    <p><strong>{t('Age')}:</strong> {selectedAppointment.patientDetails?.age}</p>
                    <p><strong>{t('Gender')}:</strong> {selectedAppointment.patientDetails?.gender}</p>
                    <p><strong>{t('Date of Appointment')}:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                    <p className="md:col-span-2"><strong>{t('Problem')}:</strong> {selectedAppointment.healthInfo?.problemDescription || selectedAppointment.symptoms || t('Not provided')}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900">{t('Medicines')}</h3>
                  <div className="mt-4 space-y-4">
                    {medicines.map((medicine, index) => (
                      <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input type="text" placeholder={t('Medicine Name')} value={medicine.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} className="form-input" />
                          <input type="text" placeholder={t('Dosage (e.g., 1-0-1)')} value={medicine.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} className="form-input" />
                          <input type="text" placeholder={t('Duration (e.g., 5 days)')} value={medicine.duration} onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} className="form-input" />
                          <input type="text" placeholder={t('Instructions (Before/After food)')} value={medicine.instruction} onChange={(e) => handleMedicineChange(index, 'instruction', e.target.value)} className="form-input" />
                        </div>
                        {medicines.length > 1 && (
                          <button type="button" className="btn-outline mt-4" onClick={() => handleRemoveMedicine(index)}>
                            {t('Remove')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn-secondary mt-5" onClick={handleAddMedicine}>
                    {t('Add Medicine')}
                  </button>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900">{t('Doctor Notes & Advice')}</h3>
                  <textarea
                    placeholder={t('e.g., Take rest, drink water, avoid spicy food...')}
                    value={prescriptionNotes}
                    onChange={(e) => setPrescriptionNotes(e.target.value)}
                    className="form-input mt-4 min-h-[160px] resize-y"
                    rows="6"
                  />
                </section>

                <section>
                  <h3 className="text-xl font-bold text-slate-900">{t('Upload Reports')} ({t('Optional')})</h3>
                  <input type="file" onChange={handleFileChange} accept="application/pdf,image/*" className="form-input mt-4" />
                  {reports && <p className="mt-3 text-sm text-emerald-700">{t('Selected file')}: {reports.name}</p>}
                </section>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button className="btn-secondary" onClick={() => setSelectedAppointment(null)}>
                  {t('Cancel')}
                </button>
                <button className="btn-primary" onClick={handleSubmitPrescription}>
                  {t('Submit Prescription')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(191,212,255,0.45),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_50%,#eef2ff_100%)] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <BackButton />

        <div className="mt-6 rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h1 className="text-4xl font-black tracking-tight text-slate-950">{t('My Prescriptions')}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{t('View prescriptions from your doctors')}</p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-700">{t('Nearby Care')}</p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{t('Find medical stores and pharmacies nearby')}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {t('Use the pharmacy locator to check medicine availability, directions, and nearby medical support.')}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => navigate('/pharmacy-locator')}>
                {t('Open Pharmacy Locator')}
              </button>
              <button className="btn-outline" onClick={() => navigate('/explore-doctors')}>
                {t('Explore Doctors')}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{t('Quick View')}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t('Prescription Count')}</p>
                <p className="mt-2 text-3xl font-black">{appointments.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{t('Medication Items')}</p>
                <p className="mt-2 text-3xl font-black">
                  {appointments.reduce((total, appointment) => total + (appointment.medicines?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="mt-8 rounded-[28px] bg-white p-12 text-center shadow-sm">
            <p className="text-slate-600">{t('No prescriptions yet')}</p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm backdrop-blur">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">{t('Doctor')}</th>
                    <th className="px-6 py-4">{t('Date')}</th>
                    <th className="px-6 py-4">{t('Time')}</th>
                    <th className="px-6 py-4">{t('Medicines')}</th>
                    <th className="px-6 py-4">{t('Notes')}</th>
                    <th className="px-6 py-4">{t('Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{appointment.doctorId?.userId?.fullName}</p>
                        <p className="text-sm text-slate-500">{appointment.doctorId?.specialization}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {new Date(appointment.appointmentId?.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{appointment.appointmentId?.timeSlot}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {appointment.medicines?.length || 0} {t('items')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <p className="max-w-[320px] truncate">
                          {appointment.notes || t('No additional notes')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button className="btn-secondary" onClick={() => downloadPDF(appointment)}>
                            {t('Download')}
                          </button>
                          <button className="btn-primary" onClick={() => handlePrint(appointment)}>
                            {t('Print')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescription;
