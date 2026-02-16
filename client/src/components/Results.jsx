import React from 'react';

const Results = ({ data, imagePreview }) => {
    if (!data) return null;

    const { food_identified, nutrition_estimate, health_tips } = data;

    return (
        <div className="card">
            <h2 style={{ marginTop: 0 }}>Analysis Results</h2>

            {imagePreview && (
                <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <img src={imagePreview} alt="Analyzed meal" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            )}

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '0.75rem' }}>Identified Items</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {food_identified.map((item, idx) => (
                        <span key={idx} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>{item.name}</span>
                            <span style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.8em'
                            }}>
                                {item.calories} cal
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="stat-grid">
                <div className="stat-box">
                    <div className="stat-value">{nutrition_estimate.calories_kcal}</div>
                    <div className="stat-label">Calories (kcal)</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{nutrition_estimate.protein_g}g</div>
                    <div className="stat-label">Protein</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{nutrition_estimate.carbs_g}g</div>
                    <div className="stat-label">Carbs</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{nutrition_estimate.fat_g}g</div>
                    <div className="stat-label">Fat</div>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#2dd4bf' }}>Health Tips</h3>
                <ul className="tips-list">
                    {health_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Results;
