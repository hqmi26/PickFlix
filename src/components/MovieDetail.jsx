import React, { useState, useEffect } from 'react';
import { fetchMovieVideos } from '../services/tmdb';
import { motion } from 'framer-motion';

const MovieDetail = ({ movie, onClose }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);


    useEffect(() => {
        if (movie?.id) {
            fetchMovieVideos(movie.id).then(videos => {
                const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
                    || videos.find(v => v.site === 'YouTube');
                if (trailer) setTrailerKey(trailer.key);
            });


        }
    }, [movie]);

    if (!movie) return null;



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="movie-detail-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="glass-panel"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    padding: '0', // Full bleed for image
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: 'none',
                        color: 'white',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 10,
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    &times;
                </button>

                {/* Hero Image */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '300px',
                    backgroundImage: !showTrailer ? `url(${movie.backdrop || movie.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#000'
                }}>
                    {showTrailer && trailerKey ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                            title="Movie Trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0 }}
                        />
                    ) : (
                        <>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to top, #1a1a2e, transparent)'
                            }} />

                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '20px'
                            }}>
                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                    style={{
                                        width: '100px',
                                        borderRadius: '10px',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                                        border: '2px solid var(--neon-gold)'
                                    }}
                                />
                                <div style={{ paddingBottom: '10px' }}>
                                    <h1 className="neon-text-gold" style={{
                                        fontSize: '2rem',
                                        margin: 0,
                                        textShadow: '0 0 10px rgba(0,0,0,0.5)'
                                    }}>
                                        {movie.title}
                                    </h1>
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        marginTop: '5px',
                                        color: 'var(--text-gray)'
                                    }}>
                                        <span>{movie.year}</span>
                                        <span>•</span>
                                        <span>{movie.genre}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: '30px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: '#ffd700',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}>
                            <span>★</span>
                            <span>{movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                        {/* Add more metrics if available */}
                    </div>

                    <h3 style={{ color: 'var(--neon-blue)', marginBottom: '10px' }}>Plot Summary</h3>
                    <p style={{
                        lineHeight: '1.6',
                        color: '#e0e0e0',
                        fontSize: '1.1rem',
                        marginBottom: '30px'
                    }}>
                        {movie.desc}
                    </p>



                    {/* Action Buttons inside modal */}
                    <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '20px'
                    }}>
                        {trailerKey && (
                            <button
                                onClick={() => setShowTrailer(!showTrailer)}
                                style={{
                                    background: 'var(--neon-red)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '10px 30px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 15px var(--neon-red)'
                                }}
                            >
                                {showTrailer ? 'Close Trailer' : 'Watch Trailer'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--text-gray)',
                                color: 'var(--text-gray)',
                                padding: '10px 30px',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </motion.div >
        </motion.div >
    );
};

export default MovieDetail;
