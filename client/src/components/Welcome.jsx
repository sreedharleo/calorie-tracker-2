import React from 'react';
import { Link } from 'react-router-dom';

export default function Welcome() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ECFCCB 0%, #FAFAF9 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div style={{
                width: '120px',
                height: '120px',
                background: 'white',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                marginBottom: '2rem'
            }}>
                <span style={{ fontSize: '4rem' }}>🥑</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1F2937' }}>
                Smarter Eating <br />
                <span style={{ color: '#84CC16' }}>Made Simple</span>
            </h1>

            <p style={{ color: '#6B7280', fontSize: '1.1rem', maxWidth: '300px', marginBottom: '3rem', lineHeight: '1.6' }}>
                Track your calories, monitor your macros, and reach your goals with AI-powered food analysis.
            </p>

            <Link to="/login" style={{ textDecoration: 'none', width: '100%', maxWidth: '320px' }}>
                <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem' }}>
                    Get Started
                </button>
            </Link>

            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9CA3AF' }}>
                Don't have an account? <Link to="/signup" style={{ color: '#84CC16', fontWeight: 'bold' }}>Sign up</Link>
            </p>
        </div>
    );
}
