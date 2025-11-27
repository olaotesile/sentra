import React, { useState } from 'react';
import { X, Camera, Video, Mic, MapPin } from 'lucide-react';
import type { AlertType } from '../types';

interface CreateAlertSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: AlertType, description: string) => void;
}

const ALERT_TYPES: { type: AlertType; label: string }[] = [
    { type: 'suspicious', label: 'Suspicious' },
    { type: 'violence', label: 'Violence' },
    { type: 'fire', label: 'Fire' },
    { type: 'accident', label: 'Accident' },
    { type: 'unknown', label: 'Unknown' },
    { type: 'other', label: 'Other' },
];

export const CreateAlertSheet: React.FC<CreateAlertSheetProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedType, setSelectedType] = useState<AlertType | null>(null);
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedType) {
            onSubmit(selectedType, description);
            setSelectedType(null);
            setDescription('');
            onClose();
        }
    };

    return (
        <div className="animate-slide-up" style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#1a1f2e',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            zIndex: 'var(--z-modal)',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            color: 'white'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Create New Alert</h2>
                <button
                    onClick={onClose}
                    className="icon-btn"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                paddingBottom: '20px' // Add some padding at the bottom of scroll area
            }}>
                {/* Alert Type Selection */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        Select Alert Type
                    </label>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                    }}>
                        {ALERT_TYPES.map((item) => (
                            <button
                                key={item.type}
                                onClick={() => setSelectedType(item.type)}
                                style={{
                                    background: selectedType === item.type ? '#f4212e' : 'rgba(255,255,255,0.1)',
                                    border: selectedType === item.type ? '2px solid #f4212e' : '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '12px 8px',
                                    borderRadius: '24px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontSize: '14px'
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Evidence Section */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        Add Evidence <span style={{ color: '#888' }}>(Optional)</span>
                    </label>

                    {/* Description Text Area */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what's happening..."
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '16px',
                            padding: '16px',
                            color: 'white',
                            fontFamily: 'inherit',
                            resize: 'none',
                            height: '120px',
                            fontSize: '15px',
                            marginBottom: '12px'
                        }}
                    />

                    {/* Media Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="icon-btn"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                gap: '8px',
                                flex: 1,
                                fontSize: '14px'
                            }}
                        >
                            <Camera size={20} /> Photo
                        </button>
                        <button
                            className="icon-btn"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                gap: '8px',
                                flex: 1,
                                fontSize: '14px'
                            }}
                        >
                            <Video size={20} /> Video
                        </button>
                        <button
                            className="icon-btn"
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                gap: '8px',
                                flex: 1,
                                fontSize: '14px'
                            }}
                        >
                            <Mic size={20} /> Voice
                        </button>
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        Location
                    </label>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        padding: '12px 16px',
                        borderRadius: '12px'
                    }}>
                        <MapPin size={20} color="#ef4444" />
                        <span style={{ fontSize: '14px', color: '#ffffff' }}>123 Main St, Anytown, USA</span>
                    </div>
                </div>
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div style={{ paddingTop: '10px', flexShrink: 0 }}>
                <button
                    style={{
                        width: '100%',
                        background: '#f4212e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 700,
                        cursor: selectedType ? 'pointer' : 'not-allowed',
                        opacity: selectedType ? 1 : 0.5,
                    }}
                    disabled={!selectedType}
                    onClick={handleSubmit}
                >
                    Submit Alert
                </button>
            </div>
        </div>
    );
};
