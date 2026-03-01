
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalMeals: 0,
        avgCalories: 0,
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setUserProfile(profile);

                // Fetch Logs
                const { data: logs, error } = await supabase
                    .from('analysis_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                // Note: removed limit(5) to get all for daily calculation, or we should filter by date in query

                if (logs) {
                    setRecentLogs(logs.slice(0, 5));

                    // Calculate Today's Stats
                    const today = new Date().toDateString();
                    const todaysLogs = logs.filter(log => new Date(log.created_at).toDateString() === today);

                    const totalCals = todaysLogs.reduce((acc, log) => acc + (log.nutrition_totals?.calories_kcal || 0), 0);
                    const totalProtein = todaysLogs.reduce((acc, log) => acc + (log.nutrition_totals?.protein_g || 0), 0);
                    const totalCarbs = todaysLogs.reduce((acc, log) => acc + (log.nutrition_totals?.carbs_g || 0), 0);
                    const totalFat = todaysLogs.reduce((acc, log) => acc + (log.nutrition_totals?.fat_g || 0), 0);

                    setStats({
                        totalMeals: logs.length,
                        avgCalories: logs.length > 0
                            ? Math.round(logs.reduce((acc, log) => acc + (log.nutrition_totals?.calories_kcal || 0), 0) / logs.length)
                            : 0,
                        today: {
                            calories: totalCals,
                            protein: totalProtein,
                            carbs: totalCarbs,
                            fat: totalFat
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Dashboard...</div>;

    return (
        <div style={{ padding: '0.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Hello, {userProfile?.username || 'User'}!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Keep up the good work!</p>
                </div>
                <Link to="/profile">
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>👤</span>
                    </div>
                </Link>
            </div>

            {/* Hero Card - Daily Progress */}
            <div className="card" style={{ background: '#1F2937', color: 'white', marginBottom: '1.5rem', border: 'none', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h3 style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CALORIES</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
                            {Math.round(stats.today?.calories || 0)}
                        </div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                            Target: {userProfile?.daily_calorie_goal || 2000}
                        </div>
                    </div>
                    {/* Ring Progress Placeholder */}
                    <div style={{ width: '80px', height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="80" height="80" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#4B5563"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="3"
                                strokeDasharray={`${Math.min(((stats.today?.calories || 0) / (userProfile?.daily_calorie_goal || 2000)) * 100, 100)}, 100`}
                            />
                        </svg>
                    </div>
                </div>

                {/* Macros Mini-Grid inside Hero */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', borderTop: '1px solid #374151', paddingTop: '1rem' }}>
                    <div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>PROTEIN</div>
                        <div style={{ fontWeight: '600' }}>{Math.round(stats.today?.protein || 0)}g</div>
                    </div>
                    <div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>CARBS</div>
                        <div style={{ fontWeight: '600' }}>{Math.round(stats.today?.carbs || 0)}g</div>
                    </div>
                    <div>
                        <div style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>FAT</div>
                        <div style={{ fontWeight: '600' }}>{Math.round(stats.today?.fat || 0)}g</div>
                    </div>
                </div>
            </div>

            {/* Today's Meals */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                    <h3>Today's Meals</h3>
                    <Link to="/analyze" style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', textDecoration: 'none', fontWeight: '600' }}>+ Add Meal</Link>
                </div>

                {recentLogs.length === 0 ? (
                    <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <p>No meals logged today.</p>
                        <Link to="/analyze">
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Log Breakfast</button>
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentLogs.map(log => (
                            <div key={log.id} style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '1rem',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'center',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid #F3F4F6'
                            }}>
                                <img src={log.image_url} alt="Meal" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {log.food_items?.map(f => f.name).join(', ').substring(0, 25)}
                                        {log.food_items?.map(f => f.name).join(', ').length > 25 ? '...' : ''}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-dark)' }}>
                                    {log.nutrition_totals?.calories_kcal}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
