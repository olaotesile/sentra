import React from 'react';
import { MapPin, Info } from 'lucide-react';

interface LocationPermissionPromptProps {
    isOpen: boolean;
    onAllow: () => void;
    onDeny: () => void;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({ isOpen, onAllow, onDeny }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                zIndex: 'var(--z-modal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                {/* Modal */}
                <div className="animate-fade-in" style={{
                    background: '#1a1f2e',
                    borderRadius: '24px',
                    padding: '32px 24px',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    color: 'white'
                }}>
                    {/* Icon */}
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(29, 155, 240, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}>
                        <MapPin size={28} color="#1d9bf0" />
                    </div>

                    {/* Content */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: 700,
                            marginBottom: '12px',
                            color: '#ffffff'
                        }}>
                            Enable Location
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            lineHeight: '1.5',
                            color: '#8b92a6',
                            marginBottom: '8px'
                        }}>
                            Sentra needs your exact location to work.
                        </p>
                        <button
                            onClick={() => {
                                // This would open a modal explaining location usage
                                alert('Sentra uses your location to:\n\n• Show nearby safety alerts\n• Place your alerts accurately\n• Help others in your area\n\nYour location is only used within the app and is not shared with third parties.');
                            }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#1d9bf0',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Info size={16} />
                            See how your location is used
                        </button>
                    </div>

                    {/* Buttons */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <button
                            onClick={onAllow}
                            style={{
                                width: '100%',
                                background: '#1d9bf0',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Allow Location
                        </button>
                        <button
                            onClick={onDeny}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
