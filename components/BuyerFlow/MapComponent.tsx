import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Property } from '../../types';
import L from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { BellIcon } from '../../constants';


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
  onMapMove: (bounds: L.LatLngBounds, center: L.LatLng) => void;
  isSearchActive: boolean;
  searchLocation: [number, number] | null;
  userLocation: [number, number] | null;
  onSaveSearch: () => void;
  isSaving: boolean;
  isAuthenticated: boolean;
  mapBounds: L.LatLngBounds | null;
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

const MapEvents: React.FC<{ onMove: (bounds: L.LatLngBounds, center: L.LatLng) => void }> = ({ onMove }) => {
    const map = useMap();

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                map.invalidateSize();
            }, 0);
        });

        const mapContainer = map.getContainer();
        resizeObserver.observe(mapContainer);
        
        return () => {
            resizeObserver.unobserve(mapContainer);
        };
    }, [map]);


    useMapEvents({
        load: () => {
            onMove(map.getBounds(), map.getCenter());
        },
        moveend: () => {
            onMove(map.getBounds(), map.getCenter());
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

const MapComponent: React.FC<MapComponentProps> = ({ properties, recenter, onMapMove, isSearchActive, searchLocation, userLocation, onSaveSearch, isSaving, isAuthenticated, mapBounds }) => {
  const { dispatch } = useAppContext();
  const [tileLayer, setTileLayer] = useState<TileLayerType>('street');

  // Filter out properties with invalid coordinates to prevent map errors
  const validProperties = useMemo(() => {
    return properties.filter(p => 
      p.lat != null && !isNaN(p.lat) && p.lng != null && !isNaN(p.lng)
    );
  }, [properties]);

  const propertiesInView = useMemo(() => {
    if (!mapBounds) {
      return []; // Return empty array until map bounds are known
    }
    return validProperties
      .filter(p => mapBounds.contains([p.lat, p.lng]))
      .slice(0, 500); // Cap at 500 markers for performance
  }, [validProperties, mapBounds]);
  
    const { center, zoom } = useMemo(() => {
        // 1. HIGHEST PRIORITY: Explicit search location from the query input.
        if (searchLocation) {
            return {
                center: searchLocation,
                zoom: 12,
            };
        }

        // 2. SECOND PRIORITY: User's detected location. Used for initial load
        // or when the search query is cleared.
        if (userLocation) {
            return {
                center: userLocation,
                zoom: 13,
            };
        }

        // 3. THIRD PRIORITY: If a search is active (with filters but no location)
        // and has results, focus on the first result.
        if (isSearchActive && validProperties.length > 0) {
            return {
                center: [validProperties[0].lat, validProperties[0].lng] as [number, number],
                zoom: validProperties.length === 1 ? 14 : 12,
            };
        }

        // 4. FOURTH PRIORITY: Fallback to the first property in the full list.
        if (validProperties.length > 0) {
            return {
                center: [validProperties[0].lat, validProperties[0].lng] as [number, number],
                zoom: 10,
            };
        }

        // Absolute fallback if there are no properties at all.
        return {
            center: [44.2, 19.9] as [number, number], // Center of Balkans
            zoom: 10,
        };
      }, [validProperties, isSearchActive, searchLocation, userLocation]);
    
  const handlePopupClick = (propertyId: string) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
  };

  const bottomControlsOffset = 112; // 80px for floating button + 32px padding

  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full" maxZoom={14} minZoom={5}>
        <ChangeView center={center} zoom={zoom} enabled={recenter} />
        <MapEvents onMove={onMapMove} />
        <TileLayer
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        <Markers properties={propertiesInView} onPopupClick={handlePopupClick} />
      </MapContainer>
      
      {isAuthenticated && (
        <div className="absolute top-4 right-4 z-[1000] hidden md:flex">
          <button 
            onClick={onSaveSearch} 
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <BellIcon className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Search'}</span>
          </button>
        </div>
      )}

      <div className="absolute left-4 z-[1000] bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200" style={{ bottom: `${bottomControlsOffset}px` }}>
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
      <div className="absolute right-4 z-[1000] bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-lg flex space-x-1 border border-neutral-200" style={{ bottom: `${bottomControlsOffset}px` }}>
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