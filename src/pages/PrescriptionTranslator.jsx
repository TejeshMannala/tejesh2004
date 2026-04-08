import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import '../styles/translator.css';
import { apiUrl, authHeaders } from '../config/api';
import { formatDate } from '../utils/locale';

const PrescriptionTranslator = () => {
  const { t, i18n } = useTranslation();
  const { token } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [showSimpleExplanation, setShowSimpleExplanation] = useState(false);

  // Medical terminology dictionary for simple explanations
  const medicalTermsDictionary = {
    // Common medical terms
    'tab': 'Tablet - A solid medicine you swallow',
    'tablet': 'A solid medicine you swallow with water',
    'cap': 'Capsule - Medicine in a small container you swallow',
    'capsule': 'Medicine in a small container you swallow',
    'syrup': 'Liquid medicine you drink',
    'injection': 'Medicine given through a needle',
    'ointment': 'Medicine you apply on skin',
    'cream': 'Medicine you rub on skin',
    'drops': 'Liquid medicine you put in eyes, ears, or nose',
    'inhaler': 'Medicine you breathe in through your mouth',
    
    // Dosage terms
    '1-0-1': 'Take once in the morning and once at night (twice daily)',
    '1-1-1': 'Take three times a day - morning, afternoon, and night',
    '1-0-0': 'Take once a day in the morning',
    '0-0-1': 'Take once a day at night before sleep',
    'BD': 'Twice a day (morning and night)',
    'TDS': 'Three times a day',
    'OD': 'Once a day',
    'SOS': 'Take only when needed',
    'stat': 'Take immediately',
    
    // Timing instructions
    'after food': 'Take this medicine after eating a meal',
    'before food': 'Take this medicine on an empty stomach, before eating',
    'with food': 'Take this medicine while eating',
    'empty stomach': 'Take this medicine when you haven\'t eaten for at least 2 hours',
    'at bedtime': 'Take this medicine right before you go to sleep',
    
    // Common conditions
    'hypertension': 'High blood pressure - when the force of blood against artery walls is too high',
    'diabetes': 'A condition where your blood sugar level is too high',
    'fever': 'High body temperature - your body is fighting an infection',
    'infection': 'When germs enter your body and make you sick',
    'pain': 'An uncomfortable feeling that tells you something is wrong',
    'inflammation': 'Swelling and redness in a part of your body',
    'allergy': 'When your body reacts badly to something it touches, eats, or breathes',
    'cold': 'A common illness that affects your nose and throat',
    'cough': 'When your body tries to clear your throat or airways',
    'headache': 'Pain in your head',
    'stomach pain': 'Pain in your belly area',
    'vomiting': 'When your body pushes food out of your mouth forcefully',
    'diarrhea': 'When you have loose or watery bowel movements',
    'constipation': 'When it\'s hard to pass stool or you don\'t go often enough',
  };

  // Common medicines and their simple explanations
  const commonMedicines = {
    'paracetamol': 'Pain and fever reducer. Safe for most people when taken as directed.',
    'ibuprofen': 'Reduces pain, fever, and inflammation. Take with food to avoid stomach upset.',
    'amoxicillin': 'An antibiotic that fights bacteria. Take the full course even if you feel better.',
    'omeprazole': 'Reduces stomach acid. Helps with acidity and stomach ulcers.',
    'metformin': 'Helps control blood sugar in diabetes. Take with meals.',
    'amlodipine': 'Helps lower high blood pressure. Take at the same time each day.',
    'atorvastatin': 'Lowers cholesterol in your blood. Take in the evening.',
    'aspirin': 'Pain reliever and blood thinner. Take with food.',
    'cetirizine': 'Antiallergic medicine. May cause drowsiness.',
    'pantoprazole': 'Reduces stomach acid. Take before breakfast.',
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi (हिंदी)' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'ta', name: 'Tamil (தமிழ்)' },
    { code: 'mr', name: 'Marathi (मराठी)' },
    { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
    { code: 'bn', name: 'Bengali (বাংলা)' },
  ];

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(apiUrl('/prescriptions/patient'), {
        headers: authHeaders(token),
      });
      const prescriptionsList = Array.isArray(response.data) 
        ? response.data 
        : (response.data.prescriptions || []);
      setPrescriptions(prescriptionsList);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const translateToSimpleLanguage = (text) => {
    let translated = text.toLowerCase();
    
    // Replace medical terms with simple explanations
    Object.keys(medicalTermsDictionary).forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      translated = translated.replace(regex, medicalTermsDictionary[term]);
    });
    
    // Replace medicine names with explanations
    Object.keys(commonMedicines).forEach(medicine => {
      const regex = new RegExp(`\\b${medicine}\\b`, 'gi');
      if (translated.includes(medicine.toLowerCase())) {
        translated = translated.replace(regex, `${medicine} - ${commonMedicines[medicine]}`);
      }
    });
    
    return translated;
  };

  const translateToLanguage = async (text, targetLang) => {
    // In production, integrate with Google Translate API or similar
    // For demo, we'll show a simulated translation
    setIsTranslating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic translations for demo
      const translations = {
        'hi': {
          'tablet': 'गोली',
          'capsule': 'कैप्सूल',
          'syrup': 'शरबत',
          'twice daily': 'दिन में दो बार',
          'three times a day': 'दिन में तीन बार',
          'once a day': 'दिन में एक बार',
          'after food': 'खाने के बाद',
          'before food': 'खाने से पहले',
          'at bedtime': 'सोते समय',
          'take medicine': 'दवाई लें',
          'pain': 'दर्द',
          'fever': 'बुखार',
          'infection': 'संक्रमण',
          'morning': 'सुबह',
          'night': 'रात',
        },
        'te': {
          'tablet': 'మాత్ర',
          'capsule': 'క్యాప్సూల్',
          'syrup': 'సిరప్',
          'twice daily': 'రోజుకు రెండుసార్లు',
          'three times a day': 'రోజుకు మూడుసార్లు',
          'once a day': 'రోజుకు ఒకసారి',
          'after food': 'భోజనం తర్వాత',
          'before food': 'భోజనానికి ముందు',
          'morning': 'ఉదయం',
          'night': 'రాత్రి',
        },
        'ta': {
          'tablet': 'மாத்திரை',
          'capsule': 'கேப்ஸ்யூல்',
          'syrup': 'சிரப்',
          'twice daily': 'தினமும் இரண்டு முறை',
          'three times a day': 'தினமும் மூன்று முறை',
          'once a day': 'தினமும் ஒரு முறை',
          'after food': 'உணவுக்கு பிறகு',
          'before food': 'உணவுக்கு முன்',
          'morning': 'காலை',
          'night': 'இரவு',
        },
      };
      
      let translatedText = text;
      const dict = translations[targetLang];
      
      if (dict) {
        Object.keys(dict).forEach(englishWord => {
          const regex = new RegExp(`\\b${englishWord}\\b`, 'gi');
          translatedText = translatedText.replace(regex, dict[englishWord]);
        });
      }
      
      setTranslatedContent(translatedText);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslate = (prescription) => {
    setSelectedPrescription(prescription);
    
    // Create a comprehensive text from prescription
    let prescriptionText = '';
    
    if (prescription.medicines) {
      prescription.medicines.forEach((med, index) => {
        prescriptionText += `${index + 1}. ${med.name} - ${med.dosage} (${med.duration})\n`;
        if (med.instructions) {
          prescriptionText += `   Instructions: ${med.instructions}\n`;
        }
      });
    }
    
    if (prescription.notes) {
      prescriptionText += `\nDoctor's Notes: ${prescription.notes}`;
    }
    
    // Translate to simple language
    const simpleText = translateToSimpleLanguage(prescriptionText);
    
    // If target language is not English, translate further
    if (targetLanguage !== 'en') {
      translateToLanguage(simpleText, targetLanguage);
    } else {
      setTranslatedContent(simpleText);
    }
    
    setShowSimpleExplanation(true);
  };

  const getMedicineExplanation = (medicineName) => {
    const lowerName = medicineName.toLowerCase();
    for (const [key, value] of Object.entries(commonMedicines)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }
    return 'Consult your doctor or pharmacist for detailed information about this medicine.';
  };

  return (
    <div className="prescription-translator">
      <BackButton />
      
      <div className="translator-header">
        <h1>📖 {t('Prescription Translator')}</h1>
        <p>{t('Understand your prescription in simple language')}</p>
      </div>

      {/* Language Selector */}
      <div className="language-selector">
        <label>{t('Translate to')}:</label>
        <select 
          value={targetLanguage} 
          onChange={(e) => {
            setTargetLanguage(e.target.value);
            if (selectedPrescription) {
              handleTranslate(selectedPrescription);
            }
          }}
          className="language-select"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prescriptions List */}
      <div className="prescriptions-list-section">
        <h2>📋 {t('Your Prescriptions')}</h2>
        
        {prescriptions.length === 0 ? (
          <div className="no-prescriptions">
            <p>{t('No prescriptions found. Visit a doctor to get a prescription.')}</p>
          </div>
        ) : (
          <div className="prescription-cards">
            {prescriptions.map((prescription) => (
              <div 
                key={prescription._id} 
                className={`prescription-card ${selectedPrescription?._id === prescription._id ? 'selected' : ''}`}
                onClick={() => handleTranslate(prescription)}
              >
                <div className="prescription-header">
                  <span className="doctor-icon">👨‍⚕️</span>
                  <div className="prescription-info">
                    <h4>{prescription.doctorId?.userId?.fullName || 'Doctor'}</h4>
                    <p className="specialization">{prescription.doctorId?.specialization}</p>
                    <p className="date">{formatDate(prescription.issuedAt, i18n.resolvedLanguage)}</p>
                  </div>
                </div>
                <div className="translate-btn-wrapper">
                  <button className="translate-btn">
                    📖 {t('Translate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Translation Results */}
      {showSimpleExplanation && translatedContent && (
        <div className="translation-results">
          <div className="translation-card">
            <div className="translation-header">
              <h3>📖 {t('Simplified Prescription')}</h3>
              <div className="translation-badges">
                <span className="badge badge-simple">✨ Simple Language</span>
                {targetLanguage !== 'en' && (
                  <span className="badge badge-language">
                    🌐 {languages.find(l => l.code === targetLanguage)?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="translation-content">
              <div className="translated-text">
                {isTranslating ? (
                  <div className="translating">
                    <div className="spinner"></div>
                    <p>{t('Translating...')}</p>
                  </div>
                ) : (
                  <pre className="translated-content">{translatedContent}</pre>
                )}
              </div>
            </div>

            {/* Medicine Explanations */}
            {selectedPrescription?.medicines && (
              <div className="medicine-explanations">
                <h4>💊 {t('Medicine Information')}</h4>
                <div className="explanations-list">
                  {selectedPrescription.medicines.map((medicine, index) => (
                    <div key={index} className="medicine-explanation-card">
                      <div className="medicine-header">
                        <span className="medicine-name">{medicine.name}</span>
                        <span className="medicine-dosage">{medicine.dosage}</span>
                      </div>
                      <p className="medicine-info">
                        <strong>{t('Duration')}:</strong> {medicine.duration}
                      </p>
                      {medicine.instructions && (
                        <p className="medicine-info">
                          <strong>{t('Instructions')}:</strong> {medicine.instructions}
                        </p>
                      )}
                      <div className="medicine-explanation">
                        <strong>📝 {t('What is it?')}:</strong>
                        <p>{getMedicineExplanation(medicine.name)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor's Notes Explanation */}
            {selectedPrescription?.notes && (
              <div className="notes-explanation">
                <h4>📝 {t('Doctor\'s Notes Explained')}</h4>
                <div className="explained-notes">
                  <p>{translateToSimpleLanguage(selectedPrescription.notes)}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="translation-actions">
              <button 
                className="btn-primary"
                onClick={() => window.open('/pharmacy-locator', '_self')}
              >
                🏥 {t('Find Medicines at Pharmacies')}
              </button>
              <button className="btn-secondary">
                📥 {t('Download Translation')}
              </button>
              <button className="btn-outline">
                🔊 {t('Read Aloud')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference Guide */}
      <div className="quick-reference">
        <h3>📚 {t('Quick Medical Terms Reference')}</h3>
        <div className="reference-grid">
          <div className="reference-card">
            <h4>💊 Medicine Forms</h4>
            <ul>
              <li><strong>Tablet:</strong> Solid medicine you swallow</li>
              <li><strong>Capsule:</strong> Medicine in a small container</li>
              <li><strong>Syrup:</strong> Liquid medicine you drink</li>
              <li><strong>Ointment:</strong> Medicine for skin</li>
            </ul>
          </div>
          <div className="reference-card">
            <h4>⏰ Timing Terms</h4>
            <ul>
              <li><strong>BD:</strong> Twice daily</li>
              <li><strong>TDS:</strong> Three times daily</li>
              <li><strong>OD:</strong> Once daily</li>
              <li><strong>SOS:</strong> Only when needed</li>
            </ul>
          </div>
          <div className="reference-card">
            <h4>🍽️ Food Instructions</h4>
            <ul>
              <li><strong>After food:</strong> Take after eating</li>
              <li><strong>Before food:</strong> Take on empty stomach</li>
              <li><strong>With food:</strong> Take while eating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTranslator;
