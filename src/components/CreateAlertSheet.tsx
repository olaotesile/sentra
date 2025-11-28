import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Video, Mic, MapPin, Check, Trash2, Upload, Play, Square } from 'lucide-react';
import type { AlertType, Location } from '../types';

interface CreateAlertSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: AlertType, description: string, evidence: File | null) => void;
    userLocation: Location | null;
}

const ALERT_TYPES: { type: AlertType; label: string }[] = [
    { type: 'suspicious', label: 'Suspicious' },
    { type: 'violence', label: 'Violence' },
    { type: 'fire', label: 'Fire' },
    { type: 'accident', label: 'Accident' },
    { type: 'unknown', label: 'Unknown' },
    { type: 'other', label: 'Other' },
];

export const CreateAlertSheet: React.FC<CreateAlertSheetProps> = ({ isOpen, onClose, onSubmit, userLocation }) => {
    const [selectedType, setSelectedType] = useState<AlertType | null>(null);
    const [description, setDescription] = useState('');
    const [evidence, setEvidence] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>('Fetching location...');

    const photoInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

    // Fetch location name when user location changes
    useEffect(() => {
        if (userLocation && isOpen) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`)
                .then(res => res.json())
                .then(data => {
                    const name = data.display_name || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
                    setLocationName(name);
                })
                .catch(() => {
                    setLocationName(`${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
                });
        }
    }, [userLocation, isOpen]);

    // Cleanup audio URLs on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selectedType) {
            onSubmit(selectedType, description, evidence);
            setSelectedType(null);
            setDescription('');
            setEvidence(null);
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
                setAudioURL(null);
            }
            onClose();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            // Prevent any default form submission behavior
            e.preventDefault();
            e.stopPropagation();

            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];

                // Check file size (limit to 10MB to prevent memory issues)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    alert('File is too large. Please choose a file smaller than 10MB.');
                    e.target.value = '';
                    return;
                }

                // Clean up old audio URL if it exists
                if (audioURL) {
                    URL.revokeObjectURL(audioURL);
                    setAudioURL(null);
                }

                setEvidence(file);
            }
            // Reset the input value to allow selecting the same file again
            e.target.value = '';
        } catch (error) {
            console.error("Error selecting file:", error);
            alert("An error occurred while selecting the file.");
        }
    };

    const handleVoiceRecord = async () => {
        if (isRecording) {
            // Stop recording
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                    const audioFile = new File([audioBlob], "voice_note.wav", { type: "audio/wav" });
                    const url = URL.createObjectURL(audioBlob);

                    // Revoke old URL if exists
                    if (audioURL) {
                        URL.revokeObjectURL(audioURL);
                    }

                    setAudioURL(url);
                    setEvidence(audioFile);

                    // Stop all tracks
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('Unable to access microphone. Please grant permission.');
            }
        }
    };

    const handlePlayAudio = () => {
        if (audioURL && audioPlayerRef.current) {
            audioPlayerRef.current.play();
        }
    };

    return (
        <div className="animate-slide-up" style={{
            position: 'fixed',
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
            {/* Hidden Inputs */}
            <input
                type="file"
                accept="image/*"
                ref={photoInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <input
                type="file"
                accept="video/*"
                ref={videoInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
            <audio ref={audioPlayerRef} src={audioURL || undefined} style={{ display: 'none' }} />

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
                paddingBottom: '20px'
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

                    {/* Media Buttons Row 1 */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <button
                            className="icon-btn"
                            onClick={() => photoInputRef.current?.click()}
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
                            onClick={() => videoInputRef.current?.click()}
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
                    </div>

                    {/* Media Buttons Row 2 */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="icon-btn"
                            onClick={() => fileInputRef.current?.click()}
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
                            <Upload size={20} /> Upload
                        </button>
                        <button
                            className="icon-btn"
                            onClick={handleVoiceRecord}
                            style={{
                                background: isRecording ? 'rgba(244, 33, 46, 0.2)' : 'rgba(255,255,255,0.08)',
                                color: isRecording ? '#f4212e' : 'white',
                                padding: '12px',
                                borderRadius: '12px',
                                gap: '8px',
                                flex: 1,
                                fontSize: '14px',
                                border: isRecording ? '1px solid #f4212e' : 'none'
                            }}
                        >
                            {isRecording ? <><Square size={20} /> Stop</> : <><Mic size={20} /> Voice</>}
                        </button>
                    </div>

                    {/* Evidence Preview */}
                    {evidence && (
                        <div style={{
                            marginTop: '12px',
                            background: 'rgba(29, 155, 240, 0.1)',
                            border: '1px solid rgba(29, 155, 240, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <Check size={16} color="#1d9bf0" />
                                <span style={{ fontSize: '14px', color: '#1d9bf0' }}>
                                    {evidence.name}
                                </span>
                                {audioURL && (
                                    <button
                                        onClick={handlePlayAudio}
                                        style={{
                                            background: 'rgba(29, 155, 240, 0.2)',
                                            border: '1px solid #1d9bf0',
                                            borderRadius: '8px',
                                            padding: '4px 12px',
                                            color: '#1d9bf0',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginLeft: '8px'
                                        }}
                                    >
                                        <Play size={12} /> Play
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setEvidence(null);
                                    if (audioURL) {
                                        URL.revokeObjectURL(audioURL);
                                        setAudioURL(null);
                                    }
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f4212e' }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
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
                        alignItems: 'flex-start',
                        gap: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        padding: '12px 16px',
                        borderRadius: '12px'
                    }}>
                        <MapPin size={20} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>
                                {userLocation
                                    ? `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
                                    : 'Locating...'}
                            </div>
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                                {locationName}
                            </div>
                        </div>
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
