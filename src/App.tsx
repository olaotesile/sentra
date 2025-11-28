import { useState, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { CreateAlertSheet } from './components/CreateAlertSheet';
import { AlertFeed } from './components/AlertFeed';
import { AlertDetailView } from './components/AlertDetailView';
import { Sidebar } from './components/Sidebar';
import { LocationPermissionPrompt } from './components/LocationPermissionPrompt';
import type { Alert, AlertType, Location } from './types';

// Mock Data with evidence field - Realistic Nigerian demo alerts
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'violence',
    location: { lat: 10.5225, lng: 7.4388 }, // Kaduna
    timestamp: Date.now() - 1000 * 60 * 12,
    description: 'Armed bandits spotted near village outskirts. Residents advised to stay indoors.',
    upvotes: 34,
    downvotes: 1,
    resolved: false,
    evidence: 'video'
  },
  {
    id: '2',
    type: 'violence',
    location: { lat: 11.9974, lng: 8.5218 }, // Kano
    timestamp: Date.now() - 1000 * 60 * 28,
    description: 'Reports of kidnapping attempt on Zaria-Kano road. Vehicle abandoned.',
    upvotes: 42,
    downvotes: 2,
    resolved: false,
    evidence: 'photo'
  },
  {
    id: '3',
    type: 'accident',
    location: { lat: 6.4645, lng: 3.3792 }, // Third Mainland Bridge, Lagos
    timestamp: Date.now() - 1000 * 60 * 8,
    description: 'Hit and run accident on Third Mainland Bridge. Driver fled scene heading towards Oworonsoki.',
    upvotes: 28,
    downvotes: 0,
    resolved: false,
    evidence: 'video'
  },
  {
    id: '4',
    type: 'suspicious',
    location: { lat: 6.5244, lng: 3.3792 }, // Ikeja, Lagos
    timestamp: Date.now() - 1000 * 60 * 18,
    description: 'Suspicious individuals monitoring parked vehicles at Allen Avenue. Multiple cars targeted.',
    upvotes: 15,
    downvotes: 3,
    resolved: false,
    evidence: 'photo'
  },
  {
    id: '5',
    type: 'violence',
    location: { lat: 9.0579, lng: 7.4951 }, // Abuja
    timestamp: Date.now() - 1000 * 60 * 45,
    description: 'Armed robbery at Gwarinpa shopping complex. Suspects fled on motorcycles.',
    upvotes: 38,
    downvotes: 1,
    resolved: true,
    evidence: 'video'
  },
  {
    id: '6',
    type: 'accident',
    location: { lat: 6.4281, lng: 3.4219 }, // Lekki, Lagos
    timestamp: Date.now() - 1000 * 60 * 35,
    description: 'Multi-vehicle collision on Lekki-Epe Expressway near Ajah. Traffic heavily backed up.',
    upvotes: 22,
    downvotes: 0,
    resolved: true,
    evidence: 'photo'
  },
  {
    id: '7',
    type: 'violence',
    location: { lat: 10.3158, lng: 7.7318 }, // Kaduna-Abuja road
    timestamp: Date.now() - 1000 * 60 * 52,
    description: 'Bandits blocking Kaduna-Abuja expressway. Multiple vehicles stopped. Avoid route.',
    upvotes: 51,
    downvotes: 0,
    resolved: true,
    evidence: 'voice'
  },
  {
    id: '8',
    type: 'fire',
    location: { lat: 6.5095, lng: 3.3711 }, // Lagos Island
    timestamp: Date.now() - 1000 * 60 * 78,
    description: 'Market fire outbreak at Balogun Market. Fire service on site.',
    upvotes: 19,
    downvotes: 2,
    resolved: true,
    evidence: 'video'
  },
  {
    id: '9',
    type: 'suspicious',
    location: { lat: 7.3775, lng: 3.9470 }, // Ibadan
    timestamp: Date.now() - 1000 * 60 * 92,
    description: 'Unidentified persons loitering around ATM points at Bodija. Possible card skimming.',
    upvotes: 12,
    downvotes: 4,
    resolved: false,
    evidence: 'photo'
  },
  {
    id: '10',
    type: 'violence',
    location: { lat: 6.6018, lng: 3.3515 }, // Surulere, Lagos
    timestamp: Date.now() - 1000 * 60 * 105,
    description: 'Gang clash at Aguda area. Gunshots heard. Residents taking cover.',
    upvotes: 29,
    downvotes: 1,
    resolved: true,
    evidence: 'voice'
  },
  {
    id: '11',
    type: 'accident',
    location: { lat: 6.4474, lng: 3.4700 }, // Victoria Island, Lagos
    timestamp: Date.now() - 1000 * 60 * 125,
    description: 'Petroleum tanker overturned at Ozumba Mbadiwe. Fuel spill. Area evacuated.',
    upvotes: 45,
    downvotes: 0,
    resolved: true,
    evidence: 'video'
  },
  {
    id: '12',
    type: 'violence',
    location: { lat: 12.0022, lng: 8.5919 }, // Kano North
    timestamp: Date.now() - 1000 * 60 * 158,
    description: 'Suspected cattle rustlers spotted near farmlands. Vigilante group alerted.',
    upvotes: 17,
    downvotes: 2,
    resolved: true,
    evidence: 'voice'
  },
  {
    id: '13',
    type: 'fire',
    location: { lat: 9.0820, lng: 7.5344 }, // Abuja Central
    timestamp: Date.now() - 1000 * 60 * 142,
    description: 'Electrical fire at Wuse Market. Shops affected. NEMA responding.',
    upvotes: 14,
    downvotes: 1,
    resolved: true,
    evidence: 'photo'
  }
];


