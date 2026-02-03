import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationToast = ({ message, onClose }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    style={{
                        position: 'fixed',
                        bottom: '120px', // Above action buttons
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(20, 20, 30, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--neon-gold)',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        color: 'var(--text-white)',
                        boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        minWidth: '300px',
                        justifyContent: 'center'
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    <span style={{ fontWeight: 500 }}>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
