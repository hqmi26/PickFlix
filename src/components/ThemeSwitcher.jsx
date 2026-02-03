import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '../styles/themes';

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="theme-switcher" style={{ position: 'relative', zIndex: 100 }}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--neon-gold)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--neon-gold)',
                    backdropFilter: 'blur(5px)'
                }}
            >
                <span style={{ fontSize: '1.2rem' }}>🎨</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: '50px',
                            right: '0',
                            background: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            minWidth: '200px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div style={{ padding: '0 4px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            SELECT THEME
                        </div>
                        {Object.values(themes).map((theme) => (
                            <motion.button
                                key={theme.id}
                                onClick={() => {
                                    onThemeChange(theme.id);
                                    setIsOpen(false);
                                }}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    background: currentTheme === theme.id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    border: currentTheme === theme.id ? `1px solid ${theme.dark['--neon-primary']}` : '1px solid transparent',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: theme.dark['--bg-dark'],
                                    border: `2px solid ${theme.dark['--neon-primary']}`,
                                    boxShadow: `0 0 5px ${theme.dark['--neon-primary']}`
                                }} />
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{theme.name}</div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSwitcher;
