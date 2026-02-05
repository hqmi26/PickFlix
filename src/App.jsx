import React, { useState, useRef, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Deck from './components/Deck';
import ActionButtons from './components/ActionButtons';
import Watchlist from './components/Watchlist';
import MovieDetail from './components/MovieDetail';
import { fetchPopularMovies, fetchTopRatedMovies, fetchUpcomingMovies, fetchDiscoverMovies, fetchKoreanMovies } from './services/tmdb';
import FilterBar from './components/FilterBar';
import { supabase } from './services/supabase';
import Auth from './components/Auth';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerRoom from './components/MultiplayerRoom';
import Account from './components/Account';

function App() {
  const [lastDirection, setLastDirection] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('pickflix-watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('pickflix-current-view') || 'deck';
  });
  const [category, setCategory] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ genre: '', minRating: 0, year: '' });
  const hasActiveFilters = filters.genre || filters.minRating > 0 || filters.year;
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('pickflix-mode') || 'dark';
  });
  const [activeSupabaseRoom, setActiveSupabaseRoom] = useState(null);
  const deckRef = useRef(null);

  const handleActiveMovieChange = (movie) => {
    setActiveMovie(movie);
  };

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        let data = [];
        const hasFilters = filters.genre || filters.minRating > 0 || filters.year;

        if (hasFilters) {
          data = await fetchDiscoverMovies(filters);
        } else if (category === 'popular') data = await fetchPopularMovies();
        else if (category === 'top_rated') data = await fetchTopRatedMovies();
        else if (category === 'upcoming') data = await fetchUpcomingMovies();
        else if (category === 'korean') data = await fetchKoreanMovies();

        // Filter out movies already in watchlist to avoid duplicates in deck if desired
        // For now, we'll keep them but maybe we can filter later
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies", err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [category, filters]);

  useEffect(() => {
    localStorage.setItem('pickflix-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('pickflix-current-view', currentView);
  }, [currentView]);

  useEffect(() => {
    // Hardcoded Cyberpunk Theme Values
    const cyberpunkTheme = {
      dark: {
        '--bg-dark': '#0a0a0a',
        '--bg-gradient': 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)',
        '--neon-primary': '#ff1f1f',
        '--neon-secondary': '#ffdb4d',
        '--neon-accent': '#ff8c00',
        '--text-primary': '#ffffff',
        '--text-secondary': '#a1a1a1',
        '--card-bg': '#1a1a1a',
        '--glass-bg': 'rgba(255, 255, 255, 0.05)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)',
        '--glow-primary': '0 0 15px #ff1f1f',
        '--glow-secondary': '0 0 15px #ffdb4d',
      },
      light: {
        '--bg-dark': '#f0f0f5',
        '--bg-gradient': 'radial-gradient(circle at 50% 50%, #ffffff 0%, #e0e0eb 100%)',
        '--neon-primary': '#d60000',
        '--neon-secondary': '#e6c200',
        '--neon-accent': '#e67300',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#555555',
        '--card-bg': '#ffffff',
        '--glass-bg': 'rgba(0, 0, 0, 0.05)',
        '--glass-border': 'rgba(0, 0, 0, 0.1)',
        '--glow-primary': '0 0 15px rgba(214, 0, 0, 0.3)',
        '--glow-secondary': '0 0 15px rgba(230, 194, 0, 0.3)',
      }
    };

    const theme = cyberpunkTheme[mode];
    const root = document.documentElement;

    const setProp = (name, value) => root.style.setProperty(name, value);

    // Apply specific theme color map to variables
    setProp('--bg-dark', theme['--bg-dark']);
    setProp('--bg-gradient', theme['--bg-gradient']);

    setProp('--neon-red', theme['--neon-primary']);
    setProp('--neon-gold', theme['--neon-secondary']);
    setProp('--neon-orange', theme['--neon-accent']);

    setProp('--text-white', theme['--text-primary']);
    setProp('--text-gray', theme['--text-secondary']);

    setProp('--card-bg', theme['--card-bg']);
    setProp('--glass-bg', theme['--glass-bg']);
    setProp('--glass-border', theme['--glass-border']);

    // Glows
    setProp('--glow-primary', theme['--glow-primary']);
    setProp('--glow-secondary', theme['--glow-secondary']);

    localStorage.setItem('pickflix-mode', mode);
  }, [mode]);



  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Handle deep links for Supabase Auth
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
        try {
          // Check if it's a Supabase callback (has hash with access_token)
          if (url.includes('access_token') || url.includes('refresh_token')) {
            // Parse the hash parameters
            // Just pass the URL to supabase helpers if available, or manually parsing
            // Given the instructions: "extract session tokens and call supabase.auth.setSession()"

            // Supabase's getSession() usually handles this if called right after?
            // But let's try to extract manually as requested.

            const hashIndex = url.indexOf('#');
            if (hashIndex !== -1) {
              const params = new URLSearchParams(url.substring(hashIndex + 1));
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');

              if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                  access_token,
                  refresh_token
                });
                if (error) console.error("Error setting session from deep link:", error);
              }
            }
          }
        } catch (e) {
          console.error("Deep link error:", e);
        }
      });
    }

    return () => {
      subscription.unsubscribe();
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, []);

  const handleSwipeAction = (direction, movie) => {
    setLastDirection(direction);
    if (direction === 'right') {
      setWatchlist(prev => {
        if (!prev.find(m => m.id === movie.id)) {
          return [...prev, movie];
        }
        return prev;
      });
    }
  };

  const handleRemoveFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(m => m.id !== movieId));
  };

  const handleLove = () => {
    if (deckRef.current) {
      deckRef.current.swipe('right');
    }
  };

  const handleNope = () => {
    if (deckRef.current) {
      deckRef.current.swipe('left');
    }
  };

  const handleCardClick = (movie) => {
    setSelectedMovie(movie);
  };



  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container" style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: '130px',
      background: 'var(--bg-gradient)',
      overflow: 'hidden'
    }}>
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetail
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <FilterBar
            activeFilters={filters}
            onApplyFilters={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Theater Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        background: '#0a0a0a' // Fallback
      }}>
        {/* Dynamic Movie Background */}
        <AnimatePresence mode="wait">
          {selectedMovie || (deckRef.current && movies.length > 0) ? (
            <motion.div
              key={selectedMovie ? selectedMovie.id : (activeMovie ? activeMovie.id : 'default')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '120%',
                height: '120%',
                backgroundImage: `url(${(selectedMovie || activeMovie)?.image || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(30px) brightness(0.4)',
                transform: 'scale(1.1)'
              }}
            />
          ) : null}
        </AnimatePresence>

        {/* Cinematic Vignette / Spotlight Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, transparent 0%, rgba(10,10,10,0.4) 50%, rgba(0,0,0,0.9) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Subtle Texture Overlay for Film Grain feel (Optional but nice) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 2
        }} />
      </div>

      {/* Background glow effects - Keeping these but lowering opacity to blend with theater mode */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'var(--neon-orange)',
        filter: 'blur(150px)',
        opacity: 0.1,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 2
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '400px',
        height: '400px',
        background: 'var(--neon-gold)',
        filter: 'blur(150px)',
        opacity: 0.05,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        watchlistCount={watchlist.length}
        onSignOut={handleSignOut}
        mode={mode}
        onModeChange={setMode}
      />

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 0, // Handled by parent padding
        width: '100%',
        height: '100%',
        position: 'relative'
      }}>
        {currentView === 'deck' && (
          <div className="category-switcher" style={{
            marginBottom: '50px',
            display: 'flex',
            gap: '10px',
            zIndex: 10,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setShowFilters(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${filters.genre || filters.minRating > 0 || filters.year ? 'var(--neon-orange)' : 'rgba(255, 255, 255, 0.2)'}`,
                color: filters.genre || filters.minRating > 0 || filters.year ? 'var(--neon-orange)' : 'var(--text-gray)',
                padding: '6px 12px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span style={{ fontSize: '1.2em' }}>⚡</span> Filters
            </button>
            {['popular', 'top_rated', 'upcoming', 'korean'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setFilters({ genre: '', minRating: 0, year: '' });
                }}
                style={{
                  background: (category === cat && !hasActiveFilters) ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${(category === cat && !hasActiveFilters) ? 'var(--neon-gold)' : 'rgba(255, 255, 255, 0.2)'}`,
                  color: (category === cat && !hasActiveFilters) ? 'var(--neon-gold)' : 'var(--text-gray)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {currentView === 'deck' && (
          <>
            {loading ? (
              <div style={{ color: 'var(--neon-gold)', fontSize: '1.5rem', marginTop: '20px' }}>
                Loading Neural Net...
              </div>
            ) : (
              <Deck
                ref={deckRef}
                movies={movies}
                onSwipeAction={handleSwipeAction}
                onCardClick={handleCardClick}
                onActiveMovieChange={handleActiveMovieChange}
              />
            )}

            <ActionButtons
              onLike={handleLove}
              onNope={handleNope}
            />

            {lastDirection && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                color: lastDirection === 'right' ? 'var(--neon-gold)' : 'var(--neon-red)',
                fontWeight: 'bold',
                fontSize: '2rem',
                textShadow: `0 0 10px ${lastDirection === 'right' ? 'var(--neon-gold)' : 'var(--neon-red)'}`,
                animation: 'fadeInOut 1s forwards',
                pointerEvents: 'none',
                zIndex: 20
              }}>
                {lastDirection === 'right' ? "IT'S A MATCH!" : "PASS"}
              </div>
            )}
          </>
        )}

        {currentView === 'watchlist' && (
          <Watchlist
            movies={watchlist}
            onRemove={handleRemoveFromWatchlist}
            onMovieClick={handleCardClick}
          />
        )}

        {currentView === 'multiplayer' && (
          !activeSupabaseRoom ? (
            <MultiplayerLobby
              onStartGame={(room) => setActiveSupabaseRoom(room)}
              onBack={() => setCurrentView('deck')}
            />
          ) : (
            <MultiplayerRoom
              room={activeSupabaseRoom}
              onLeave={() => setActiveSupabaseRoom(null)}
            />
          )
        )}

        {currentView === 'account' && (
          <Account
            session={session}
            onBack={() => setCurrentView('deck')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
