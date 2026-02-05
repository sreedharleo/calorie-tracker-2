import React from 'react';

const Results = ({ data }) => {
    if (!data) return null;

    const { food_identified, nutrition_estimate, health_tips } = data;

    return (
        <div className="card">
            <h2 style={{ marginTop: 0 }}>Analysis Results</h2>

            <div style={{ marginBottom: '1rem' }}>
                {food_identified.map((item, idx) => (
                    <span key={idx} className="tag">{item}</span>
                ))}
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
