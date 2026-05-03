import React, { useState } from 'react';
import './HealthForm.css';
import Loader from './Loader';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import getApiBaseUrl from '../apiConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

const HealthForm = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    symptoms: [],
    skinImage: null,
    xrayImage: null
  });

  const [predictions, setPredictions] = useState({
    skin: null,
    xray: null,
    symptoms: null
  });

  const [isLoading, setIsLoading] = useState({
    skin: false,
    xray: false,
    symptoms: false
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [apiStatus, setApiStatus] = useState(null);

  // Available symptoms list
  const availableSymptoms = [
    'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing',
    'shivering', 'chills', 'joint_pain', 'stomach_pain', 'acidity',
    'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition',
    'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets',
    'mood_swings', 'weight_loss', 'restlessness', 'lethargy', 'cough',
    'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration',
    'indigestion', 'headache', 'yellowish_skin', 'dark_urine', 'nausea',
    'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 'constipation',
    'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine',
    'yellowing_of_eyes', 'swelling_of_stomach', 'swelled_lymph_nodes',
    'malaise', 'blurred_and_distorted_vision', 'phlegm', 'throat_irritation',
    'redness_of_eyes', 'sinus_pressure', 'runny_nose', 'congestion',
    'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'neck_pain',
    'dizziness', 'cramps', 'bruising', 'obesity', 'swollen_legs',
    'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid',
    'brittle_nails', 'swollen_extremeties', 'excessive_hunger',
    'drying_and_tingling_lips', 'slurred_speech', 'knee_pain', 'hip_joint_pain',
    'muscle_weakness', 'stiff_neck', 'spinning_movements', 'loss_of_balance',
    'unsteadiness', 'weakness_of_one_body_side', 'loss_of_smell',
    'bladder_discomfort', 'continuous_feel_of_urine', 'passage_of_gases',
    'internal_itching', 'depression', 'irritability', 'muscle_pain',
    'red_spots_over_body', 'belly_pain', 'watering_from_eyes',
    'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum',
    'rusty_sputum', 'lack_of_concentration', 'visual_disturbances',
    'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma',
    'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption',
    'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations',
    'painful_walking', 'pus_filled_pimples', 'blackheads', 'scurring',
    'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails',
    'inflammatory_nails', 'blister', 'red_sore_around_nose', 'yellow_crust_ooze'
  ];

  const API_BASE_URL = getApiBaseUrl();

  // Check API status on mount
  React.useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [type]: file
    }));
  };

  // 🎯 FIXED: Symptom Prediction with Proper API Call
  const predictFromSymptoms = async () => {
    if (formData.symptoms.length === 0) {
      alert('Please select at least one symptom');
      return;
    }

    setIsLoading(prev => ({ ...prev, symptoms: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          symptoms: formData.symptoms
        })
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        setPredictions(prev => ({ ...prev, symptoms: result }));
        setActiveTab('results');
      } else {
        alert(`Error: ${result.message || result.error || 'Prediction failed'}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, symptoms: false }));
    }
  };

  const predictSkinDisease = async () => {
    if (!formData.skinImage) {
      alert('Please select a skin image first');
      return;
    }

    setIsLoading(prev => ({ ...prev, skin: true }));

    const formDataToSend = new FormData();
    formDataToSend.append('image', formData.skinImage);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict/skin`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setPredictions(prev => ({ ...prev, skin: result }));
        setActiveTab('results');
      } else {
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, skin: false }));
    }
  };

  const predictXray = async () => {
    if (!formData.xrayImage) {
      alert('Please select an X-ray image first');
      return;
    }

    setIsLoading(prev => ({ ...prev, xray: true }));

    const formDataToSend = new FormData();
    formDataToSend.append('image', formData.xrayImage);

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict/xray`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        setPredictions(prev => ({ ...prev, xray: result }));
        setActiveTab('results');
      } else {
        alert(`Error: ${result.message || result.error}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, xray: false }));
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return '#e74c3c'; // Red
      case 'Medium':
        return '#f39c12'; // Orange
      case 'Low':
        return '#27ae60'; // Green
      default:
        return '#95a5a6'; // Gray
    }
  };

  const buildConfidenceChart = (confidencePercentage, riskLevel) => {
    const numericValue = Number(confidencePercentage?.replace('%', '')) || 0;
    return {
      labels: ['Confidence', 'Remaining'],
      datasets: [
        {
          data: [numericValue, Math.max(0, 100 - numericValue)],
          backgroundColor: [getRiskColor(riskLevel), '#e0e0e0'],
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    cutout: '65%'
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'medical', label: 'Medical History', icon: '🏥' },
    { id: 'symptoms', label: 'Symptoms', icon: '🤒' },
    { id: 'images', label: 'Image Analysis', icon: '🖼️' },
    { id: 'results', label: 'Results', icon: '📊' }
  ];

  return (
    <div className="health-form-container">
      <header className="form-header">
        <div className="header-content">
          <h1>🏥 Health AI Prediction System</h1>
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            <div className="api-status" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginRight: '20px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: apiStatus === 'connected' ? '#27ae60' : apiStatus === 'error' ? '#f39c12' : '#e74c3c'
              }} />
              <span style={{ fontSize: '12px' }}>
                {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'error' ? 'API Error' : 'API Offline'}
              </span>
            </div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="form-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="form-content">
        {activeTab === 'personal' && (
          <div className="tab-panel">
            <h2>👤 Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="tab-panel">
            <h2>🏥 Medical History</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="medicalHistory">Medical History</label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Describe your medical history, previous illnesses, surgeries, etc."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentMedications">Current Medications</label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                  placeholder="List any medications you're currently taking"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="allergies">Allergies</label>
                <textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="List any known allergies (medications, foods, etc.)"
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="tab-panel">
            <h2>🤒 Select Your Symptoms</h2>
            <p className="tab-description">Check all symptoms that apply to you:</p>
            <div className="symptoms-grid">
              {availableSymptoms.map(symptom => (
                <label key={symptom} className="symptom-item">
                  <input
                    type="checkbox"
                    checked={formData.symptoms.includes(symptom)}
                    onChange={() => handleSymptomToggle(symptom)}
                  />
                  <span>{symptom.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
            <div className="selected-symptoms">
              <h3>Selected Symptoms ({formData.symptoms.length})</h3>
              <div className="symptoms-list">
                {formData.symptoms.length > 0 ? (
                  formData.symptoms.map(symptom => (
                    <span key={symptom} className="symptom-tag">
                      {symptom.replace(/_/g, ' ')} ✓
                    </span>
                  ))
                ) : (
                  <p style={{ color: '#aaa' }}>No symptoms selected</p>
                )}
              </div>
            </div>
            <div className="button-group">
              <button
                onClick={predictFromSymptoms}
                className="predict-btn"
                disabled={isLoading.symptoms || formData.symptoms.length === 0}
                style={{
                  opacity: formData.symptoms.length === 0 ? 0.5 : 1,
                  cursor: formData.symptoms.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading.symptoms ? (
                  <>
                    <span className="spinner">⏳</span> Analyzing Symptoms...
                  </>
                ) : (
                  `🔍 Predict from ${formData.symptoms.length} Symptom${formData.symptoms.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="tab-panel">
            <h2>🖼️ Medical Image Analysis</h2>

            <div className="image-section">
              <h3>🩹 Skin Disease Detection</h3>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'skinImage')}
                  id="skin-image"
                />
                <label htmlFor="skin-image" className="upload-label">
                  {formData.skinImage ? `✅ ${formData.skinImage.name}` : '📸 Choose Skin Image'}
                </label>
                {formData.skinImage && (
                  <img
                    src={URL.createObjectURL(formData.skinImage)}
                    alt="Skin preview"
                    className="image-preview"
                  />
                )}
              </div>
              <button
                onClick={predictSkinDisease}
                className="predict-btn"
                disabled={isLoading.skin || !formData.skinImage}
              >
                {isLoading.skin ? '⏳ Analyzing...' : '🔬 Analyze Skin Image'}
              </button>
            </div>

            <div className="image-section">
              <h3>🫁 Chest X-Ray Analysis</h3>
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'xrayImage')}
                  id="xray-image"
                />
                <label htmlFor="xray-image" className="upload-label">
                  {formData.xrayImage ? `✅ ${formData.xrayImage.name}` : '📸 Choose X-Ray Image'}
                </label>
                {formData.xrayImage && (
                  <img
                    src={URL.createObjectURL(formData.xrayImage)}
                    alt="X-ray preview"
                    className="image-preview"
                  />
                )}
              </div>
              <button
                onClick={predictXray}
                className="predict-btn"
                disabled={isLoading.xray || !formData.xrayImage}
              >
                {isLoading.xray ? '⏳ Analyzing...' : '🔬 Analyze X-Ray'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="tab-panel">
            <h2>📊 Prediction Results</h2>

            {predictions.symptoms && (
              <div className="result-card" style={{
                borderLeft: `5px solid ${getRiskColor(predictions.symptoms.risk_level)}`
              }}>
                <div className="result-header">
                  <h3>🤒 Symptom-based Prediction</h3>
                  <span className="risk-badge" style={{
                    backgroundColor: getRiskColor(predictions.symptoms.risk_level),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {predictions.symptoms.risk_level} RISK
                  </span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '230px', maxWidth: '100%' }}>
                    <Doughnut data={buildConfidenceChart(predictions.symptoms.confidence_percentage, predictions.symptoms.risk_level)} options={chartOptions} />
                    <p style={{ textAlign: 'center', marginTop: '10px', color: getRiskColor(predictions.symptoms.risk_level), fontWeight: 'bold' }}>
                      Confidence: {predictions.symptoms.confidence_percentage}
                    </p>
                  </div>
                </div>
                <div className="prediction-result">
                  <div className="main-result">
                    <p className="main-prediction">
                      <strong>💊 Predicted Disease:</strong>
                      <span style={{ fontSize: '18px', marginLeft: '10px', color: '#2c3e50' }}>
                        {predictions.symptoms.predicted_disease}
                      </span>
                    </p>
                    <p style={{ marginTop: '10px' }}>
                      <strong>📊 Confidence:</strong>
                      <span style={{ 
                        display: 'inline-block',
                        marginLeft: '10px',
                        backgroundColor: '#ecf0f1',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                      }}>
                        {predictions.symptoms.confidence_percentage}
                      </span>
                    </p>
                    <p style={{ marginTop: '10px' }}>
                      <strong>⚠️ Risk Probability:</strong>
                      <span style={{ 
                        marginLeft: '10px',
                        color: getRiskColor(predictions.symptoms.risk_level)
                      }}>
                        {predictions.symptoms.risk_probability}
                      </span>
                    </p>
                  </div>

                  {predictions.symptoms.disease_description && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                      <h4>ℹ️ Description</h4>
                      <p>{predictions.symptoms.disease_description}</p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {predictions.symptoms.medications && predictions.symptoms.medications.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
                        <h4>💊 Suggested Medications</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.symptoms.medications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.symptoms.treatments && predictions.symptoms.treatments.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f0e8f8', borderRadius: '5px' }}>
                        <h4>🏥 Treatments</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.symptoms.treatments.map((treat, idx) => (
                            <li key={idx}>{treat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.symptoms.home_remedies && predictions.symptoms.home_remedies.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f8f4e8', borderRadius: '5px' }}>
                        <h4>🌿 Home Remedies</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.symptoms.home_remedies.map((remedy, idx) => (
                            <li key={idx}>{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.symptoms.activity_recommendations && predictions.symptoms.activity_recommendations.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f8f0', borderRadius: '5px' }}>
                        <h4>🏃 Activity Recommendations</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.symptoms.activity_recommendations.map((activity, idx) => (
                            <li key={idx}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {predictions.symptoms.top_5_predictions && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>📋 Top 5 Predictions</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {predictions.symptoms.top_5_predictions.map((pred, idx) => (
                          <div key={idx} style={{
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span><strong>{idx + 1}.</strong> {pred.disease}</span>
                            <span style={{ 
                              backgroundColor: getRiskColor(pred.risk_level),
                              color: 'white',
                              padding: '3px 10px',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}>
                              {pred.confidence_percentage} ({pred.risk_level})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {predictions.skin && (
              <div className="result-card" style={{
                borderLeft: `5px solid ${getRiskColor(predictions.skin.risk_level)}`
              }}>
                <div className="result-header">
                  <h3>🩹 Skin Disease Prediction</h3>
                  <span className="risk-badge" style={{
                    backgroundColor: getRiskColor(predictions.skin.risk_level),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {predictions.skin.risk_level} RISK
                  </span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '200px', maxWidth: '100%' }}>
                    <Doughnut data={buildConfidenceChart(predictions.skin.confidence_percentage, predictions.skin.risk_level)} options={chartOptions} />
                    <p style={{ textAlign: 'center', marginTop: '10px', color: getRiskColor(predictions.skin.risk_level), fontWeight: 'bold' }}>
                      Confidence: {predictions.skin.confidence_percentage}
                    </p>
                  </div>
                </div>
                <div className="prediction-result">
                  <div className="main-result">
                    <p className="main-prediction">
                      <strong>🩺 Predicted Disease:</strong>
                      <span style={{ fontSize: '18px', marginLeft: '10px', color: '#2c3e50' }}>
                        {predictions.skin.predicted_disease}
                      </span>
                    </p>
                    <p style={{ marginTop: '10px' }}>
                      <strong>📊 Confidence:</strong>
                      <span style={{ 
                        display: 'inline-block',
                        marginLeft: '10px',
                        backgroundColor: '#ecf0f1',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                      }}>
                        {predictions.skin.confidence_percentage}
                      </span>
                    </p>
                  </div>

                  {predictions.skin.disease_description && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                      <h4>ℹ️ Description</h4>
                      <p>{predictions.skin.disease_description}</p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {predictions.skin.medications && predictions.skin.medications.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
                        <h4>💊 Suggested Medications</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.skin.medications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.skin.treatments && predictions.skin.treatments.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f0e8f8', borderRadius: '5px' }}>
                        <h4>🏥 Treatments</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.skin.treatments.map((treat, idx) => (
                            <li key={idx}>{treat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.skin.home_remedies && predictions.skin.home_remedies.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f8f4e8', borderRadius: '5px' }}>
                        <h4>🌿 Home Remedies</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.skin.home_remedies.map((remedy, idx) => (
                            <li key={idx}>{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.skin.diet_advice && predictions.skin.diet_advice.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f8f0', borderRadius: '5px' }}>
                        <h4>🍎 Diet Advice</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.skin.diet_advice.map((diet, idx) => (
                            <li key={idx}>{diet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.skin.activity_recommendations && predictions.skin.activity_recommendations.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f8e8e8', borderRadius: '5px' }}>
                        <h4>🏃 Activity Recommendations</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.skin.activity_recommendations.map((activity, idx) => (
                            <li key={idx}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {predictions.skin.top_3_predictions && (
                    <div style={{ marginTop: '20px' }}>
                      <h4>📋 Top 3 Predictions</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        {predictions.skin.top_3_predictions.map((pred, idx) => (
                          <div key={idx} style={{
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span><strong>{idx + 1}.</strong> {pred.disease}</span>
                            <span style={{ 
                              backgroundColor: getRiskColor(pred.risk_level),
                              color: 'white',
                              padding: '3px 10px',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}>
                              {pred.confidence_percentage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {predictions.xray && (
              <div className="result-card" style={{
                borderLeft: `5px solid ${getRiskColor(predictions.xray.risk_level)}`
              }}>
                <div className="result-header">
                  <h3>🫁 Chest X-Ray Analysis</h3>
                  <span className="risk-badge" style={{
                    backgroundColor: getRiskColor(predictions.xray.risk_level),
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {predictions.xray.risk_level} RISK
                  </span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '200px', maxWidth: '100%' }}>
                    <Doughnut data={buildConfidenceChart(predictions.xray.confidence_percentage, predictions.xray.risk_level)} options={chartOptions} />
                    <p style={{ textAlign: 'center', marginTop: '10px', color: getRiskColor(predictions.xray.risk_level), fontWeight: 'bold' }}>
                      Confidence: {predictions.xray.confidence_percentage}
                    </p>
                  </div>
                </div>
                <div className="prediction-result">
                  <div className="main-result">
                    <p className="main-prediction">
                      <strong>🩺 Finding:</strong>
                      <span style={{ fontSize: '18px', marginLeft: '10px', color: '#2c3e50' }}>
                        {predictions.xray.finding}
                      </span>
                    </p>
                    <p style={{ marginTop: '10px' }}>
                      <strong>📊 Confidence:</strong>
                      <span style={{ 
                        display: 'inline-block',
                        marginLeft: '10px',
                        backgroundColor: '#ecf0f1',
                        padding: '5px 15px',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                      }}>
                        {predictions.xray.confidence_percentage}
                      </span>
                    </p>
                  </div>

                  {predictions.xray.disease_description && (
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                      <h4>ℹ️ Description</h4>
                      <p>{predictions.xray.disease_description}</p>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {predictions.xray.medications && predictions.xray.medications.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px' }}>
                        <h4>💊 Suggested Medications</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.xray.medications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.xray.treatments && predictions.xray.treatments.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f0e8f8', borderRadius: '5px' }}>
                        <h4>🏥 Treatments</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.xray.treatments.map((treat, idx) => (
                            <li key={idx}>{treat}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.xray.home_remedies && predictions.xray.home_remedies.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f8f4e8', borderRadius: '5px' }}>
                        <h4>🌿 Home Remedies</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.xray.home_remedies.map((remedy, idx) => (
                            <li key={idx}>{remedy}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.xray.diet_advice && predictions.xray.diet_advice.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#e8f8f0', borderRadius: '5px' }}>
                        <h4>🍎 Diet Advice</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.xray.diet_advice.map((diet, idx) => (
                            <li key={idx}>{diet}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictions.xray.activity_recommendations && predictions.xray.activity_recommendations.length > 0 && (
                      <div style={{ padding: '15px', backgroundColor: '#f8e8e8', borderRadius: '5px' }}>
                        <h4>🏃 Activity Recommendations</h4>
                        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                          {predictions.xray.activity_recommendations.map((activity, idx) => (
                            <li key={idx}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!predictions.symptoms && !predictions.skin && !predictions.xray && (
              <div className="no-results" style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px'
              }}>
                <p style={{ fontSize: '18px', color: '#7f8c8d' }}>
                  📊 No predictions available yet
                </p>
                <p style={{ color: '#95a5a6',marginTop: '10px' }}>
                  Select symptoms or upload medical images to see results
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthForm;