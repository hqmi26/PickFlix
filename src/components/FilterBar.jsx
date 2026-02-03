import React, { useState } from 'react';
import { GENRES } from '../services/tmdb';

const FilterBar = ({ activeFilters, onApplyFilters, onClose }) => {
    const [localFilters, setLocalFilters] = useState(activeFilters || {
        genre: '',
        minRating: 0,
        year: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = { genre: '', minRating: 0, year: '' };
        setLocalFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="glass-panel" style={{
                padding: '30px',
                width: '90%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative'
            }}>
                <h2 style={{ color: 'var(--neon-gold)', textAlign: 'center', marginBottom: '10px' }}>
                    Filter Movies
                </h2>

                {/* Genre */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: 'var(--text-gray)' }}>Genre</label>
                    <select
                        name="genre"
                        value={localFilters.genre}
                        onChange={handleChange}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--text-white)',
                            padding: '10px',
                            borderRadius: '8px',
                            outline: 'none'
                        }}
                    >
                        <option value="" style={{ color: 'black' }}>All Genres</option>
                        {Object.entries(GENRES).map(([id, name]) => (
                            <option key={id} value={id} style={{ color: 'black' }}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: 'var(--text-gray)' }}>Min Rating: {localFilters.minRating}+</label>
                    <input
                        type="range"
                        name="minRating"
                        min="0"
                        max="10"
                        step="0.5"
                        value={localFilters.minRating}
                        onChange={handleChange}
                        style={{ width: '100%', accentColor: 'var(--neon-orange)' }}
                    />
                </div>

                {/* Year */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ color: 'var(--text-gray)' }}>Year (Optional)</label>
                    <input
                        type="number"
                        name="year"
                        placeholder="e.g. 2023"
                        value={localFilters.year}
                        onChange={handleChange}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'var(--text-white)',
                            padding: '10px',
                            borderRadius: '8px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={handleReset}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'transparent',
                            border: '1px solid var(--neon-red)',
                            color: 'var(--neon-red)',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'var(--neon-gold)',
                            border: 'none',
                            color: 'black',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Apply
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-gray)',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default FilterBar;
