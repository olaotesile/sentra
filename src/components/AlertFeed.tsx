import React, { useState, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { Alert } from '../types';
import { AlertCard } from './AlertCard';

interface AlertFeedProps {
    isOpen: boolean;
    onClose: () => void;
    alerts: Alert[];
    onAlertClick: (alert: Alert) => void;
    onRefresh?: () => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ isOpen, onClose, alerts, onAlertClick, onRefresh }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const pulling = useRef(false);

    if (!isOpen) return null;

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollElement = scrollRef.current;
        if (!scrollElement || scrollElement.scrollTop > 0) return;

        startY.current = e.touches[0].clientY;
        pulling.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!pulling.current) return;

        const scrollElement = scrollRef.current;
        if (!scrollElement || scrollElement.scrollTop > 0) {
            pulling.current = false;
            return;
        }

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, currentY - startY.current);

        if (distance > 0) {
            setIsPulling(true);
            setPullDistance(Math.min(distance, 80));
        }
    };

    const handleTouchEnd = () => {
        if (pullDistance > 60 && onRefresh) {
            onRefresh();
        }

        pulling.current = false;
        setIsPulling(false);
        setPullDistance(0);
    };

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
                padding: '0 24px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Alerts</h2>
                <button onClick={onClose} className="icon-btn">
                    <X size={20} />
                </button>
            </div>

            {/* Feed Content */}
            <div
                ref={scrollRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 24px 24px',
                    position: 'relative'
                }}
            >
                {/* Pull to refresh indicator */}
                {pullDistance > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: -40 + pullDistance,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: pullDistance / 80,
                        transition: isPulling ? 'none' : 'all 0.3s ease',
                        zIndex: 1000
                    }}>
                        <RefreshCw
                            size={24}
                            color="#10b981"
                            style={{
                                animation: pullDistance > 60 ? 'spin 1s linear infinite' : 'none'
                            }}
                        />
                    </div>
                )}

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
