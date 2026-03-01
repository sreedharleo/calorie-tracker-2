import React, { useState } from 'react';
import { compressImage } from '../utils/imageUtils';

const Analyzer = ({ onAnalyze, isLoading }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [bmi, setBmi] = useState('');

    const handleFileChange = async (e) => {
        const selected = e.target.files[0];
        if (selected) {
            try {
                // Show local preview immediately using raw file for speed
                const objectUrl = URL.createObjectURL(selected);
                setPreview(objectUrl);

                // Compress in background
                const compressed = await compressImage(selected);
                setFile(compressed);
                console.log(`Original: ${selected.size}, Compressed: ${compressed.size}`);
            } catch (error) {
                console.error("Compression failed", error);
                setFile(selected); // Fallback to original
            }
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
                <div className="file-upload-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Capture / Camera Option */}
                    <div className="upload-btn-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                        <button type="button" className="btn" style={{ width: '100%', padding: '1rem', background: '#e0f2fe', color: '#0284c7', border: '2px dashed #0284c7', borderRadius: '8px', cursor: 'pointer' }}>
                            📸 Capture Photo
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    {/* Upload from Gallery Option */}
                    <div className="upload-btn-wrapper" style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                        <button type="button" className="btn" style={{ width: '100%', padding: '1rem', background: '#f0fdf4', color: '#15803d', border: '2px dashed #15803d', borderRadius: '8px', cursor: 'pointer' }}>
                            📁 Upload from Gallery
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                    </div>

                    {preview && (
                        <div style={{ marginTop: '1rem' }}>
                            <img src={preview} alt="Food Preview" className="preview-image" style={{ borderRadius: '12px', width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                        </div>
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
