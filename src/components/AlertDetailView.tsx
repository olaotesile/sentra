import React, { useState } from 'react';
import { X, MapPin, Clock, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import type { Alert } from '../types';

interface AlertDetailViewProps {
    alert: Alert | null;
    onClose: () => void;
    onVote?: (alertId: string, voteType: 'up' | 'down') => void;
    onResolve?: (alertId: string) => void;
}

export const AlertDetailView: React.FC<AlertDetailViewProps> = ({ alert, onClose, onVote, onResolve }) => {
    const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
    const [voteCount, setVoteCount] = useState({ up: alert?.upvotes || 0, down: alert?.downvotes || 0 });

    if (!alert) return null;

    const formatTime = (timestamp: number) => {
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 60) return `${minutes} mins ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hrs ago`;
        return '1 day ago';
    };

    const handleVote = (voteType: 'up' | 'down') => {
        if (userVote === voteType) {
            // Removing vote
            setVoteCount(prev => ({
                ...prev,
                [voteType === 'up' ? 'up' : 'down']: prev[voteType === 'up' ? 'up' : 'down'] - 1
            }));
            setUserVote(null);
        } else if (userVote) {
            // Switching vote
            setVoteCount(prev => ({
                up: voteType === 'up' ? prev.up + 1 : prev.up - 1,
                down: voteType === 'down' ? prev.down + 1 : prev.down - 1
            }));
            setUserVote(voteType);
        } else {
            // New vote
            setVoteCount(prev => ({
                ...prev,
                [voteType === 'up' ? 'up' : 'down']: prev[voteType === 'up' ? 'up' : 'down'] + 1
            }));
            setUserVote(voteType);
        }

        if (onVote) {
            onVote(alert.id, voteType);
        }
    };

    const handleResolve = () => {
        if (onResolve) {
            onResolve(alert.id);
        }
    };

    const credibility = Math.round((voteCount.up / (voteCount.up + voteCount.down + 1)) * 100);
    const locationName = alert.location_name || `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`;

    return (
        <div className="animate-slide-up" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-bg)',
            zIndex: 100,
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid var(--color-border)',
                position: 'sticky',
                top: 0,
                background: 'var(--color-bg)',
                zIndex: 10
            }}>
                <button onClick={onClose} className="icon-btn">
                    <X size={24} />
                </button>
                <h2 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {alert.type} Activity
                </h2>
            </div>

            {/* Evidence - At top */}
            <div style={{ padding: '0 20px 20px' }}>
                <div style={{
                    width: '100%',
                    height: '300px',
                    background: 'linear-gradient(to bottom, #434343 0%, black 100%)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginTop: '16px'
                }}>
                    <img
                        src={`https://picsum.photos/400/300?random=${alert.id}`}
                        alt="Evidence"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '0 20px 20px' }}>
                {/* Title and Location */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textTransform: 'capitalize' }}>
                        {alert.type} Activity
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
                        {locationName}
                    </p>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="var(--color-text-muted)" />
                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Nearby</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>location</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--color-text-muted)" />
                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{formatTime(alert.timestamp)}</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ago</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ThumbsUp size={16} color="var(--color-success)" />
                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--color-success)' }}>{credibility}%</div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Credible</div>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Details</h4>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6', fontSize: '14px' }}>
                        {alert.description || 'No details provided. Community members reported this activity.'}
                    </p>
                </div>

                {/* Is this helpful? */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Is this helpful?</h4>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <button
                            onClick={() => handleVote('up')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: userVote === 'up' ? 'var(--color-success)' : 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px',
                                transition: 'color 0.2s, transform 0.1s',
                                transform: userVote === 'up' ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <ThumbsUp size={22} fill={userVote === 'up' ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            <span style={{ fontWeight: 700 }}>{voteCount.up}</span>
                        </button>
                        <button
                            onClick={() => handleVote('down')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: userVote === 'down' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '4px',
                                transition: 'color 0.2s, transform 0.1s',
                                transform: userVote === 'down' ? 'scale(1.1)' : 'scale(1)'
                            }}
                        >
                            <ThumbsDown size={22} fill={userVote === 'down' ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            <span style={{ fontWeight: 700 }}>{voteCount.down}</span>
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: '32px' }}>
                    <button
                        onClick={handleResolve}
                        disabled={alert.resolved}
                        style={{
                            width: '100%',
                            background: alert.resolved ? 'var(--color-text-muted)' : 'var(--color-success)',
                            border: 'none',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '15px',
                            cursor: alert.resolved ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: alert.resolved ? 0.6 : 1
                        }}
                    >
                        <CheckCircle size={20} />
                        {alert.resolved ? 'Resolved' : 'Mark as Resolved'}
                    </button>
                </div>
            </div>
        </div>
    );
};
