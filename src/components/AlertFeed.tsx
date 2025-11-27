import React from 'react';
import { X } from 'lucide-react';
import type { Alert } from '../types';
import { AlertCard } from './AlertCard';

interface AlertFeedProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: Alert[];
    onAlertClick: (alert: Alert) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ isOpen, onClose, alerts, onAlertClick }) => {
    if (!isOpen) return null;

    return (
        <div className="animate-slide-up" style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            background: 'var(--color-bg)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 'var(--z-modal)',
            border: '1px solid var(--color-border)'
        }}>
            {/* Handle for dragging */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px',
                cursor: 'grab'
            }}>
                <div style={{
                    width: '48px',
                    height: '5px',
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: '3px'
                }} />
            </div>

            {/* Header */}
            <div style={{
                padding: '0 24px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Alerts</h2>
                <button onClick={onClose} className="icon-btn">
                    <X size={24} />
                </button>
            </div>

            {/* Feed Content */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px 24px'
            }}>
                {alerts.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        marginTop: '80px',
                        padding: '40px 20px'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px',
                            opacity: 0.5
                        }}>🔔</div>
                        <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No alerts nearby</p>
                        <p style={{ fontSize: '15px', lineHeight: '1.5' }}>
                            When community members report alerts in your area, they'll appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {alerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} onClick={() => onAlertClick(alert)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
