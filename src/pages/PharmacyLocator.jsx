 import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import '../styles/pharmacy.css';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const PharmacyLocator = () => {
  const { t, i18n } = useTranslation();
  const { token } = useContext(AuthContext);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [availabilityResults, setAvailabilityResults] = useState({});

  // Popular pharmacy chains in India
  const pharmacyChains = [
    { name: 'MedPlus', color: '#00A651', icon: '💊' },
    { name: 'Apollo Pharmacy', color: '#0033A0', icon: '🏥' },
    { name: 'Wellness Forever', color: '#FF6B35', icon: '🌿' },
    { name: 'NetMeds', color: '#00BCD4', icon: '💉' },
    { name: 'PharmEasy', color: '#E91E63', icon: '📦' },
    { name: '1mg', color: '#4CAF50', icon: '🔬' },
    { name: 'Local Medical Store', color: '#795548', icon: '🏪' },
  ];

  useEffect(() => {
    fetchUserPrescriptions();
    getCurrentLocation();
  }, []);

  const fetchUserPrescriptions = async () => {
    try {
      const response = await axios.get(apiUrl('/prescriptions/patient'), {
        headers: authHeaders(token),
      });
      const prescriptionsList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.prescriptions || []);
      setMedicines(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          findNearbyPharmacies(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Hyderabad coordinates for demo
          const defaultLocation = { latitude: 17.3850, longitude: 78.4867 };
          setUserLocation(defaultLocation);
          findNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
        }
      );
    } else {
      // Default to Hyderabad coordinates for demo
      const defaultLocation = { latitude: 17.3850, longitude: 78.4867 };
      setUserLocation(defaultLocation);
      findNearbyPharmacies(defaultLocation.latitude, defaultLocation.longitude);
    }
  };

  const findNearbyPharmacies = (lat, lng) => {
    // Simulated pharmacy data based on location
    // In production, this would call a real API like Google Places
    const mockPharmacies = generateMockPharmacies(lat, lng);
    setPharmacies(mockPharmacies);
  };

  const generateMockPharmacies = (lat, lng) => {
    // Generate mock pharmacies around the user location
    return pharmacyChains.map((chain, index) => {
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;
      const distance = (Math.random() * searchRadius).toFixed(1);
      
      return {
        id: index + 1,
        name: chain.name,
        icon: chain.icon,
        color: chain.color,
        address: `${Math.floor(Math.random() * 200) + 1}, Main Road, City Center`,
        distance: distance,
        distanceUnit: 'km',
        phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        openingHours: index < 3 ? '24/7' : '8:00 AM - 10:00 PM',
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        latitude: lat + offsetLat,
        longitude: lng + offsetLng,
        services: ['Home Delivery', 'Online Orders', 'Prescription Upload']
      };
    }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  const checkMedicineAvailability = async (prescription) => {
    setLoading(true);
    setSelectedPrescription(prescription);
    
    // Simulate checking medicine availability at each pharmacy
    const results = {};
    
    for (const pharmacy of pharmacies) {
      const medicineAvailability = prescription.medicines?.map(medicine => ({
        name: medicine.name,
        available: Math.random() > 0.3, // 70% chance of availability
        quantity: Math.floor(Math.random() * 50) + 1,
        price: Math.floor(Math.random() * 500) + 50,
        genericAvailable: Math.random() > 0.5
      })) || [];
      
      const allAvailable = medicineAvailability.every(m => m.available);
      const someAvailable = medicineAvailability.some(m => m.available);
      
      results[pharmacy.id] = {
        pharmacy,
        medicines: medicineAvailability,
        allAvailable,
        someAvailable,
        noneAvailable: !someAvailable,
        estimatedTotal: medicineAvailability
          .filter(m => m.available)
          .reduce((sum, m) => sum + m.price, 0)
      };
    }
    
    setAvailabilityResults(results);
    setLoading(false);
  };

  const handleOrderMedicines = (pharmacyId) => {
    const result = availabilityResults[pharmacyId];
    if (result) {
      alert(`Ordering medicines from ${result.pharmacy.name}.\nTotal: ₹${result.estimatedTotal}\n\nIn a real app, this would redirect to the pharmacy's website or app.`);
    }
  };

  const getDirections = (pharmacy) => {
    if (userLocation.latitude && pharmacy.latitude) {
      const googleMapsUrl = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${pharmacy.latitude},${pharmacy.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="pharmacy-locator">
      <BackButton />
      
      <div className="pharmacy-header">
        <h1>🏥 {t('Find Medicines Near You')}</h1>
        <p>{t('Check medicine availability at nearby pharmacies')}</p>
      </div>

      {/* Location Info */}
      {userLocation.latitude && (
        <div className="location-info">
          <span className="location-icon">📍</span>
          <span className="location-text">
            {t('Your location detected')} • {t('Searching within')} {searchRadius} km
          </span>
          <select 
            value={searchRadius} 
            onChange={(e) => {
              setSearchRadius(e.target.value);
              findNearbyPharmacies(userLocation.latitude, userLocation.longitude);
            }}
            className="radius-select"
          >
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="15">15 km</option>
          </select>
        </div>
      )}

      {/* Select Prescription */}
      <div className="prescription-selection">
        <h2>📋 {t('Select Your Prescription')}</h2>
        {medicines.length === 0 ? (
          <div className="no-prescriptions">
            <p>{t('No prescriptions found. Visit a doctor to get a prescription.')}</p>
          </div>
        ) : (
          <div className="prescription-cards">
            {medicines.map((prescription) => (
              <div 
                key={prescription._id} 
                className={`prescription-card ${selectedPrescription?._id === prescription._id ? 'selected' : ''}`}
                onClick={() => checkMedicineAvailability(prescription)}
              >
                <div className="prescription-header">
                  <span className="doctor-icon">👨‍⚕️</span>
                  <div className="prescription-info">
                    <h4>{prescription.doctorId?.userId?.fullName || 'Doctor'}</h4>
                    <p className="date">{formatDate(prescription.issuedAt, i18n.resolvedLanguage)}</p>
                  </div>
                </div>
                <div className="medicine-count">
                  {prescription.medicines?.length || 0} {t('medicines')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-availability">
          <div className="spinner"></div>
          <p>{t('Checking medicine availability at nearby pharmacies...')}</p>
        </div>
      )}

      {/* Pharmacy Results */}
      {!loading && Object.keys(availabilityResults).length > 0 && (
        <div className="pharmacy-results">
          <h2>🏪 {t('Nearby Pharmacies')}</h2>
          
          <div className="pharmacies-list">
            {Object.values(availabilityResults).map((result) => (
              <div key={result.pharmacy.id} className="pharmacy-card">
                <div className="pharmacy-main">
                  <div className="pharmacy-info">
                    <span className="pharmacy-icon" style={{ color: result.pharmacy.color }}>
                      {result.pharmacy.icon}
                    </span>
                    <div className="pharmacy-details">
                      <h3>{result.pharmacy.name}</h3>
                      <p className="pharmacy-address">{result.pharmacy.address}</p>
                      <div className="pharmacy-meta">
                        <span className="distance">📏 {result.pharmacy.distance} km</span>
                        <span className="rating">⭐ {result.pharmacy.rating}</span>
                        <span className="hours">🕐 {result.pharmacy.openingHours}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`availability-badge ${result.allAvailable ? 'all-available' : result.someAvailable ? 'some-available' : 'none-available'}`}>
                    {result.allAvailable ? '✅ All Available' : 
                     result.someAvailable ? '⚠️ Partially Available' : 
                     '❌ Not Available'}
                  </div>
                </div>

                {/* Medicine Availability Details */}
                {selectedPrescription && (
                  <div className="medicine-availability-details">
                    <h4>{t('Medicine Availability')}:</h4>
                    <div className="medicine-list">
                      {result.medicines.map((medicine, idx) => (
                        <div key={idx} className={`medicine-item ${medicine.available ? 'available' : 'unavailable'}`}>
                          <span className="medicine-status">
                            {medicine.available ? '✅' : '❌'}
                          </span>
                          <span className="medicine-name">{medicine.name}</span>
                          {medicine.available && (
                            <span className="medicine-price">₹{medicine.price}</span>
                          )}
                          {medicine.genericAvailable && (
                            <span className="generic-badge">🔄 Generic Available</span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="pharmacy-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleOrderMedicines(result.pharmacy.id)}
                        disabled={result.noneAvailable}
                      >
                        🛒 {t('Order Medicines')} - ₹{result.estimatedTotal}
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => getDirections(result.pharmacy)}
                      >
                        🗺️ {t('Get Directions')}
                      </button>
                      <button className="btn-outline">
                        📞 {t('Call Pharmacy')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map View (Simplified) */}
      <div className="map-section">
        <h2>🗺️ {t('Pharmacy Locations on Map')}</h2>
        <div className="map-placeholder">
          <p>📍 Interactive map would be displayed here</p>
          <p className="map-note">In production, integrate with Google Maps API</p>
          {pharmacies.length > 0 && (
            <div className="pharmacy-markers">
              {pharmacies.map(pharmacy => (
                <div key={pharmacy.id} className="marker-info">
                  <span>{pharmacy.icon}</span>
                  <span>{pharmacy.name} - {pharmacy.distance} km</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyLocator;
