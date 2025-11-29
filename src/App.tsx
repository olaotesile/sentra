import { useState, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { CreateAlertSheet } from './components/CreateAlertSheet';
import { AlertFeed } from './components/AlertFeed';
import { AlertDetailView } from './components/AlertDetailView';
import { Sidebar } from './components/Sidebar';
import { LocationPermissionPrompt } from './components/LocationPermissionPrompt';
import { Toast } from './components/Toast';
import type { Alert, AlertType, Location } from './types';
import { supabase } from './lib/supabase';

function App() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch alerts from Supabase
  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
      } else if (data) {
        // Parse the location column (PostGIS returns GeoJSON-like object or we need to handle it)
        // Our SQL setup uses geography(point). Supabase JS client might return it as a string or object.
        // Let's assume for now we need to map it.
        // Actually, for simplicity in the SQL script I used geography(point).
        // To make it easy for the frontend, let's adjust the query or handle the response.
        // PostGIS points usually come back as GeoJSON if we ask, or WKB.
        // Let's use a simple RPC or just cast it in the select if possible.
        // Or better, let's update the fetch to use the RPC 'get_nearby_alerts' if available,
        // but for the main feed we might want all recent ones.
        // Let's try to fetch and see. For now, I'll map the raw data.
        // If the column is 'location', Supabase returns it as GeoJSON object by default for geography types.

        const mappedAlerts: Alert[] = data.map((item: any) => {
          // Handle PostGIS location format
          // If it's GeoJSON: { type: "Point", coordinates: [lng, lat] }
          let lat = 0;
          let lng = 0;
          if (item.location && item.location.coordinates) {
            lng = item.location.coordinates[0];
            lat = item.location.coordinates[1];
          }

          return {
            id: item.id,
            type: item.type as AlertType,
            location: { lat, lng },
            timestamp: item.timestamp,
            description: item.description,
            upvotes: item.upvotes,
            downvotes: item.downvotes,
            resolved: item.resolved,
            evidence: item.evidence,
            location_name: item.location_name
          };
        });
        setAlerts(mappedAlerts);
      }
    };

    fetchAlerts();

    // Real-time subscription
    const subscription = supabase
      .channel('alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newItem = payload.new as any;
          // Need to parse location again
          let lat = 0;
          let lng = 0;
          // Note: Realtime payload might differ for geography types.
          // Often it's better to refetch or just handle the basic fields.
          // For now, let's just refetch to be safe and simple.
          fetchAlerts();
        } else if (payload.eventType === 'UPDATE') {
          fetchAlerts();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    // Process media files
    if (evidenceFile) {
      try {
        if (evidenceFile.type.startsWith('image/')) {
          // Compress image to base64
          evidenceUrl = await compressImage(evidenceFile);
        } else if (evidenceFile.type.startsWith('video/') || evidenceFile.type.startsWith('audio/')) {
          // Convert video/audio to base64 for storage
          const reader = new FileReader();
          evidenceUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(evidenceFile);
          });
        }
      } catch (error) {
        console.error('Error processing media:', error);
        setToast({ message: 'Failed to process media file. Please try a smaller file.', type: 'error' });
        return;
      }
    }

    // Fetch location name using reverse geocoding (BigDataCloud API - no CORS issues)
    // Use a timeout to avoid blocking alert creation
    let locationName = 'Unknown Location';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation.lat}&longitude=${userLocation.lng}&localityLanguage=en`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Reverse geocoding response:', data);

        // Extract clean location name
        const parts = [];

        // Add locality (neighborhood/suburb)
        if (data.locality) parts.push(data.locality);

        // Add city
        if (data.city) parts.push(data.city);
        else if (data.principalSubdivision) parts.push(data.principalSubdivision);

        locationName = parts.length > 0 ? parts.join(', ') :
          (data.localityInfo?.administrative?.[3]?.name ||
            data.localityInfo?.administrative?.[2]?.name ||
            `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
      } else {
        console.error('Reverse geocoding failed:', response.status, response.statusText);
        locationName = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('Reverse geocoding timed out after 3 seconds');
      } else {
        console.error('Error fetching location name:', error);
      }
      locationName = `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`;
    }

    console.log('Saving alert with location_name:', locationName);

    const { error } = await supabase.from('alerts').insert({
      type,
      location: `POINT(${userLocation.lng} ${userLocation.lat})`, // PostGIS format
      timestamp: Date.now(),
      description,
      upvotes: 0,
      downvotes: 0,
      resolved: false,
      evidence: evidenceUrl,
      location_name: locationName
    });

    if (error) {
      console.error('Error creating alert:', error);
      setToast({ message: 'Failed to create alert. Please try again.', type: 'error' });
    } else {
      setToast({ message: 'Alert created successfully!', type: 'success' });
    }
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

      {/* Conditionally render MapComponent to save memory when creating alert */}
      {!isCreateOpen && (
        <MapComponent
          alerts={alerts}
          userLocation={userLocation}
        />
      )}

      {/* Show a placeholder background when map is hidden */}
      {isCreateOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#1a1f2e',
          zIndex: 0
        }} />
      )}

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
        onRefresh={() => {
          // Fetch alerts from Supabase
          supabase
            .from('alerts')
            .select('*')
            .order('timestamp', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.error('Error fetching alerts:', error);
              } else if (data) {
                const mappedAlerts: Alert[] = data.map((item: any) => {
                  let lat = 0;
                  let lng = 0;
                  if (item.location && item.location.coordinates) {
                    lng = item.location.coordinates[0];
                    lat = item.location.coordinates[1];
                  }
                  return {
                    id: item.id,
                    type: item.type as AlertType,
                    location: { lat, lng },
                    timestamp: item.timestamp,
                    description: item.description,
                    upvotes: item.upvotes,
                    downvotes: item.downvotes,
                    resolved: item.resolved,
                    evidence: item.evidence,
                    location_name: item.location_name
                  };
                });
                setAlerts(mappedAlerts);
              }
            });
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

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        isVisible={!!toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

export default App;
