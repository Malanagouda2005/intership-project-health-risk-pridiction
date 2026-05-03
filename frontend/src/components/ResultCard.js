import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaHeartbeat, FaStethoscope, FaAppleAlt, FaRunning } from 'react-icons/fa';
import './ResultCard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ResultCard = ({ result, imagePreview, onViewReport }) => {
  if (!result) {
    return (
      <div className="result-card empty-card">
        <h2>Risk Summary</h2>
        <p>Complete the form and click Predict Risk to see your personalized health score.</p>
      </div>
    );
  }
  // console.log('Rendering ResultCard with result:', result);

  const chartData = {
    labels: ['Risk', 'Remaining'],
    datasets: [
      {
        data: [result.riskPercent, 100 - result.riskPercent],
        backgroundColor: ['#4e9eff', '#d8e7ff'],
        borderWidth: 0,
      },
    ],
  };

  const recommendationItems = result.recommendations || [];

  return (
    <div className="result-card">
      <div className="result-card-header">
        <div>
          <h2>Risk Assessment</h2>
          <p className="result-subtitle">Data-driven guidance for better outcomes</p>
        </div>
        <span className={`risk-badge risk-${result.riskLevel.toLowerCase()}`}>
          {result.riskLevel}
        </span>
      </div>

      <div className="result-content-grid">
        <div className="chart-panel">
          <Doughnut data={chartData} />
          <div className="chart-label">{result.riskPercent}% Risk</div>
        </div>

        <div className="result-summary">
          <div className="stat-card">
            <FaHeartbeat />
            <div>
              <p>Detected Issue</p>
              <strong>{result.disease}</strong>
            </div>
          </div>
          <div className="stat-card">
            <FaStethoscope />
            <div>
              <p>Confidence</p>
              <strong>{Math.round(result.confidence * 100)}%</strong>
            </div>
          </div>
          <div className="stat-card">
            <FaAppleAlt />
            <div>
              <p>Diet advice</p>
              <strong>{result.dietTip}</strong>
            </div>
          </div>
          <div className="stat-card">
            <FaRunning />
            <div>
              <p>Activity</p>
              <strong>{result.activityTip}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="recommendation-block">
        <h3>Recommendations</h3>
        <ul>
          {recommendationItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {result.habits && (
        <div className="recommendation-block habits-block">
          <h3>Healthy Habits</h3>
          <ul>
            {(result.habits.precautions || []).map((item, index) => (
              <li key={`precaution-${index}`}>{item}</li>
            ))}
            {(result.habits.healthy_habits || []).map((item, index) => (
              <li key={`habit-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {imagePreview && (
        <div className="result-image-panel">
          <h3>Uploaded Image</h3>
          <img src={imagePreview} alt="Uploaded preview" />
        </div>
      )}

      <button className="view-report-button" onClick={onViewReport}>
        View Full Report & Download
      </button>
    </div>
  );
};

export default ResultCard;
