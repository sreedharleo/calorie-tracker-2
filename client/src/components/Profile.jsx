
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        username: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        bmi: '',
        daily_calorie_goal: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateBMI = (height, weight) => {
        if (!height || !weight) return '';
        const heightInMeters = height / 100;
        return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const bmi = calculateBMI(profile.height, profile.weight);
            const updates = {
                id: user.id,
                ...profile,
                bmi,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Profile updated!');
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#E5E7EB', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    👤
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Your Profile</h2>
                <p style={{ color: 'var(--text-muted)' }}>Customize your health goals</p>
            </div>

            <form onSubmit={updateProfile} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label className="label">Full Name</label>
                    <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={profile.username || ''}
                        onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label className="label">Age</label>
                        <input
                            type="number"
                            placeholder="25"
                            value={profile.age || ''}
                            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="label">Gender</label>
                        <select
                            value={profile.gender || ''}
                            onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label className="label">Height (cm)</label>
                        <input
                            type="number"
                            placeholder="175"
                            value={profile.height || ''}
                            onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="label">Weight (kg)</label>
                        <input
                            type="number"
                            placeholder="70"
                            value={profile.weight || ''}
                            onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Daily Calorie Goal</label>
                    <input
                        type="number"
                        placeholder="2000"
                        value={profile.daily_calorie_goal || ''}
                        onChange={(e) => setProfile({ ...profile, daily_calorie_goal: e.target.value })}
                        style={{ border: '2px solid var(--primary-light)' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Typical goal: 2000-2500 kcal/day
                    </p>
                </div>

                {profile.height && profile.weight && (
                    <div style={{
                        padding: '1rem',
                        background: '#ECFCCB',
                        borderRadius: '0.75rem',
                        textAlign: 'center',
                        color: 'var(--primary-dark)',
                        fontWeight: '600',
                        marginTop: '0.5rem'
                    }}>
                        Calculated BMI: {calculateBMI(profile.height, profile.weight)}
                    </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>

                <button type="button" onClick={() => supabase.auth.signOut()} className="btn" style={{ color: '#EF4444', marginTop: '0.5rem', width: '100%' }}>
                    Log Out
                </button>
            </form>
        </div>
    );
}
