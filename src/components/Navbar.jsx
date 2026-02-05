import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Heart, Home, LogOut, Sun, Moon, Users, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ currentView, onViewChange, watchlistCount, onSignOut, mode, onModeChange }) => {
    return (
        <nav style={{
            position: 'absolute',
            top: '20px',
            left: 0,
            width: '100%',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start', // Changed to flex-start for mobile menu alignment
            zIndex: 50,
            pointerEvents: 'none' // Let clicks pass through empty areas
        }}>
            {/* Logo Section */}
            <div
                className="glass-panel"
                onClick={() => onViewChange('deck')}
                style={{
                    padding: '10px 20px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    pointerEvents: 'auto', // Re-enable pointer events
                    height: '50px' // Fixed height for consistency
                }}>
                <img src={logo} alt="PickFlix Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                    <span className={"neon-text-red"}>Pick</span>
                    <span className="neon-text-gold">Flix</span>
                </h1>
            </div>

            {/* Collapsible Navigation Menu */}
            <div style={{ pointerEvents: 'auto' }}>
                <NavigationMenu
                    currentView={currentView}
                    onViewChange={onViewChange}
                    watchlistCount={watchlistCount}
                    onSignOut={onSignOut}
                    mode={mode}
                    onModeChange={onModeChange}
                />
            </div>
        </nav>
    );
};

const NavigationMenu = ({ currentView, onViewChange, watchlistCount, onSignOut, mode, onModeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuVariants = {
        closed: {
            width: '50px',
            height: '50px',
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 40
            }
        },
        open: {
            width: isMobile ? '60px' : 'auto', // Narrow width for mobile vertical layout
            height: isMobile ? 'auto' : '50px', // Auto height for mobile vertical layout
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 40,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, scale: 0, display: 'none' },
        open: { opacity: 1, scale: 1, display: 'flex' }
    };

    return (
        <motion.div
            className="glass-panel"
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            variants={menuVariants}
            style={{
                borderRadius: '25px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row', // Vertical on mobile
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : (isOpen ? 'flex-start' : 'center'),
                gap: '10px',
                padding: '5px',
                overflow: 'hidden',
                position: 'relative',
                minWidth: '50px',
                minHeight: '50px',
                backgroundColor: isMobile && isOpen ? 'rgba(0,0,0,0.8)' : undefined, // Darker bg for mobile menu
                backdropFilter: isMobile && isOpen ? 'blur(15px)' : undefined,
                boxShadow: isMobile && isOpen ? '0 4px 30px rgba(0, 0, 0, 0.5)' : undefined,
            }}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleMenu}
                style={{
                    background: 'transparent',
                    color: 'var(--neon-gold)',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    width: '40px',
                    height: '40px',
                    flexShrink: 0
                }}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Menu Items */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: '10px',
                            paddingRight: isMobile ? '0' : '10px',
                            paddingBottom: isMobile ? '10px' : '0',
                            alignItems: 'center'
                        }}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >


                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onModeChange(mode === 'dark' ? 'light' : 'dark'); }}
                            style={buttonStyle(mode === 'dark')}
                            title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onViewChange('deck'); if (isMobile) toggleMenu(); }}
                            style={buttonStyle(currentView === 'deck')}
                            title="Deck"
                        >
                            <Home size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onViewChange('multiplayer'); if (isMobile) toggleMenu(); }}
                            style={buttonStyle(currentView === 'multiplayer')}
                            title="Multiplayer"
                        >
                            <Users size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onViewChange('watchlist'); if (isMobile) toggleMenu(); }}
                            style={{ ...buttonStyle(currentView === 'watchlist'), position: 'relative' }}
                            title="Watchlist"
                        >
                            <Heart size={20} />
                            {watchlistCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    background: 'var(--neon-red)',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    width: '15px',
                                    height: '15px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                }}>{watchlistCount}</span>
                            )}
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onViewChange('account'); if (isMobile) toggleMenu(); }}
                            style={buttonStyle(currentView === 'account')}
                            title="Account"
                        >
                            <User size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => { onSignOut(); if (isMobile) toggleMenu(); }}
                            style={{ ...buttonStyle(false), color: 'var(--neon-red)' }}
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const buttonStyle = (isActive) => ({
    background: isActive ? 'var(--neon-gold)' : 'transparent',
    color: isActive ? '#000' : '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    width: '40px',
    height: '40px'
});

export default Navbar;
