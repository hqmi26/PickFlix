import React from 'react';
import { motion } from 'framer-motion';

const Watchlist = ({ movies, onRemove, onMovieClick }) => {
    return (
        <div className="watchlist-container" style={{
            width: '100%',
            maxWidth: '1200px',
            padding: '20px',
            overflowY: 'auto',
            height: 'calc(100vh - 100px)', // Adjust for navbar
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '20px',
            paddingBottom: '100px' // Space for scrolling
        }}>
            {movies.length === 0 ? (
                <div style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh',
                    color: 'var(--text-gray)'
                }}>
                    <h2 className="neon-text-gold" style={{ marginBottom: '1rem' }}>Your Watchlist is Empty</h2>
                    <p>Swipe right on movies to add them here.</p>
                </div>
            ) : (
                movies.map((movie, index) => (
                    <motion.div
                        key={movie.id}
                        onClick={() => onMovieClick && onMovieClick(movie)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-panel"
                        style={{
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: '2/3',
                            borderRadius: '15px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${movie.image})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.3s ease'
                        }} />

                        <div className="watchlist-overlay" style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                            padding: '15px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <h3 style={{
                                color: '#fff',
                                margin: 0,
                                fontSize: '1rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{movie.title}</h3>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(movie.id);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--neon-red)',
                                    color: 'var(--neon-red)',
                                    padding: '5px',
                                    borderRadius: '5px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    marginTop: '5px'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default Watchlist;
