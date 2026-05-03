import React, { useMemo, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import RiskForm from './RiskForm';
import ResultCard from './ResultCard';
import ReportPage from './ReportPage';
import Loader from './Loader';
import Card from './Card';
import './HealthDashboard.css';
import getApiBaseUrl from '../apiConfig';

const API_BASE = getApiBaseUrl();

const recommendationMap = {
  low: [
    'Maintain your healthy routine and stay active.',
    'Keep balanced meals and hydration a priority.',
    'Schedule periodic health checkups.'
  ],
  medium: [
    'Increase light exercise and monitor your diet.',
    'Reduce processed foods and sugar intake.',
    'Follow up with your physician if symptoms persist.'
  ],
  high: [
    'Seek medical advice promptly for a deeper evaluation.',
    'Adopt a structured diet and medication plan.',
    'Track your vitals daily and share reports with your doctor.'
  ]
};

const getRiskLevel = (percentage) => {
  if (percentage >= 75) return 'High';
  if (percentage >= 45) return 'Medium';
  return 'Low';
};

const getRecommendations = (level) => recommendationMap[level.toLowerCase()] || recommendationMap.low;

const HealthDashboard = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodPressure: '',
    glucose: '',
    heartRate: '',
    smoking: false,
    alcohol: false,
    exercise: false,
    image: null
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [imagePreview, setImagePreview] = useState('');
  const [result, setResult] = useState(null);
  const [skinResult, setSkinResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skinLoading, setSkinLoading] = useState(false);
  const [error, setError] = useState('');
  const [skinError, setSkinError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [activePage, setActivePage] = useState('symptoms');

  const bmi = useMemo(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (!height || !weight) return '';
    return (weight / ((height / 100) ** 2)).toFixed(1);
  }, [formData.height, formData.weight]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = (customSymptom) => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
    }
  };

  const handleImageSelect = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG files are allowed.');
      return;
    }
    setError('');
    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview('');
  };

  const handlePredict = async () => {
    setError('');
    if (!formData.name || !formData.age || !formData.gender) {
      setError('Please complete the required personal details.');
      return;
    }
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to continue.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user_id: user?.id,
        symptoms: selectedSymptoms,
        metrics: {
          age: formData.age,
          bmi,
          bloodPressure: formData.bloodPressure,
          glucose: formData.glucose,
          heartRate: formData.heartRate
        },
        lifestyle: {
          smoking: formData.smoking,
          alcohol: formData.alcohol,
          exercise: formData.exercise
        }
      };

      const response = await axios.post(`${API_BASE}/api/predict/symptoms`, payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;
      // console.log('Prediction response:', data);
      if (!response.status || response.status >= 400 || data.error) {
        throw new Error(data.error || 'Prediction request failed');
      }

      const riskLevel = data.risk_level || getRiskLevel(Math.round((data.confidence_score || 0) * 100));
      const riskPercent = data.risk_probability ? parseInt(data.risk_probability.replace('%', '')) : Math.round((data.confidence_score || 0) * 100);
      const confidence = data.confidence_score || (data.confidence_percentage ? parseFloat(data.confidence_percentage.replace('%', '')) / 100 : 0);

      setResult({
        riskLevel,
        riskPercent,
        disease: data.predicted_disease || data.prediction || 'General health risk',
        confidence: confidence,
        dietTip: data.diet_advice && data.diet_advice.length > 0 ? data.diet_advice[0] : 'Balanced nutrition',
        activityTip: data.activity_recommendations && data.activity_recommendations.length > 0 ? data.activity_recommendations[0] : 'Regular exercise',
        recommendations: data.medications || data.recommendations || getRecommendations(riskLevel),
        habits: {
          precautions: data.home_remedies || [
            'Stay hydrated and sleep at least 7-8 hours per night.',
            'Maintain a balanced whole-foods diet.',
            'Take short walks and stay active daily.'
          ],
          healthy_habits: data.activity_recommendations || []
        },
        // Additional backend data for ResultCard
        medications: data.medications,
        dietAdvice: data.diet_advice,
        activityRecommendations: data.activity_recommendations,
        homeRemedies: data.home_remedies,
        diseaseDescription: data.disease_description,
        recoveryDuration: data.recovery_duration,
        skinPrediction: skinResult || null
      });
      setShowReport(false);
      setActivePage('summary');
    } catch (networkError) {
      console.error(networkError);
      const responseData = networkError.response?.data;
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : null) ||
        networkError.message ||
        'Unable to connect with the prediction service. Please try again later.';
      setError(errorMessage);
      setResult(null);
    }

    setLoading(false);
  };

  const handlePredictSkin = async () => {
    setSkinError('');
    if (!formData.image) {
      setSkinError('Please upload a skin image before analyzing.');
      return;
    }

    setSkinLoading(true);

    try {
      const imagePayload = new FormData();
      imagePayload.append('image', formData.image);

      const response = await axios.post(`${API_BASE}/api/predict/skin`, imagePayload);

      const data = response.data;
      if (response.status >= 400 || data.status === 'error' || data.error) {
        throw new Error(data.error || data.message || 'Skin prediction failed');
      }

      setSkinResult(data);
      setResult({
        riskLevel: data.risk_level || 'Low',
        riskPercent: parseInt((data.risk_probability || '0%').replace('%', ''), 10) || 0,
        disease: data.predicted_disease || data.prediction || 'Skin condition detected',
        confidence: data.confidence_score || (parseFloat((data.confidence_percentage || '0%').replace('%', '')) / 100) || 0,
        dietTip: data.diet_advice?.[0] || 'Maintain a balanced diet and skin hydration.',
        activityTip: data.activity_recommendations?.[0] || 'Keep skin clean and avoid irritants.',
        recommendations: data.medications || data.treatments || [],
        habits: {
          precautions: data.home_remedies || [],
          healthy_habits: data.activity_recommendations || []
        },
        medications: data.medications,
        dietAdvice: data.diet_advice,
        activityRecommendations: data.activity_recommendations,
        homeRemedies: data.home_remedies,
        diseaseDescription: data.disease_description,
        recoveryDuration: data.recovery_duration,
        skinPrediction: data
      });
      setShowReport(false);
      setActivePage('summary');
    } catch (networkError) {
      console.error(networkError);
      const responseData = networkError.response?.data;
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        networkError.message ||
        'Unable to connect with the skin prediction service. Please try again later.';
      setSkinError(errorMessage);
    }

    setSkinLoading(false);
  };

  const handleViewReport = () => {
    setShowReport(true);
  };

  const handleBackFromReport = () => {
    setShowReport(false);
  };

  const isSummaryReady = !!result;

  const tabs = [
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'summary', label: 'Risk Summary' }
  ];

  if (showReport && result) {
    return (
      <ReportPage
        result={result}
        formData={formData}
        selectedSymptoms={selectedSymptoms}
        imagePreview={imagePreview}
        onBack={handleBackFromReport}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={darkMode ? 'dashboard-shell dark' : 'dashboard-shell'}>
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)} user={user} onLogout={onLogout} />

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dashboard-tab ${activePage === tab.id ? 'active' : ''}`}
            onClick={() => tab.id === 'summary' && !isSummaryReady ? null : setActivePage(tab.id)}
            disabled={tab.id === 'summary' && !isSummaryReady}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activePage === 'symptoms' ? (
        <div className="page-grid">
          <section className="main-panel">
            <Card title="Symptoms Intake" subtitle="Fill in your symptoms and health metrics for a tailored prediction.">
              <RiskForm
                formData={formData}
                bmi={bmi}
                loading={loading}
                skinLoading={skinLoading}
                error={error}
                skinError={skinError}
                onChange={handleChange}
                onToggleToggle={handleToggle}
                onToggleSymptom={handleSymptomToggle}
                selectedSymptoms={selectedSymptoms}
                onAddCustomSymptom={handleAddCustomSymptom}
                onImageSelect={handleImageSelect}
                onRemoveImage={handleRemoveImage}
                onSkinAnalyze={handlePredictSkin}
                imagePreview={imagePreview}
                onSubmit={handlePredict}
              />
            </Card>
          </section>
        </div>
      ) : (
        <div className="summary-page">
          <div className="summary-header">
            <div>
              <h2>Risk Summary</h2>
              <p>Review your health analysis and generate a shareable report.</p>
            </div>
            <button className="secondary-button" onClick={() => setActivePage('symptoms')}>
              Back to Symptoms
            </button>
          </div>

          <div className="summary-grid">
            <section className="summary-panel">
              <ResultCard result={result} imagePreview={imagePreview} onViewReport={handleViewReport} />
            </section>
          </div>
        </div>
      )}

      {loading && <Loader />}
    </div>
  );
};

export default HealthDashboard;
