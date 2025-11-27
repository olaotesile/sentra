import React from 'react';
import { Plus, Bell } from 'lucide-react';

interface BottomBarProps {
    onCreateClick: () => void;
    onFeedClick: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onCreateClick, onFeedClick }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '20px',
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
            display: 'flex',
            gap: '12px',
            zIndex: 'var(--z-overlay)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            pointerEvents: 'none'
        }}>
            <button
                onClick={onCreateClick}
                className="btn btn-primary"
                style={{
                    flex: 1,
                    height: '52px',
                    padding: '0 16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    pointerEvents: 'auto'
                }}
            >
                <Plus size={20} />
                Create Alert
            </button>

            <button
                onClick={onFeedClick}
                className="glass"
                style={{
                    flex: 1,
                    height: '52px',
                    padding: '0 16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    background: 'rgba(26, 29, 35, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    pointerEvents: 'auto'
                }}
            >
                <Bell size={20} />
                Alerts
            </button>
        </div>
    );
};
