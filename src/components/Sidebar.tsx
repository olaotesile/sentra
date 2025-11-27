import React from 'react';
import { X, ShieldAlert, HelpCircle, Mail, Info, ToggleRight } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 99,
                    animation: 'fadeIn 0.2s ease-out'
                }}
            />

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '70%',
                maxWidth: '300px',
                background: 'var(--color-surface)',
                zIndex: 100,
                padding: '24px',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
                animation: 'slideInFromRight 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert color="var(--color-danger)" size={24} />
                        <span style={{ fontWeight: 800, fontSize: '18px' }}>Sentra</span>
                    </div>
                    <button onClick={onClose} className="icon-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Settings Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        marginBottom: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Settings
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '14px' }}>Privacy Radius</label>
                            <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>500m</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0'
                    }}>
                        <span style={{ fontSize: '14px' }}>Satellite Map</span>
                        <ToggleRight size={24} color="var(--color-text-muted)" />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        padding: '12px 8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}>
                        <HelpCircle size={20} color="var(--color-text-muted)" />
                        How it works
                    </button>

                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        padding: '12px 8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}>
                        <Mail size={20} color="var(--color-text-muted)" />
                        Contact Support
                    </button>

                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        padding: '12px 8px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }}>
                        <Info size={20} color="var(--color-text-muted)" />
                        About Sentra
                    </button>
                </div>

                {/* Version */}
                <div style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)'
                }}>
                    Version 1.0.2
                </div>
            </div>
        </>
    );
};
