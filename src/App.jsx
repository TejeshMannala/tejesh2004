import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LanguageSync from './components/LanguageSync';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExploreDoctors from './pages/ExploreDoctors';
import PatientDetails from './pages/PatientDetails';
import DoctorRecommendation from './pages/DoctorRecommendation';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import MyAppointments from './pages/MyAppointments';
import Prescription from './pages/Prescription';
import PrescriptionTranslator from './pages/PrescriptionTranslator';
import PharmacyLocator from './pages/PharmacyLocator';
import DoctorDashboard from './pages/DoctorDashboard';
import Help from './pages/Help';
import About from './pages/About';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <LanguageSync />
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore-doctors"
            element={
              <ProtectedRoute roles={['patient']}>
                <ExploreDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-details"
            element={
              <ProtectedRoute roles={['patient']}>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommend-doctors"
            element={
              <ProtectedRoute roles={['patient']}>
                <DoctorRecommendation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment/:doctorId"
            element={
              <ProtectedRoute roles={['patient']}>
                <AppointmentConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute roles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription"
            element={
              <ProtectedRoute roles={['doctor', 'patient']}>
                <Prescription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescription-translator"
            element={
              <ProtectedRoute roles={['patient']}>
                <PrescriptionTranslator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy-locator"
            element={
              <ProtectedRoute roles={['patient']}>
                <PharmacyLocator />
              </ProtectedRoute>
            }
          />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

