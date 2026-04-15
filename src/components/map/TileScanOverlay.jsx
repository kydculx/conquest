import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const getHexagonCoords = (lat, lng, radius) => {
  const coords = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    coords.push([
      lat + radius * Math.cos(angle),
      lng + radius * Math.sin(angle)
    ]);
  }
  coords.push(coords[0]);
  return coords;
};

const TileScanOverlay = ({ tile, isCapturing, teamColor }) => {
  const map = useMap();
  const layerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!tile || !map) return;

    const removeLayer = () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    removeLayer();

    if (!isCapturing) return;

    const bounds = tile.bounds;
    const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
    const centerLng = (bounds[0][1] + bounds[1][1]) / 2;
    const radius = (bounds[1][0] - bounds[0][0]) / 2 * 1.1;

    const hexCoords = getHexagonCoords(centerLat, centerLng, radius);
    const teamColorValue = teamColor === 'blue' ? '#00f0ff' : '#ff1744';
    const enemyColor = teamColor === 'blue' ? '#ff1744' : '#00f0ff';
    
    layerRef.current = L.polygon(hexCoords, {
      color: 'transparent',
      weight: 0,
      fillOpacity: 0.3,
      fillColor: teamColorValue
    }).addTo(map);

    let frame = 0;
    const animate = () => {
      frame += 1;
      
      const step = Math.floor(frame / 15) % 2;
      const currentColor = step === 0 ? teamColorValue : enemyColor;
      const opacity = step === 0 ? 0.35 : 0.15;
      
      layerRef.current.setStyle({
        fillColor: currentColor,
        fillOpacity: opacity
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return removeLayer;
  }, [tile, isCapturing, map, teamColor]);

  return null;
};

export default TileScanOverlay;
