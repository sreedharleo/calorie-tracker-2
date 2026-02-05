import React, { useState } from 'react';
import Analyzer from './components/Analyzer';
import Results from './components/Results';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (imageFile, bmi) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('bmi', bmi);

    try {
      // Connect to the backend server
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed. Please try again.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the image. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>NutriScan AI</h1>
      <p style={{ color: '#8b949e', marginBottom: '2rem' }}>
        Clinical Nutrition Assistant
      </p>

      {!result && (
        <Analyzer onAnalyze={handleAnalyze} isLoading={loading} />
      )}

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#3e1b1b',
          color: '#ff6b6b',
          borderRadius: '8px',
          border: '1px solid #6e2a2a'
        }}>
          {error}
        </div>
      )}

      {result && (
        <>
          <Results data={result} />
          <button
            onClick={() => setResult(null)}
            style={{
              marginTop: '1.5rem',
              background: 'transparent',
              border: '1px solid #30363d',
              color: '#8b949e'
            }}
          >
            Analyze Another Meal
          </button>
        </>
      )}
    </div>
  );
}

export default App;
