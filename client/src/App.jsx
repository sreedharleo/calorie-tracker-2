import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Analyzer from './components/Analyzer';
import Results from './components/Results';
import Login from './components/Login';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';

import Layout from './components/Layout';
import Welcome from './components/Welcome';
import Signup from './components/Signup';
import { compressImage } from './utils/imageUtils';

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [longLoading, setLongLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline
  const [userBMI, setUserBMI] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch BMI from profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('bmi').eq('id', user.id).single();
        if (data && data.bmi) setUserBMI(data.bmi);
      }
    };
    fetchProfile();
  }, []);

  // Wake up server on load
  useEffect(() => {
    const pingServer = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) setServerStatus('online');
        else setServerStatus('offline');
      } catch (error) {
        console.error('Server ping failed', error);
        setServerStatus('offline');
      }
    };
    pingServer();
  }, [API_URL]);

  const handleAnalyze = async (imageFile, manualBmi) => {
    // improved logic: use profile BMI if available, else manual
    const bmiToUse = userBMI || manualBmi;

    if (!bmiToUse) {
      alert("Please update your profile with your height/weight or enter BMI manually.");
      return;
    }

    setLoading(true);
    setLongLoading(false);
    setError(null);
    setResult(null);
    setIsLogged(false); // Reset logging state
    setImagePreview(URL.createObjectURL(imageFile));

    try {
      const compressedBlob = await compressImage(imageFile);
      const formData = new FormData();
      formData.append('image', compressedBlob, 'image.jpg');
      formData.append('bmi', bmiToUse);

      // Get current session for token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Analysis failed.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // Response was not JSON
          console.warn('Non-JSON error response', jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(`Backend error: ${err.message}`);
    } finally {
      setLoading(false);
      setLongLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!result) return;

    setSaveLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: result.image_url,
          food_identified: result.food_identified,
          nutrition_estimate: result.nutrition_estimate
        }),
      });

      if (!response.ok) throw new Error('Failed to save meal.');
      setIsLogged(true);
    } catch (err) {
      alert(`Error saving meal: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Timer for "Waking up server"
  useEffect(() => {
    let timer;
    if (loading) timer = setTimeout(() => setLongLoading(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>

      <div style={{ marginBottom: '2rem' }}>
        {userBMI && <p style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '0.9rem' }}>Target: {userBMI} BMI Strategy</p>}
      </div>

      {!result && !loading && <Analyzer onAnalyze={handleAnalyze} isLoading={loading} forceManualBmi={!userBMI} />}

      {/* Loading State */}
      {
        loading && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 1.5rem', border: '4px solid rgba(21, 128, 61, 0.2)', borderTopColor: '#15803d', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h3>Analyzing Your Meal...</h3>
            {longLoading && <p style={{ color: '#d97706', marginTop: '1rem' }}>⏳ The server is waking up... thanks for waiting!</p>}
          </div>
        )
      }

      {error && <div style={{ color: 'red', marginTop: '2rem' }}>{error}</div>}

      {
        result && (
          <>
            <Results
              data={result}
              imagePreview={imagePreview}
              onLog={handleSaveMeal}
              isLoading={saveLoading}
              isLogged={isLogged}
            />
            <button onClick={() => { setResult(null); setError(null); setImagePreview(null); setIsLogged(false); }} style={{ marginTop: '2rem', padding: '1rem' }}>
              🔄 Analyze Another Meal
            </button>
          </>
        )
      }

      {/* Footer */}
      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(102, 126, 234, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Status: <span style={{ color: serverStatus === 'online' ? 'green' : 'red' }}>●</span> {serverStatus}
      </div>
    </div >
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={!session ? <Welcome /> : <Navigate to="/" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" />} />
        <Route path="/profile" element={session ? <Layout><Profile /></Layout> : <Navigate to="/welcome" />} />
        {/* Dashboard is the new Index Route */}
        <Route path="/" element={session ? <Layout><Dashboard /></Layout> : <Navigate to="/welcome" />} />
        {/* Analyze is now a separate page */}
        <Route path="/analyze" element={session ? <Layout><Home /></Layout> : <Navigate to="/welcome" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
