import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('Check your email for the login link!');
            navigate('/login');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
            <h2>Create Account</h2>
            <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Join us to start tracking your nutrition with AI.</p>
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={loading} style={{ padding: '0.8rem', borderRadius: '8px', background: '#84CC16', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#6B7280' }}>
                    Already have an account? <Link to="/login" style={{ color: '#84CC16', fontWeight: 'bold' }}>Log In</Link>
                </p>
            </form>
        </div>
    );
}
