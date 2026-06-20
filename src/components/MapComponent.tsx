import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  lat: number;
  lon: number;
  city: string;
  onMapClick?: (lat: number, lon: number) => void;
}

const MapClickHandler: React.FC<{ onMapClick: (lat: number, lon: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

// Helper component to change map view when coordinates change
const MapUpdater: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    // 딱딱하게 바로 이동하는 대신, 새 도시로 부드럽게 날아가도록(flyTo) 변경합니다!
    map.flyTo([lat, lon], map.getZoom(), {
      animate: true,
      duration: 1.5
    });
  }, [lat, lon, map]);
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ lat, lon, city, onMapClick }) => {
  return (
    <div className="glass-panel animate-fade-in" style={styles.container}>
      <h3 style={styles.title}>{city} 위치 (지도를 클릭해 지역 변경)</h3>
      <div style={styles.mapWrapper}>
        <MapContainer center={[lat, lon]} zoom={11} scrollWheelZoom={false} style={styles.map} className="cursor-crosshair">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lon]}>
            <Popup>
              {city}
            </Popup>
          </Marker>
          <MapUpdater lat={lat} lon={lon} />
          {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
        </MapContainer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto 2rem',
    padding: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    opacity: 0.9,
    color: 'white',
  },
  mapWrapper: {
    height: '250px',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
  },
  map: {
    height: '100%',
    width: '100%',
  }
};

export default MapComponent;
