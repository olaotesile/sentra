import React from 'react';
import { Menu, ShieldAlert } from 'lucide-react';

interface TopBarProps {
    onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 'var(--z-overlay)'
        }}>
            <ShieldAlert color="var(--color-danger)" size={28} />

            <h1 style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                fontWeight: 800,
                margin: 0,
                color: 'white',
                letterSpacing: '0.5px'
            }}>
                Sentra
            </h1>

            <button onClick={onMenuClick} className="icon-btn">
                <Menu size={24} />
            </button>
        </div>
    );
};
