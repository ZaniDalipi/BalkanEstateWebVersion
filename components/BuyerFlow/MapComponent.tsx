import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Property } from '../../types';
import L from 'leaflet';

// Fix for default icon issue with bundlers
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


interface MapComponentProps {
  properties: Property[];
}

const ChangeView: React.FC<{center: [number, number], zoom: number}> = ({ center, zoom }) => {
    const map = useMap();
    if(map.getZoom() !== zoom || map.getCenter().lat !== center[0] || map.getCenter().lng !== center[1]) {
       map.setView(center, zoom);
    }
    return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ properties }) => {
  const center: [number, number] = properties.length > 0 ? [properties[0].lat, properties[0].lng] : [44.2, 19.9]; // Default center of Balkans
  const zoom = properties.length === 1 ? 13 : 7;
    
  return (
    <div className="absolute inset-0 z-0">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map(prop => (
          <Marker key={prop.id} position={[prop.lat, prop.lng]}>
            <Popup>
              <div className="w-48">
                 <img src={prop.imageUrl} alt={prop.address} className="w-full h-24 object-cover rounded-md mb-2" />
                 <p className="font-bold text-md leading-tight">€{prop.price.toLocaleString()}</p>
                 <p className="text-sm text-neutral-600 truncate">{prop.address}, {prop.city}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;