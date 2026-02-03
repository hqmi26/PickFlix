import React from 'react';
import { Check, X } from 'lucide-react';

const ActionButtons = ({ onLike, onNope }) => {
    return (
        <div style={{
            display: 'flex',
            gap: '60px',
            marginTop: '30px',
            position: 'relative',
            zIndex: 10
        }}>
            <button className="icon-btn pass" onClick={onNope} aria-label="Dislike">
                <X size={32} />
            </button>
            <button className="icon-btn love" onClick={onLike} aria-label="Like">
                <Check size={32} />
            </button>
        </div>
    );
};

export default ActionButtons;
