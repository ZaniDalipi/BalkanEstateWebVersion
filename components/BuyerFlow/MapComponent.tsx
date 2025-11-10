import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle } from 'react-leaflet';
import { Property } from '../../types';
import L, { LeafletMouseEvent } from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { BellIcon, PencilIcon, XCircleIcon } from '../../constants';


// Fix for default icon issue with bundlers
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
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
  tileLayer: TileLayerType;
  recenterTo: [number, number] | null;
  onRecenterComplete: () => void;
}

const ChangeView: React.FC<{center: [number, number], zoom: number, enabled: boolean}> = ({ center, zoom, enabled }) => {
    const map = useMap();
    useEffect(() => {
        if (enabled) {
           map.setView(center, zoom);
        }
    }, [center, zoom, enabled, map]);
    return null;
}

const RecenterView: React.FC<{center: [number, number] | null, onComplete: () => void}> = ({center, onComplete}) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            const onMoveEnd = () => {
                onComplete();
                map.off('moveend', onMoveEnd);
            };
            map.on('moveend', onMoveEnd);
            map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }
    }, [center, map, onComplete]);
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
    house: '#0252CD',
    apartment: '#28a745',
    villa: '#6f42c1',
    other: '#6c757d',
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

const MapComponent: React.FC<MapComponentProps> = ({ properties, recenter, onMapMove, isSearchActive, searchLocation, userLocation, onSaveSearch, isSaving, isAuthenticated, mapBounds, tileLayer, recenterTo, onRecenterComplete }) => {
  const { dispatch } = useAppContext();
  
  const validProperties = useMemo(() => {
    return properties.filter(p => 
      p.lat != null && !isNaN(p.lat) && p.lng != null && !isNaN(p.lng)
    );
  }, [properties]);

  const propertiesInView = useMemo(() => {
    if (!mapBounds) {
      return [];
    }
    return validProperties
      .filter(p => mapBounds.contains([p.lat, p.lng]))
      .slice(0, 500);
  }, [validProperties, mapBounds]);
  
    const { center, zoom } = useMemo(() => {
        if (searchLocation) return { center: searchLocation, zoom: 12 };
        if (userLocation) return { center: userLocation, zoom: 13 };
        if (isSearchActive && validProperties.length > 0) return { center: [validProperties[0].lat, validProperties[0].lng] as [number, number], zoom: validProperties.length === 1 ? 14 : 12 };
        if (validProperties.length > 0) return { center: [validProperties[0].lat, validProperties[0].lng] as [number, number], zoom: 10 };
        return { center: [44.2, 19.9] as [number, number], zoom: 10 };
      }, [validProperties, isSearchActive, searchLocation, userLocation]);
    
  const handlePopupClick = (propertyId: string) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
  };

  const bottomControlsOffset = 112;

  return (
    <div className="w-full h-full relative">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full" maxZoom={18} minZoom={9} zoomControl={false}>
        <ChangeView center={center} zoom={zoom} enabled={recenter} />
        <RecenterView center={recenterTo} onComplete={onRecenterComplete} />
        <MapEvents onMove={onMapMove} />
        <TileLayer
          key={tileLayer}
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        <Markers properties={propertiesInView} onPopupClick={handlePopupClick} />
      </MapContainer>
      
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
    </div>
  );
};

export default MapComponent;