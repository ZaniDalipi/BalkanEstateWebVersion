import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Property } from '../../types';
import L from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';


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

const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

type TileLayerType = keyof typeof TILE_LAYERS;

interface MapComponentProps {
  properties: Property[];
  recenter: boolean;
  onMapMove: (bounds: L.LatLngBounds) => void;
}

const ChangeView: React.FC<{center: [number, number], zoom: number, enabled: boolean}> = ({ center, zoom, enabled }) => {
    const map = useMap();
    useEffect(() => {
        // Only set view if the map should be recentered, preventing conflicts with user interaction.
        if (enabled) {
           map.setView(center, zoom);
        }
    }, [center, zoom, enabled, map]);
    return null;
}

const MapEvents: React.FC<{ onMove: (bounds: L.LatLngBounds) => void }> = ({ onMove }) => {
    const map = useMapEvents({
        load: () => {
            onMove(map.getBounds());
        },
        moveend: () => {
            onMove(map.getBounds());
        },
    });
    return null;
};

const formatMarkerPrice = (price: number): string => {
    if (price >= 1000000) {
        return `€${(price / 1000000).toFixed(1).replace('.0', '')}M`;
    }
    if (price >= 1000) {
        return `€${Math.round(price / 1000)}K`;
    }
    return `€${price}`;
};

const PROPERTY_TYPE_COLORS: Record<NonNullable<Property['propertyType']> | 'other', string> = {
    house: '#0252CD',    // primary blue
    apartment: '#28a745', // green
    villa: '#6f42c1',     // purple
    other: '#6c757d',     // grey
};

const createCustomMarkerIcon = (property: Property) => {
    const price = formatMarkerPrice(property.price);
    const type = property.propertyType || 'other';
    const color = PROPERTY_TYPE_COLORS[type] || PROPERTY_TYPE_COLORS.other;

    const svgHtml = `
        <svg width="70" height="56" viewBox="0 0 70 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));">
            <path d="M35 56L25 44H45L35 56Z" fill="#003A96" />
            <path d="M65 24.5V44H5V24.5L35 5L65 24.5Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" />
            <text x="35" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;
    
    return L.divIcon({
        html: svgHtml,
        className: '', // Important to be empty for custom SVG styling to work
        iconSize: [70, 56],
        iconAnchor: [35, 56], // Anchor at the tip of the pointer
    });
};


const MapComponent: React.FC<MapComponentProps> = ({ properties, recenter, onMapMove }) => {
  const { dispatch } = useAppContext();
  const [tileLayer, setTileLayer] = useState<TileLayerType>('street');
  const center: [number, number] = properties.length > 0 ? [properties[0].lat, properties[0].lng] : [44.2, 19.9]; // Default center of Balkans
  const zoom = properties.length === 1 ? 13 : 7;
    
  const handlePopupClick = (property: Property) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
  };

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <ChangeView center={center} zoom={zoom} enabled={recenter} />
        <MapEvents onMove={onMapMove} />
        <TileLayer
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        {properties.map(prop => (
          <Marker key={prop.id} position={[prop.lat, prop.lng]} icon={createCustomMarkerIcon(prop)}>
            <Popup>
              <div 
                className="w-48 cursor-pointer"
                onClick={() => handlePopupClick(prop)}
              >
                <img src={prop.imageUrl} alt={prop.address} className="w-full h-24 object-cover rounded-md mb-2" />
                <p className="font-bold text-md leading-tight">{formatPrice(prop.price, prop.country)}</p>
                <p className="text-sm text-neutral-600 truncate">{prop.address}, {prop.city}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg flex space-x-1 border border-neutral-200">
        <button 
          onClick={() => setTileLayer('street')} 
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'street' ? 'bg-primary text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          Street
        </button>
        <button 
          onClick={() => setTileLayer('satellite')} 
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${tileLayer === 'satellite' ? 'bg-primary text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
};

export default MapComponent;