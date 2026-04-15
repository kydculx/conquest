import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_CONFIG } from '../../constants';

const MapUpdater = ({ center, recenterTrigger }) => {
  const map = useMap();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (center && isFirstLoad.current) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
      isFirstLoad.current = false;
    }
  }, [center, map]);

  useEffect(() => {
    if (center && recenterTrigger > 0) {
      map.flyTo(center, MAP_CONFIG.DEFAULT_ZOOM, { animate: true, duration: MAP_CONFIG.FLY_DURATION });
    }
  }, [recenterTrigger, center, map]);

  return null;
};

export default MapUpdater;
