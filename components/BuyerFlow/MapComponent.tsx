import React, { useState, useEffect, useMemo } from 'react';
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
  userLocation: [number, number] | null;
  isSearchActive: boolean;
  searchLocation: [number, number] | null;
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
    const map = useMap();

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            // Use a timeout to ensure the map container has finished resizing
            // before invalidating the map size. This is a robust way to handle
            // containers that are conditionally shown/hidden or resized.
            setTimeout(() => {
                map.invalidateSize();
            }, 0);
        });

        const mapContainer = map.getContainer();
        resizeObserver.observe(mapContainer);
        
        // Cleanup observer on component unmount
        return () => {
            resizeObserver.unobserve(mapContainer);
        };
    }, [map]);

    useMapEvents({
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

const ZOOM_THRESHOLD = 12;

const createSimpleMarkerIcon = (property: Property) => {
    const price = formatMarkerPrice(property.price);
    const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

    const svgHtml = `
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
            <circle cx="20" cy="20" r="18" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
            <text x="20" y="21" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;
    
    return L.divIcon({
        html: svgHtml,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

const createDetailedMarkerIcon = (property: Property) => {
    const price = formatMarkerPrice(property.price);
    const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

    const svgHtml = `
        <svg width="60" height="48" viewBox="0 0 70 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)); transform-origin: bottom center;">
            <path d="M35 56L25 44H45L35 56Z" fill="#003A96" />
            <path d="M65 24.5V44H5V24.5L35 5L65 24.5Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" />
            <text x="35" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;
    
    return L.divIcon({
        html: svgHtml,
        className: '',
        iconSize: [60, 48],
        iconAnchor: [30, 48],
        popupAnchor: [0, -48]
    });
};

const createCustomMarkerIcon = (property: Property, zoom: number): L.DivIcon => {
    if (zoom < ZOOM_THRESHOLD) {
        return createSimpleMarkerIcon(property);
    }
    return createDetailedMarkerIcon(property);
};

interface MarkersProps {
    properties: Property[];
    onPopupClick: (id: string) => void;
}

const Markers: React.FC<MarkersProps> = ({ properties, onPopupClick }) => {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());

    useMapEvents({
        zoomend: () => {
            setZoom(map.getZoom());
        },
    });

    return (
        <>
            {properties.map(prop => (
                <Marker key={prop.id} position={[prop.lat, prop.lng]} icon={createCustomMarkerIcon(prop, zoom)}>
                    <Popup>
                        <div 
                            className="w-48 cursor-pointer"
                            onClick={() => onPopupClick(prop.id)}
                        >
                            <img src={prop.imageUrl} alt={prop.address} className="w-full h-24 object-cover rounded-md mb-2" />
                            <p className="font-bold text-md leading-tight">{formatPrice(prop.price, prop.country)}</p>
                            <p className="text-sm text-neutral-600 truncate">{prop.address}, {prop.city}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

const MapComponent: React.FC<MapComponentProps> = ({ properties, recenter, onMapMove, userLocation, isSearchActive, searchLocation }) => {
  const { dispatch } = useAppContext();
  const [tileLayer, setTileLayer] = useState<TileLayerType>('street');
  
  const { center, zoom } = useMemo(() => {
    // 1. Prioritize explicit search location from the query input
    if (searchLocation) {
        return {
            center: searchLocation,
            zoom: 12, // A good zoom level for a city
        };
    }
    
    // 2. If a search (e.g., by price) is active and has results, focus on them.
    if (isSearchActive && properties.length > 0) {
      return {
        center: [properties[0].lat, properties[0].lng] as [number, number],
        zoom: properties.length === 1 ? 14 : 12,
      };
    }
    // 3. For initial load or cleared search, prioritize user location.
    if (userLocation) {
      return { center: userLocation, zoom: 14 };
    }
    // 4. Fallback to properties if no user location.
    if (properties.length > 0) {
      return {
        center: [properties[0].lat, properties[0].lng] as [number, number],
        zoom: 10,
      };
    }
    // Absolute fallback
    return {
      center: [44.2, 19.9] as [number, number],
      zoom: 10,
    };
  }, [properties, userLocation, isSearchActive, searchLocation]);
    
  const handlePopupClick = (propertyId: string) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
  };

  return (
    <div className="w-full h-full">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full" maxZoom={14} minZoom={9}>
        <ChangeView center={center} zoom={zoom} enabled={recenter} />
        <MapEvents onMove={onMapMove} />
        <TileLayer
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        <Markers properties={properties} onPopupClick={handlePopupClick} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200">
        <h4 className="font-bold text-sm mb-2 text-neutral-800">Legend</h4>
        <div className="space-y-1.5">
            {Object.entries(PROPERTY_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                    <span
                        className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-xs font-semibold text-neutral-700 capitalize">{type}</span>
                </div>
            ))}
        </div>
      </div>
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