function App() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  useEffect(() => {
    // Only start tracking location after permission is granted
    if (!locationPermissionGranted) return;

    // Track user location continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location", error);
        // Only fallback if we don't have a location yet
        setUserLocation(prev => prev || { lat: 6.5244, lng: 3.3792 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationPermissionGranted]);

  const handleAllowLocation = () => {
    setShowLocationPrompt(false);
    setLocationPermissionGranted(true);
  };

  const handleDenyLocation = () => {
    setShowLocationPrompt(false);
    // Set fallback location
    setUserLocation({ lat: 6.5244, lng: 3.3792 });
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 1200px)
          const maxSize = 1200;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCreateAlert = async (type: AlertType, description: string, evidenceFile: File | null) => {
    if (!userLocation) return;

    let evidenceUrl: string | undefined = undefined;

    // Only process image files to prevent memory issues
    if (evidenceFile && evidenceFile.type.startsWith('image/')) {
      try {
        // Compress image to base64 to avoid blob URL memory leaks
        evidenceUrl = await compressImage(evidenceFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Failed to process image. Please try a smaller file.');
        return;
      }
    }
    // For videos and audio, just use a placeholder to avoid memory issues
    else if (evidenceFile) {
      evidenceUrl = 'media_attached';
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.002,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.002
      },
      timestamp: Date.now(),
      description,
      upvotes: 0,
      downvotes: 0,
      resolved: false,
      evidence: evidenceUrl
    };

    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleVote = (alertId: string, voteType: 'up' | 'down') => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          upvotes: voteType === 'up' ? alert.upvotes + 1 : alert.upvotes,
          downvotes: voteType === 'down' ? alert.downvotes + 1 : alert.downvotes
        };
      }
      return alert;
    }));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        const updatedAlert = { ...alert, resolved: true };
        // Also update the selected alert if it matches
        if (selectedAlert?.id === alertId) {
          setSelectedAlert(updatedAlert);
        }
        return updatedAlert;
      }
      return alert;
    }));
  };

  return (
    <div className="app">
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

      <MapComponent userLocation={userLocation} alerts={alerts} />

      <BottomBar
        onCreateClick={() => setIsCreateOpen(true)}
        onFeedClick={() => setIsFeedOpen(true)}
      />

      <CreateAlertSheet
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateAlert}
        userLocation={userLocation}
      />

      <AlertFeed
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
        alerts={alerts}
        onAlertClick={(alert) => {
          setSelectedAlert(alert);
          setIsFeedOpen(false);
        }}
      />

      <AlertDetailView
        alert={selectedAlert}
        onClose={() => {
          setSelectedAlert(null);
          setIsFeedOpen(true);
        }}
        onVote={handleVote}
        onResolve={handleResolve}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <LocationPermissionPrompt
        isOpen={showLocationPrompt}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />
    </div>
  );
}

export default App;
