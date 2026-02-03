import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import Card from './Card';
import { AnimatePresence } from 'framer-motion';

const Deck = forwardRef(({ movies: initialMovies = [], onSwipeAction, onCardClick, onActiveMovieChange }, ref) => {
    const [movies, setMovies] = useState(initialMovies);

    const [swiped, setSwiped] = useState([]);

    useEffect(() => {
        setMovies(initialMovies);
    }, [initialMovies]);

    // Notify parent of active movie change
    useEffect(() => {
        const activeMovie = movies.length > 0 ? movies[movies.length - 1] : null;
        if (onActiveMovieChange) {
            onActiveMovieChange(activeMovie);
        }
    }, [movies, onActiveMovieChange]);

    // Ref to store refs of all rendered cards by ID
    const cardRefs = useRef(new Map());

    useImperativeHandle(ref, () => ({
        swipe(direction) {
            // Find the currently active movie (last in the list)
            const activeMovie = movies[movies.length - 1];
            if (activeMovie) {
                const cardRef = cardRefs.current.get(activeMovie.id);
                if (cardRef) {
                    cardRef.triggerSwipe(direction);
                }
            }
        }
    }));

    const handleSwipe = (direction, movie) => {
        // Notify parent or log action
        console.log(`Swiped ${direction} on ${movie.title}`);
        onSwipeAction && onSwipeAction(direction, movie);

        // Remove card from stack
        setSwiped([...swiped, movie.id]);
        setMovies(movies.filter((m) => m.id !== movie.id));
    };

    return (
        <div className="card-container">
            <AnimatePresence>
                {movies.map((movie, index) => (
                    <Card
                        key={movie.id}
                        ref={(el) => {
                            if (el) {
                                cardRefs.current.set(movie.id, el);
                            } else {
                                cardRefs.current.delete(movie.id);
                            }
                        }}
                        movie={movie}
                        active={index === movies.length - 1}
                        onSwipe={(dir) => handleSwipe(dir, movie)}
                        onClick={() => onCardClick && onCardClick(movie)}
                    />
                ))}
            </AnimatePresence>
            {movies.length === 0 && (
                <div className="glass-panel" style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--text-gray)',
                    fontSize: '1.2rem',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div>
                        <p className="neon-text-red" style={{ fontSize: '3rem', marginBottom: '1rem' }}>No More Movies</p>
                        <p>Check back later for more neon nightmares.</p>
                        <button
                            onClick={() => setMovies(initialMovies)}
                            style={{
                                marginTop: '20px',
                                background: 'transparent',
                                border: '1px solid var(--neon-gold)',
                                color: 'var(--neon-gold)',
                                padding: '10px 20px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            Restart Deck
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Deck;
