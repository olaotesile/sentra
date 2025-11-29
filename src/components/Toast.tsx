import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-hide after 3 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className="animate-slide-up"
            style={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                minWidth: '300px',
                maxWidth: '90vw'
            }}
        >
            {type === 'success' ? (
                <CheckCircle size={24} strokeWidth={2.5} />
            ) : (
                <XCircle size={24} strokeWidth={2.5} />
            )}
            <span style={{ fontSize: '15px', fontWeight: 600, flex: 1 }}>
                {message}
            </span>
        </div>
    );
};
