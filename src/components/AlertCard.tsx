import React from 'react';
import { ThumbsUp, ThumbsDown, MapPin } from 'lucide-react';
import type { Alert } from '../types';

interface AlertCardProps {
    alert: Alert;
    onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
    const getColor = (type: string) => {
        switch (type) {
            case 'violence':
            case 'fire': return 'var(--color-danger)';
            case 'suspicious': return 'var(--color-warning)';
            default: return 'var(--color-primary)';
        }
    };

    const formatTime = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;
        return '1 day ago';
    };

    const getLocationName = (lat: number, lng: number): string => {
        // Map coordinates to Nigerian locations
        const locations: { [key: string]: string } = {
            '10.5225,7.4388': 'Kaduna',
            '11.9974,8.5218': 'Zaria-Kano Road',
            '6.4645,3.3792': 'Third Mainland Bridge',
            '6.5244,3.3792': 'Allen Avenue, Ikeja',
            '9.0579,7.4951': 'Gwarinpa, Abuja',
            '6.4281,3.4219': 'Lekki-Epe Expressway',
            '10.3158,7.7318': 'Kaduna-Abuja Expressway',
            '6.5095,3.3711': 'Balogun, Lagos Island',
            '7.3775,3.9470': 'Bodija, Ibadan',
            '6.6018,3.3515': 'Aguda, Surulere',
            '6.4474,3.4700': 'Victoria Island',
            '12.0022,8.5919': 'Kano',
            '9.0820,7.5344': 'Wuse Market, Abuja'
        };

        const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
        return locations[key] || 'Nigeria';
    };

    return (
        <div
            onClick={onClick}
            style={{
                background: 'var(--color-surface)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: `1px solid ${getColor(alert.type)}15`
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-light)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-surface)'}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '13px',
                        letterSpacing: '0.5px'
                    }}>
                        {alert.type}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        • {formatTime(alert.timestamp)}
                    </span>
                </div>
            </div>

            {/* Description */}
            {alert.description && (
                <p style={{
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '12px'
                }}>
                    {alert.description}
                </p>
            )}

            {/* Media Preview */}
            {alert.evidence && (
                <div style={{
                    width: '100%',
                    height: '180px',
                    background: '#1a1d23',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {alert.evidence === 'photo' && (
                        <img
                            src={`https://picsum.photos/400/200?random=${alert.id}`}
                            alt="Alert evidence"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    )}
                    {alert.evidence === 'video' && (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1a1d23 0%, #24272f 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Video Evidence</span>
                        </div>
                    )}
                    {alert.evidence === 'voice' && (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #1a1d23 0%, #24272f 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Voice Note</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <MapPin size={14} />
                    <span>{getLocationName(alert.location.lat, alert.location.lng)}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600
                        }}
                    >
                        <ThumbsUp size={16} />
                        <span>{alert.upvotes}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600
                        }}
                    >
                        <ThumbsDown size={16} />
                        <span>{alert.downvotes}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
