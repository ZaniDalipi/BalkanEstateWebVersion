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
  drawnBounds: L.LatLngBounds | null;
  onDrawComplete: (bounds: L.LatLngBounds | null) => void;
  isDrawing: boolean;
  onDrawStart: () => void;
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

const MapDrawEvents: React.FC<{
    isDrawing: boolean;
    onDrawComplete: (bounds: L.LatLngBounds | null) => void;
}> = ({ isDrawing, onDrawComplete }) => {
    const map = useMap();

    // Use refs for everything that changes or is part of the drag state
    const tempRectRef = useRef<L.Rectangle | null>(null);
    const startPosRef = useRef<L.LatLng | null>(null);
    const isDraggingRef = useRef(false);
    
    // Keep a ref to the latest props to avoid stale closures in event handlers
    const propsRef = useRef({ isDrawing, onDrawComplete });
    useEffect(() => {
        propsRef.current.isDrawing = isDrawing;
        propsRef.current.onDrawComplete = onDrawComplete;
    }, [isDrawing, onDrawComplete]);
    
    // Effect to manage map state (dragging, cursor) based on the isDrawing prop.
    useEffect(() => {
        const container = map.getContainer();
        if (propsRef.current.isDrawing) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            container.style.cursor = 'crosshair';
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            container.style.cursor = '';
            // If drawing is cancelled from outside while dragging, abort the drag.
            if (isDraggingRef.current) {
                // This triggers the 'up' logic to clean up listeners and state
                window.dispatchEvent(new Event('mouseup')); 
            }
        }
    }, [isDrawing, map]);

    // This main effect runs only ONCE to attach the listeners.
    useEffect(() => {
        const mapContainer = map.getContainer();

        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDraggingRef.current || !startPosRef.current) return;
            
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const point = map.containerPointToLayerPoint(L.point(clientX, clientY));
            const currentPos = map.layerPointToLatLng(point);

            if (!tempRectRef.current) {
                tempRectRef.current = L.rectangle(L.latLngBounds(startPosRef.current, currentPos), {
                    color: '#0252CD', weight: 2, dashArray: '5, 5', fillOpacity: 0.1
                }).addTo(map);
            } else {
                tempRectRef.current.setBounds(L.latLngBounds(startPosRef.current, currentPos));
            }
        };

        const handleUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            
            // Cleanup window listeners immediately
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);

            if (tempRectRef.current) {
                const bounds = tempRectRef.current.getBounds();
                map.removeLayer(tempRectRef.current); // Cleanup temp rectangle
                tempRectRef.current = null;
                
                // Use the ref'd prop to call the latest callback
                if (!bounds.getSouthWest().equals(bounds.getNorthEast())) {
                    propsRef.current.onDrawComplete(bounds);
                } else {
                    propsRef.current.onDrawComplete(null);
                }
            } else {
                propsRef.current.onDrawComplete(null);
            }
        };

        const handleStart = (e: MouseEvent | TouchEvent) => {
            // Check the ref'd prop to see if we should start drawing
            if (!propsRef.current.isDrawing || isDraggingRef.current || ('button' in e && e.button !== 0)) {
                return;
            }
            e.preventDefault();

            isDraggingRef.current = true;
            
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const point = map.containerPointToLayerPoint(L.point(clientX, clientY));
            startPosRef.current = map.layerPointToLatLng(point);

            // Attach listeners to window for dragging outside the map
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleUp);
        };

        // Attach the start listeners to the map container
        mapContainer.addEventListener('mousedown', handleStart);
        mapContainer.addEventListener('touchstart', handleStart, { passive: false });
        
        return () => {
            // Cleanup listeners when component unmounts
            mapContainer.removeEventListener('mousedown', handleStart);
            mapContainer.removeEventListener('touchstart', handleStart);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [map]); // This effect depends only on `map`, so it runs once.

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

const MapComponent: React.FC<MapComponentProps> = ({ properties, recenter, onMapMove, isSearchActive, searchLocation, userLocation, onSaveSearch, isSaving, isAuthenticated, mapBounds, drawnBounds, onDrawComplete, isDrawing, onDrawStart, tileLayer, recenterTo, onRecenterComplete }) => {
  const { dispatch } = useAppContext();
  
  const validProperties = useMemo(() => {
    return properties.filter(p => 
      p.lat != null && !isNaN(p.lat) && p.lng != null && !isNaN(p.lng)
    );
  }, [properties]);

  const propertiesInView = useMemo(() => {
    if (drawnBounds) {
        return validProperties.filter(p => drawnBounds.contains([p.lat, p.lng])).slice(0, 500);
    }
    if (!mapBounds) {
      return [];
    }
    return validProperties
      .filter(p => mapBounds.contains([p.lat, p.lng]))
      .slice(0, 500);
  }, [validProperties, mapBounds, drawnBounds]);
  
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
        <MapDrawEvents isDrawing={isDrawing} onDrawComplete={onDrawComplete} />
        {drawnBounds && !isDrawing && (
            <Rectangle
                bounds={drawnBounds}
                pathOptions={{ color: '#0252CD', weight: 3, fillOpacity: 0.2 }}
            />
        )}
        <TileLayer
          key={tileLayer}
          attribution={TILE_LAYERS[tileLayer].attribution}
          url={TILE_LAYERS[tileLayer].url}
        />
        <Markers properties={propertiesInView} onPopupClick={handlePopupClick} />
      </MapContainer>
      
      <div className="absolute top-24 right-4 z-[1000] hidden md:flex flex-col items-end gap-4">
        <button 
            onClick={onDrawStart}
            className={`flex items-center gap-2 px-4 py-2 text-white font-bold rounded-full shadow-lg transition-colors ${
                isDrawing 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-neutral-800 hover:bg-neutral-900'
            }`}
        >
            {isDrawing ? (
                <>
                    <XCircleIcon className="w-5 h-5" />
                    <span>Cancel Draw</span>
                </>
            ) : (
                <>
                    <PencilIcon className="w-5 h-5" />
                    <span>Draw Area</span>
                </>
            )}
        </button>

        {drawnBounds && !isDrawing && (
            <>
                {isAuthenticated && (
                    <button 
                        onClick={onSaveSearch} 
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50 animate-fade-in"
                    >
                        <BellIcon className="w-5 h-5" />
                        <span>{isSaving ? 'Saving...' : 'Save Area'}</span>
                    </button>
                )}
                <button
                    onClick={() => onDrawComplete(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-bold rounded-full shadow-lg hover:bg-neutral-900 animate-fade-in"
                >
                    <XCircleIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Clear Area</span>
                </button>
            </>
        )}
      </div>

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