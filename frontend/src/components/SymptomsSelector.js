import React, { useState } from 'react';
import { FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './SymptomsSelector.css';

const SymptomsSelector = ({ symptoms, selectedSymptoms, onToggleSymptom, onAddCustom }) => {
  const [customValue, setCustomValue] = useState('');
  const [addedDynamic, setAddedDynamic] = useState([]);

  const handleAdd = () => {
    const trimmed = customValue.trim();
    if (trimmed && trimmed.length > 2) {
      onAddCustom(trimmed);
      setAddedDynamic((prev) => [...prev, trimmed]);
      setCustomValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const allSymptoms = [...symptoms, ...addedDynamic];

  return (
    <div className="symptoms-card">
      <div className="symptoms-header">
        <h3>Symptoms</h3>
        <p>Select symptoms that apply and add custom ones if needed.</p>
      </div>

      <div className="symptom-grid">
        {allSymptoms.map((item) => (
          <button
            key={item}
            type="button"
            className={`symptom-chip ${selectedSymptoms.includes(item) ? 'selected' : ''}`}
            onClick={() => onToggleSymptom(item)}
          >
            {selectedSymptoms.includes(item) ? <FaCheckCircle /> : <FaTimesCircle />} {item}
          </button>
        ))}
      </div>

      <div className="custom-symptom-row">
        <input
          type="text"
          placeholder="Add a custom symptom (e.g., Dizziness)"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="button" onClick={handleAdd} className="add-symptom-btn">
          <FaPlus /> Add
        </button>
      </div>
    </div>
  );
};

export default SymptomsSelector;

