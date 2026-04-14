import { useState, useEffect, useRef } from 'react';
import { smoothValue } from '../utils/locationUtils';

export const useGeolocation = () => {
  const [location, setLocation] = useState(() => {
    // Try to recover last known location from localStorage
    const saved = localStorage.getItem('last_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // Ref to store the previous smoothed location
  const smoothedRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Check permission status if API is available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      });
    }

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      
      // Apply smoothing (EMA)
      const smoothLat = smoothValue(smoothedRef.current?.[0], latitude, 0.4);
      const smoothLng = smoothValue(smoothedRef.current?.[1], longitude, 0.4);
      
      const newLocation = [smoothLat, smoothLng];
      smoothedRef.current = newLocation;
      
      setLocation(newLocation);
      setAccuracy(acc);
      setLoading(false);
      
      // Save to localStorage for next session
      localStorage.setItem('last_location', JSON.stringify(newLocation));
    };

    const handleError = (err) => {
      // 1: Permission Denied, 2: Position Unavailable, 3: Timeout
      setError(err.message);
      setLoading(false);
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, accuracy, error, loading, permissionStatus };
};
