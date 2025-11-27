export type AlertType = 'suspicious' | 'violence' | 'fire' | 'accident' | 'unknown' | 'other';

export interface Location {
  lat: number;
  lng: number;
}

export interface Alert {
  id: string;
  type: AlertType;
  location: Location;
  timestamp: number;
  description?: string;
  upvotes: number;
  downvotes: number;
  evidence?: string; // URL to image/video
  resolved: boolean;
}
