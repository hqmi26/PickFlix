import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Deck from './Deck';
import ActionButtons from './ActionButtons';
import NotificationToast from './NotificationToast';

import { castVote, subscribeToRoom, leaveRoom, cancelRoom, getRoomMatches, getRoomVotes, ensureJoined } from '../services/multiplayer';
import { fetchPopularMovies, fetchDiscoverMovies, fetchMovieDetails, fetchMovieVideos } from '../services/tmdb';
import { supabase } from '../services/supabase';

const MultiplayerRoom = ({ room, onLeave }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState(null);
    const [notification, setNotification] = useState(null);
    const [myLikedMovies, setMyLikedMovies] = useState(new Set());
    const [roomMatches, setRoomMatches] = useState([]);
    const [allVotes, setAllVotes] = useState([]); // Store all votes to calculate matches
    const [showMatches, setShowMatches] = useState(false);
    const [selectedPreviewMovie, setSelectedPreviewMovie] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const deckRef = useRef(null);

    useEffect(() => {
        const loadMovies = async () => {
            setLoading(true);
            try {
                // Check if host
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.id === room.host_id) {
                    setIsHost(true);
                }

                // Use room config to fetch movies. Default to popular if no config.
                let data = [];
                if (room.config && (room.config.genre || room.config.year)) {
                    data = await fetchDiscoverMovies(room.config);
                } else {
                    data = await fetchPopularMovies();
                }
                setMovies(data);
            } catch (err) {
                console.error("Failed to fetch movies for room", err);
            } finally {
                setLoading(false);
            }
        };

        loadMovies();

        // Ensure we are in the participants table (handles refreshes)
        ensureJoined(room.id);

        // Initial fetch of matches
        getRoomMatches(room.id).then(matches => {
            console.log("Initial Matches:", matches);
            setRoomMatches(matches || []);
        }).catch(err => console.error("Error fetching matches:", err));

        // Initial fetch of votes to know state
        getRoomVotes(room.id).then(votes => {
            console.log("Initial Votes:", votes);
            setAllVotes(votes || []);
        }).catch(err => console.error("Error fetching votes:", err));

        // Subscribe to room updates
        const channel = subscribeToRoom(room.id, async (action) => {
            console.log("Room Action:", action);

            if (action.type === 'MATCH_FOUND') {
                setRoomMatches(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === action.payload.id)) return prev;
                    return [...prev, action.payload];
                });

                // Show notification if it's a new match
                setNotification("New Match Found!");
            }

            if (action.type === 'USER_VOTED') {
                setAllVotes(prev => {
                    // Avoid duplicates if we already have this vote
                    if (prev.find(v => v.user_id === action.payload.user_id && v.movie_id === action.payload.movie_id)) {
                        return prev;
                    }
                    return [...prev, action.payload];
                });
            }
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room.id]);

    // Effect to hydrate match details when match ID is set (for the big overlay)
    useEffect(() => {
        // We still use this for the "It's a Match" full screen overlay
        // which we trigger locally when *we* cause the match
    }, []);

    // Effect to hydrate match details when match ID is set
    useEffect(() => {
        if (match && !match.title) {
            const found = movies.find(m => m.id === match.id);
            if (found) {
                setMatch(found);
            }
        }
    }, [match, movies]);

    const handleSwipeAction = async (direction, movie) => {
        const vote = direction === 'right';

        if (vote) {
            setMyLikedMovies(prev => new Set(prev).add(movie.id));

            // Optimistically add to allVotes to update UI instantly
            const { data: { user } } = await supabase.auth.getUser();
            setAllVotes(prev => [...prev, { user_id: user.id, movie_id: movie.id, vote: true }]);
        }

        try {
            const result = await castVote(room.id, movie.id, vote);

            // Check if this vote created a match
            if (vote) {
                if (vote && result.otherLikers && result.otherLikers.length > 0) {
                    // Server confirmed match!
                    setMatch(movie);
                    setNotification("It's a match!");
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLove = () => {
        if (deckRef.current) deckRef.current.swipe('right');
    };

    const handleNope = () => {
        if (deckRef.current) deckRef.current.swipe('left');
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Header Controls */}
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 20px',
                zIndex: 20,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', // Subtle gradient for visibility
                marginBottom: '10px' // Space between header and deck
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                        padding: '6px 12px',
                        borderRadius: '15px',
                        border: '1px solid var(--neon-gold)',
                        color: 'var(--neon-gold)',
                        background: 'rgba(0,0,0,0.5)',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        Room: {room.code}
                    </div>

                    <button
                        onClick={() => setShowMatches(true)}
                        style={{
                            background: 'var(--neon-gold)',
                            color: 'black',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
                        }}
                    >
                        <span>🏆 Matches</span>
                        <span style={{
                            background: 'black',
                            color: 'var(--neon-gold)',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem'
                        }}>{roomMatches.length}</span>
                    </button>
                </div>

                <button
                    onClick={async () => {
                        if (isHost) {
                            if (window.confirm("Are you sure you want to CANCEL this room? This will kick everyone out.")) {
                                await cancelRoom(room.id);
                                localStorage.removeItem('pickflix-multiplayer-state');
                                onLeave();
                            }
                        } else {
                            if (window.confirm("Leave the room?")) {
                                await leaveRoom(room.id);
                                localStorage.removeItem('pickflix-multiplayer-state');
                                onLeave();
                            }
                        }
                    }}
                    style={{
                        background: 'rgba(0,0,0,0.5)',
                        color: isHost ? 'var(--neon-red)' : 'var(--text-gray)',
                        border: `1px solid ${isHost ? 'var(--neon-red)' : 'var(--text-gray)'}`,
                        padding: '8px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.color = 'var(--neon-red)';
                        e.target.style.borderColor = 'var(--neon-red)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.color = isHost ? 'var(--neon-red)' : 'var(--text-gray)';
                        e.target.style.borderColor = isHost ? 'var(--neon-red)' : 'var(--text-gray)';
                    }}
                >
                    {isHost ? 'CANCEL' : 'EXIT'}
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--neon-gold)', fontSize: '1.5rem', marginTop: '50px' }}>
                    Loading Movies...
                </div>
            ) : (
                <>
                    <Deck
                        ref={deckRef}
                        movies={movies}
                        onSwipeAction={handleSwipeAction}
                    />
                    <ActionButtons onLike={handleLove} onNope={handleNope} />
                </>
            )}

            <NotificationToast
                message={notification}
                onClose={() => setNotification(null)}
            />

            {/* Match Overlay */}
            <AnimatePresence>
                {match && match.title && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.9)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 100
                        }}
                    >
                        <h1 style={{
                            fontFamily: '"Monoton", cursive',
                            fontSize: '4rem',
                            color: 'var(--neon-gold)',
                            textShadow: '0 0 20px var(--neon-gold)',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            IT'S A MATCH!
                        </h1>

                        <img
                            src={match.image}
                            alt={match.title}
                            style={{
                                width: '300px',
                                borderRadius: '20px',
                                boxShadow: '0 0 30px var(--neon-gold)',
                                marginBottom: '2rem'
                            }}
                        />

                        <h2 style={{ color: 'var(--text-white)', marginBottom: '1rem' }}>{match.title}</h2>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={() => setMatch(null)}
                                style={{
                                    padding: '10px 30px',
                                    background: 'var(--neon-red)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '30px',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Keep Swiping
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const videos = await fetchMovieVideos(match.id);
                                        const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos.find(v => v.site === "YouTube");
                                        if (trailer) {
                                            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                                        } else {
                                            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(match.title + " trailer")}`, '_blank');
                                        }
                                    } catch (err) {
                                        console.error("Error opening trailer", err);
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '2px solid var(--neon-gold)',
                                    color: 'var(--neon-gold)',
                                    borderRadius: '30px',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                🎥 Trailer
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Matches List Modal */}
            <AnimatePresence>
                {showMatches && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.95)',
                            zIndex: 150,
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            maxWidth: '600px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 className="neon-text-gold">Room Matches</h2>
                            <button
                                onClick={() => setShowMatches(false)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--neon-red)',
                                    color: 'var(--neon-red)',
                                    padding: '5px 15px',
                                    borderRadius: '15px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '15px',
                            width: '100%',
                            maxWidth: '800px',
                            overflowY: 'auto',
                            paddingBottom: '50px'
                        }}>
                            {roomMatches.length === 0 ? (
                                <p style={{ color: 'var(--text-gray)', gridColumn: '1/-1', textAlign: 'center' }}>No matches yet. Keep swiping!</p>
                            ) : (
                                roomMatches.map(m => {
                                    // Try to resolve movie from pre-loaded movies or just use what we have
                                    const movieDetails = movies.find(mv => mv.id === m.movie_id);

                                    return (
                                        <div key={m.id} style={{
                                            aspectRatio: '2/3',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            border: '1px solid var(--neon-gold)'
                                        }}>
                                            <MatchCard
                                                movieId={m.movie_id}
                                                initialData={movieDetails}
                                                onClick={setSelectedPreviewMovie}
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {selectedPreviewMovie && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0,0,0,0.95)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 200, // Higher than other modals
                            padding: '20px'
                        }}
                    >
                        <button
                            onClick={() => setSelectedPreviewMovie(null)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: '1px solid var(--neon-red)',
                                color: 'var(--neon-red)',
                                padding: '5px 15px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Close
                        </button>
                        <h2 style={{
                            fontFamily: '"Monoton", cursive',
                            fontSize: '3rem',
                            color: 'var(--neon-gold)',
                            textShadow: '0 0 15px var(--neon-gold)',
                            textAlign: 'center',
                            marginBottom: '1rem'
                        }}>
                            {selectedPreviewMovie.title}
                        </h2>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <img
                                src={selectedPreviewMovie.image}
                                alt={selectedPreviewMovie.title}
                                style={{
                                    width: '200px',
                                    borderRadius: '15px',
                                    boxShadow: '0 0 20px var(--neon-gold)'
                                }}
                            />
                            <div style={{ maxWidth: '400px', textAlign: 'left', color: 'var(--text-white)' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--neon-gold)' }}>
                                    {selectedPreviewMovie.year}
                                </p>
                                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    <strong>Genre:</strong> {selectedPreviewMovie.genre}
                                </p>
                                <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    <strong>Rating:</strong> {selectedPreviewMovie.rating}/10
                                </p>
                                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', marginTop: '1rem' }}>
                                    {selectedPreviewMovie.desc || selectedPreviewMovie.overview}
                                </p>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                // Simple loading indicator on text would require state, but let's just fire it
                                                const videos = await fetchMovieVideos(selectedPreviewMovie.id);
                                                const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube") || videos.find(v => v.site === "YouTube");
                                                if (trailer) {
                                                    window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                                                } else {
                                                    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedPreviewMovie.title + " trailer")}`, '_blank');
                                                }
                                            } catch (err) {
                                                console.error("Error opening trailer", err);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid var(--neon-red)',
                                            color: 'var(--text-white)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        🎥 Trailer
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://www.themoviedb.org/movie/${selectedPreviewMovie.id}`, '_blank')}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid var(--neon-gold)',
                                            color: 'var(--text-white)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        ℹ Info
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper component to load match details if needed
const MatchCard = ({ movieId, initialData, onClick }) => {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    useEffect(() => {
        if (!data) {
            fetchMovieDetails(movieId).then(detail => {
                if (detail) setData(detail);
            });
        }
    }, [movieId, data]);

    if (!data) {
        return (
            <div
                style={{ width: '100%', height: '100%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                Loading...
            </div>
        );
    }

    return (
        <div
            onClick={() => onClick(data)}
            style={{
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                position: 'relative'
            }}
        >
            <img
                src={data.image}
                alt={data.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: 'rgba(0,0,0,0.8)',
                padding: '5px',
                fontSize: '0.8rem',
                color: 'white',
                textAlign: 'center'
            }}>
                {data.title}
            </div>
        </div>
    );
};

export default MultiplayerRoom;
