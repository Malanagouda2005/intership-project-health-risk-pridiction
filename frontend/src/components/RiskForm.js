import React from 'react';
import { FaUser, FaVenusMars, FaRulerVertical, FaWeight, FaHeartbeat, FaTint, FaThermometerHalf, FaSmoking, FaGlassMartiniAlt, FaDumbbell } from 'react-icons/fa';
import ImageUpload from './ImageUpload';
import SymptomsSelector from './SymptomsSelector';
import './RiskForm.css';

const symptomsOptions = ['Fever', 'Headache', 'Fatigue', 'Chest Pain', 'Shortness of Breath'];

const RiskForm = ({
  formData,
  bmi,
  loading,
  skinLoading,
  error,
  skinError,
  onChange,
  onToggleToggle,
  onToggleSymptom,
  selectedSymptoms,
  onAddCustomSymptom,
  onImageSelect,
  onRemoveImage,
  onSkinAnalyze,
  imagePreview,
  onSubmit,
}) => {
  return (
    <div className="risk-form-card">
      <div className="panel-title">
        <div>
          <h2>Health Input</h2>
          <p>Submit your details to generate a tailored risk prediction.</p>
        </div>
      </div>

      <section className="input-section">
        <h3>Basic Details</h3>
        <div className="field-grid">
          <label>
            <FaUser /> Name
            <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="Enter name" />
          </label>
          <label>
            <FaRulerVertical /> Age
            <input type="number" name="age" value={formData.age} onChange={onChange} placeholder="Age" min="0" />
          </label>
          <label>
            <FaVenusMars /> Gender
            <select name="gender" value={formData.gender} onChange={onChange}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
      </section>

      <section className="input-section">
        <div className="section-header">
          <h3>Body Metrics</h3>
          <span className="bmi-pill">BMI {bmi || '—'}</span>
        </div>
        <div className="field-grid">
          <label>
            <FaRulerVertical /> Height (cm)
            <input type="number" name="height" value={formData.height} onChange={onChange} placeholder="e.g. 170" min="0" />
          </label>
          <label>
            <FaWeight /> Weight (kg)
            <input type="number" name="weight" value={formData.weight} onChange={onChange} placeholder="e.g. 68" min="0" />
          </label>
        </div>
      </section>

      <section className="input-section">
        <h3>Medical Data</h3>
        <div className="field-grid">
          <label>
            <FaHeartbeat /> Blood Pressure
            <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={onChange} placeholder="120/80" />
          </label>
          <label>
            <FaTint /> Glucose Level
            <input type="text" name="glucose" value={formData.glucose} onChange={onChange} placeholder="e.g. 98 mg/dL" />
          </label>
          <label>
            <FaThermometerHalf /> Heart Rate
            <input type="text" name="heartRate" value={formData.heartRate} onChange={onChange} placeholder="e.g. 72 bpm" />
          </label>
        </div>
      </section>

      <section className="input-section">
        <SymptomsSelector
          symptoms={symptomsOptions}
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={onToggleSymptom}
          onAddCustom={onAddCustomSymptom}
        />
      </section>

      <section className="input-section lifestyle-section">
        <h3>Lifestyle</h3>
        <div className="toggle-grid">
          <button type="button" className={formData.smoking ? 'toggle active' : 'toggle'} onClick={() => onToggleToggle('smoking')}>
            <FaSmoking /> Smoking
          </button>
          <button type="button" className={formData.alcohol ? 'toggle active' : 'toggle'} onClick={() => onToggleToggle('alcohol')}>
            <FaGlassMartiniAlt /> Alcohol
          </button>
          <button type="button" className={formData.exercise ? 'toggle active' : 'toggle'} onClick={() => onToggleToggle('exercise')}>
            <FaDumbbell /> Exercise
          </button>
        </div>
      </section>

      <section className="input-section">
        <ImageUpload image={formData.image} previewUrl={imagePreview} onFileSelect={onImageSelect} onRemove={onRemoveImage} />
        <div className="skin-action-group">
          <button type="button" className="secondary-button" onClick={onSkinAnalyze} disabled={skinLoading || !formData.image}>
            {skinLoading ? 'Analyzing Skin Image...' : 'Analyze Skin Image'}
          </button>
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}
      {skinError && <div className="form-error">{skinError}</div>}

      <button className="predict-button" onClick={onSubmit} disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Risk'}
      </button>
    </div>
  );
};

export default RiskForm;
