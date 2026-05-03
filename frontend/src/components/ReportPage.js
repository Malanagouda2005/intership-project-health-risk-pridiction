import React from 'react';
import { FaFilePdf, FaArrowLeft, FaHeartbeat, FaStethoscope, FaAppleAlt, FaRunning, FaCheckCircle } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './ReportPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReportPage = ({ result, formData, selectedSymptoms, imagePreview, onBack, darkMode }) => {
  const generatePDFReport = () => {
    const reportContent = `
      HEALTH RISK PREDICTION REPORT
      Generated on: ${new Date().toLocaleDateString()}
      
      PATIENT INFORMATION
      Name: ${formData.name}
      Age: ${formData.age}
      Gender: ${formData.gender}
      
      BODY METRICS
      Height: ${formData.height} cm
      Weight: ${formData.weight} kg
      BMI: ${(formData.weight / ((formData.height / 100) ** 2)).toFixed(1)}
      
      MEDICAL DATA
      Blood Pressure: ${formData.bloodPressure}
      Glucose Level: ${formData.glucose}
      Heart Rate: ${formData.heartRate}
      
      SYMPTOMS REPORTED
      ${selectedSymptoms.join(', ')}
      
      LIFESTYLE FACTORS
      Smoking: ${formData.smoking ? 'Yes' : 'No'}
      Alcohol Consumption: ${formData.alcohol ? 'Yes' : 'No'}
      Regular Exercise: ${formData.exercise ? 'Yes' : 'No'}
      
      PREDICTION RESULTS
      Risk Level: ${result.riskLevel}
      Risk Percentage: ${result.riskPercent}%
      Detected Issue: ${result.disease}
      Confidence Score: ${Math.round(result.confidence * 100)}%
      
      DIETARY RECOMMENDATIONS
      ${result.dietTip}
      
      ACTIVITY RECOMMENDATIONS
      ${result.activityTip}
      
      MEDICAL RECOMMENDATIONS
      ${result.recommendations.join('\n')}
      
      IMPORTANT: This report is for informational purposes only and should not replace professional medical consultation.
      Please consult with a healthcare provider for personalized medical advice.
    `;

    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `health_report_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const chartData = {
    labels: ['Risk', 'Safe'],
    datasets: [
      {
        data: [result.riskPercent, 100 - result.riskPercent],
        backgroundColor: ['#4e9eff', '#d8e7ff'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={`report-page ${darkMode ? 'dark' : ''}`}>
      <div className="report-header">
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1>Health Risk Report</h1>
        <button className="download-button" onClick={generatePDFReport}>
          <FaFilePdf /> Download Report
        </button>
      </div>

      <div className="report-container">
        <section className="report-section patient-info">
          <h2>Patient Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">{formData.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Age</span>
              <span className="value">{formData.age}</span>
            </div>
            <div className="info-item">
              <span className="label">Gender</span>
              <span className="value" style={{ textTransform: 'capitalize' }}>{formData.gender}</span>
            </div>
            <div className="info-item">
              <span className="label">Height</span>
              <span className="value">{formData.height} cm</span>
            </div>
            <div className="info-item">
              <span className="label">Weight</span>
              <span className="value">{formData.weight} kg</span>
            </div>
            <div className="info-item">
              <span className="label">BMI</span>
              <span className="value">{(formData.weight / ((formData.height / 100) ** 2)).toFixed(1)}</span>
            </div>
          </div>
        </section>

        <section className="report-section medical-data">
          <h2>Medical Data Recorded</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Blood Pressure</span>
              <span className="value">{formData.bloodPressure}</span>
            </div>
            <div className="info-item">
              <span className="label">Glucose Level</span>
              <span className="value">{formData.glucose}</span>
            </div>
            <div className="info-item">
              <span className="label">Heart Rate</span>
              <span className="value">{formData.heartRate}</span>
            </div>
            <div className="info-item">
              <span className="label">Smoking</span>
              <span className="value">{formData.smoking ? 'Yes' : 'No'}</span>
            </div>
            <div className="info-item">
              <span className="label">Alcohol</span>
              <span className="value">{formData.alcohol ? 'Yes' : 'No'}</span>
            </div>
            <div className="info-item">
              <span className="label">Exercise</span>
              <span className="value">{formData.exercise ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </section>

        <section className="report-section symptoms-reported">
          <h2>Reported Symptoms</h2>
          <div className="symptoms-list">
            {selectedSymptoms.map((symptom, idx) => (
              <div key={idx} className="symptom-item">
                <FaCheckCircle /> {symptom}
              </div>
            ))}
          </div>
        </section>

        {result.skinPrediction && (
          <section className="report-section skin-assessment">
            <h2>Skin Image Prediction</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Predicted Condition</span>
                <span className="value">{result.skinPrediction.predicted_disease}</span>
              </div>
              <div className="info-item">
                <span className="label">Confidence</span>
                <span className="value">{result.skinPrediction.confidence_percentage}</span>
              </div>
              <div className="info-item">
                <span className="label">Risk Level</span>
                <span className="value">{result.skinPrediction.risk_level}</span>
              </div>
            </div>
          </section>
        )}

        <section className="report-section risk-assessment">
          <h2>Risk Assessment Results</h2>
          <div className="assessment-grid">
            <div className="chart-wrapper">
              <Doughnut data={chartData} />
              <p className="chart-text">{result.riskPercent}% Risk</p>
            </div>
            <div className="assessment-details">
              <div className={`status-box risk-${result.riskLevel.toLowerCase()}`}>
                <h3>Risk Level</h3>
                <p className="status-text">{result.riskLevel}</p>
              </div>
              <div className="detail-card">
                <FaHeartbeat />
                <div>
                  <p>Detected Condition</p>
                  <strong>{result.disease}</strong>
                </div>
              </div>
              <div className="detail-card">
                <FaStethoscope />
                <div>
                  <p>Confidence Score</p>
                  <strong>{Math.round(result.confidence * 100)}%</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="report-section recommendations">
          <div className="rec-grid">
            <div className="rec-card">
              <FaAppleAlt />
              <h3>Diet Recommendation</h3>
              <p>{result.dietTip}</p>
            </div>
            <div className="rec-card">
              <FaRunning />
              <h3>Activity Recommendation</h3>
              <p>{result.activityTip}</p>
            </div>
          </div>
        </section>

        <section className="report-section medical-recommendations">
          <h2>Medical Recommendations</h2>
          <ul className="recommendations-list">
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </section>

        {imagePreview && (
          <section className="report-section uploaded-image">
            <h2>Uploaded Medical Image</h2>
            <div className="image-container">
              <img src={imagePreview} alt="Medical upload" />
            </div>
          </section>
        )}

        <section className="report-section disclaimer">
          <p>
            <strong>Disclaimer:</strong> This report is generated for informational purposes only and should not be used 
            as a substitute for professional medical consultation. Always consult with a qualified healthcare provider 
            for accurate diagnosis and treatment recommendations.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReportPage;
