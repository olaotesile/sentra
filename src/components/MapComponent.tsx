import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Alert, Location } from '../types';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerIconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

interface MapComponentProps {
    userLocation: Location | null;
    alerts: Alert[];
}

const getMarkerColor = (type: string) => {
    switch (type) {
        case 'violence':
        case 'fire': return '#f4212e';
        case 'suspicious':
        case 'unknown': return '#ffd400';
        case 'accident': return '#f97316';
        default: return '#1d9bf0';
    }
};

const getThreatLevel = (type: string): { color: string; opacity: number } => {
    switch (type) {
        case 'violence':
        case 'fire':
            return { color: '#f4212e', opacity: 0.3 }; // Red - high threat
        case 'accident':
            return { color: '#f97316', opacity: 0.25 }; // Orange - medium threat
        case 'suspicious':
        case 'unknown':
            return { color: '#ffd400', opacity: 0.2 }; // Yellow - low threat
        default:
            return { color: '#00ba7c', opacity: 0.15 }; // Green - safe
    }
};

const createCustomIcon = (type: string) => {
    const color = getMarkerColor(type);
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px ${color};
    "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, alerts }) => {
    const mapRef = React.useRef<L.Map | null>(null);

    const handleRecenter = () => {
        if (mapRef.current && userLocation) {
            mapRef.current.flyTo([userLocation.lat, userLocation.lng], 15);
        }
    };

    return (
        <>
            <MapContainer
                center={userLocation ? [userLocation.lat, userLocation.lng] : [0, 0]}
                zoom={userLocation ? 15 : 2}
                zoomControl={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    maxZoom={20}
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                    maxZoom={20}
                    zIndex={10}
                />

                {/* Threat zone circles */}
                {alerts.map(alert => {
                    const threat = getThreatLevel(alert.type);
                    return (
                        <Circle
                            key={`zone-${alert.id}`}
                            center={[alert.location.lat, alert.location.lng]}
                            radius={300} // 300 meter radius
                            pathOptions={{
                                fillColor: threat.color,
                                fillOpacity: threat.opacity,
                                color: threat.color,
                                weight: 1,
                                opacity: 0.4
                            }}
                        />
                    );
                })}

                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={L.divIcon({
                            className: 'user-marker',
                            html: `<div style="
                background-color: #1d9bf0;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 15px #1d9bf0;
              "></div>`,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })}
                    />
                )}

                {alerts.map(alert => (
                    <Marker
                        key={alert.id}
                        position={[alert.location.lat, alert.location.lng]}
                        icon={createCustomIcon(alert.type)}
                    >
                        <Popup>
                            <div style={{ color: '#0f1419' }}>
                                <strong>{alert.type.toUpperCase()}</strong>
                                <p>{alert.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {userLocation && (
                <button
                    onClick={handleRecenter}
                    style={{
                        position: 'absolute',
                        bottom: '120px',
                        right: '20px',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'var(--color-surface)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 'var(--z-overlay)',
                        color: 'var(--color-primary)'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4m0 12v4M4 12h4m12 0h-4" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            )}
        </>
    );
};
