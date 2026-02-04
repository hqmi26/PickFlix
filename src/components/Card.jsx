import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';


const Card = forwardRef(({ movie, onSwipe, active, onClick }, ref) => {

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    // Visual cues for swipe direction
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);

    useImperativeHandle(ref, () => ({
        async triggerSwipe(direction) {
            const targetX = direction === 'right' ? 800 : -800;
            await animate(x, targetX, { duration: 0.2 }).finished;
            onSwipe(direction);
        }
    }));

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('right');
        } else if (info.offset.x < -100) {
            onSwipe('left');
        }
    };

    if (!active) return null;

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                cursor: 'grab',
                zIndex: active ? 10 : 0
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: 'grabbing' }}
            onTap={() => active && onClick && onClick()}
            className="card-item glass-panel"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
            {/* Swipe Indicators */}
            <motion.div
                style={{ opacity: likeOpacity }}
                className="swipe-indicator like"
            >
                LIKE
            </motion.div>
            <motion.div
                style={{ opacity: nopeOpacity }}
                className="swipe-indicator nope"
            >
                NOPE
            </motion.div>

            <div className="card-image" style={{ backgroundImage: `url(${movie.image})` }}>
                <div className="card-content glass-panel">
                    <h2 className="card-title neon-text-gold">{movie.title}</h2>
                    <div className="card-meta">
                        <span>{movie.genre}</span>
                        <span className="card-year">{movie.year}</span>
                    </div>
                    <p className="card-desc">{movie.desc}</p>


                </div>
            </div>
        </motion.div>
    );
});

export default Card;
