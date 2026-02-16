import React, { useState } from 'react';
import Analyzer from './components/Analyzer';
import Results from './components/Results';
import { compressImage } from './utils/imageUtils';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [longLoading, setLongLoading] = useState(false);

  const handleAnalyze = async (imageFile, bmi) => {
    setLoading(true);
    setLongLoading(false);
    setError(null);
    setLoading(true);
    setError(null);
    setResult(null);
    setImagePreview(URL.createObjectURL(imageFile));

    try {
      // Compress image before sending
      const compressedBlob = await compressImage(imageFile);
      console.log(`Original size: ${imageFile.size / 1024} KB`);
      console.log(`Compressed size: ${compressedBlob.size / 1024} KB`);

      const formData = new FormData();
      formData.append('image', compressedBlob, 'image.jpg');
      formData.append('bmi', bmi);

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
      setLongLoading(false);
    }
  };

  React.useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setLongLoading(true), 5000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header Section with Icon */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
        </div>

        <h1>Calorie Tracker</h1>

        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '3rem',
          fontSize: '1.1rem',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          Your Nutrition Friend
        </p>

        {/* Feature badges */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <span style={{
            padding: '0.5rem 1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)'
          }}>
            ⚡ Instant Analysis
          </span>
          <span style={{
            padding: '0.5rem 1rem',
            background: 'rgba(240, 147, 251, 0.1)',
            border: '1px solid rgba(240, 147, 251, 0.3)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)'
          }}>
            🎯 AI-Powered
          </span>
          <span style={{
            padding: '0.5rem 1rem',
            background: 'rgba(79, 172, 254, 0.1)',
            border: '1px solid rgba(79, 172, 254, 0.3)',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(10px)'
          }}>
            📊 Detailed Insights
          </span>
        </div>
      </div>

      {/* Main Content */}
      {!result && !loading && (
        <Analyzer onAnalyze={handleAnalyze} isLoading={loading} />
      )}

      {/* Loading State */}
      {loading && (
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 1.5rem',
            border: '4px solid rgba(21, 128, 61, 0.2)',
            borderTopColor: '#15803d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>

          <h3 style={{
            background: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            Analyzing Your Meal
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Our AI is processing the nutritional content...
          </p>

          {longLoading && (
            <p style={{
              color: '#d97706',
              fontSize: '0.85rem',
              marginTop: '1rem',
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}>
              ⏳ The free server is waking up... this might take about a minute. Thanks for your patience!
            </p>
          )}

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              margin: 0
            }}>
              💡 Did you know? NutriScan uses advanced computer vision to identify food items and estimate portions
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
          color: '#d63031',
          borderRadius: '16px',
          border: '1px solid rgba(245, 87, 108, 0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'shake 0.5s ease-in-out'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Analysis Failed</div>
          <div style={{ fontSize: '0.9rem', color: '#ff7675' }}>{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <Results data={result} imagePreview={imagePreview} />

          <button
            onClick={() => {
              setResult(null);
              setError(null);
              setImagePreview(null);
            }}
            style={{
              marginTop: '2rem',
              background: 'transparent',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              color: 'var(--text-secondary)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>🔄</span>
            Analyze Another Meal
          </button>
        </>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '4rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: '0.5rem 0' }}>
          Powered by AI • Built for Health Professionals
        </p>
        <p style={{ margin: '0.5rem 0', opacity: 0.8 }}>
          Results are estimates. Consult healthcare providers for medical advice.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}

export default App;
