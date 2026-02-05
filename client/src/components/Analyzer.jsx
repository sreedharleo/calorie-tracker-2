import React, { useState } from 'react';

const Analyzer = ({ onAnalyze, isLoading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [bmi, setBmi] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const objectUrl = URL.createObjectURL(selected);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file && bmi) {
            onAnalyze(file, bmi);
        }
    };

    return (
        <div className="card">
            <form onSubmit={handleSubmit}>
                <div className="file-upload-wrapper">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment" // Opens camera on mobile
                        onChange={handleFileChange}
                    />
                    {!preview ? (
                        <div style={{ pointerEvents: 'none' }}>
                            <span style={{ fontSize: '2rem' }}>📸</span>
                            <p>Tap to Capture Meal</p>
                        </div>
                    ) : (
                        <img src={preview} alt="Food Preview" className="preview-image" />
                    )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label" htmlFor="bmi-input">Patient BMI</label>
                    <input
                        id="bmi-input"
                        type="number"
                        placeholder="e.g. 22.5"
                        value={bmi}
                        onChange={(e) => setBmi(e.target.value)}
                        step="0.1"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={!file || !bmi || isLoading}
                    style={{ width: '100%' }}
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Meal'}
                </button>
            </form>
        </div>
    );
};

export default Analyzer;
