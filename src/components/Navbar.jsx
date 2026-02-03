import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { Heart, Home, LogOut, Sun, Moon, Users, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = ({ currentView, onViewChange, watchlistCount, onSignOut, currentTheme, onThemeChange, mode, onModeChange }) => {
    return (
        <nav style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 50
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
                    cursor: 'pointer'
                }}>
                <img src={logo} alt="PickFlix Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                    <span className={(currentTheme === 'cyberpunk' || currentTheme === 'classic') ? "neon-text-red" : "neon-text-gold"}>Pick</span>
                    <span className="neon-text-gold">Flix</span>
                </h1>
            </div>

            {/* Collapsible Navigation Menu */}
            <NavigationMenu
                currentView={currentView}
                onViewChange={onViewChange}
                watchlistCount={watchlistCount}
                onSignOut={onSignOut}
                currentTheme={currentTheme}
                onThemeChange={onThemeChange}
                mode={mode}
                onModeChange={onModeChange}
            />
        </nav>
    );
};

const NavigationMenu = ({ currentView, onViewChange, watchlistCount, onSignOut, currentTheme, onThemeChange, mode, onModeChange }) => {
    const [isOpen, setIsOpen] = useState(false);

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
            width: 'auto',
            height: 'auto',
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
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
                gap: '10px',
                padding: '5px',
                overflow: isOpen ? 'visible' : 'hidden',
                position: 'relative',
                minWidth: '50px', // Ensure circle shape when closed
                minHeight: '50px'
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
                    zIndex: 2 // Ensure it's always clickable
                }}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Menu Items */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        style={{ display: 'flex', gap: '10px', paddingRight: '10px' }}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        <motion.div variants={itemVariants}>
                            <ThemeSwitcher currentTheme={currentTheme} onThemeChange={onThemeChange} />
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => onModeChange(mode === 'dark' ? 'light' : 'dark')}
                            style={buttonStyle(mode === 'dark')}
                            title={mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => onViewChange('deck')}
                            style={buttonStyle(currentView === 'deck')}
                            title="Deck"
                        >
                            <Home size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => onViewChange('multiplayer')}
                            style={buttonStyle(currentView === 'multiplayer')}
                            title="Multiplayer"
                        >
                            <Users size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={() => onViewChange('watchlist')}
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
                            onClick={() => onViewChange('account')}
                            style={buttonStyle(currentView === 'account')}
                            title="Account"
                        >
                            <User size={20} />
                        </motion.button>

                        <motion.button
                            variants={itemVariants}
                            onClick={onSignOut}
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
    whiteSpace: 'nowrap'
});

export default Navbar;
