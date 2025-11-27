import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Rectangle } from 'react-leaflet';
import { Property } from '../../types';
import L, { LeafletMouseEvent } from 'leaflet';
import { useAppContext } from '../../context/AppContext';
import { formatPrice } from '../../utils/currency';
import { BellIcon, PencilIcon, XCircleIcon, CubeTransparentIcon, CrosshairsIcon } from '../../constants';
import { CadastreLayer } from '../Map/CadastreLayer';


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

// Bounding box for the Balkan region
const BALKAN_BOUNDS = L.latLngBounds(
    [34, 13], // Southwest corner (Southern Greece, Western Croatia)
    [49, 31]  // Northeast corner (Northern Romania, Eastern Bulgaria)
);


interface MapComponentProps {
  properties: Property[];
  onMapMove: (bounds: L.LatLngBounds, center: L.LatLng) => void;
  userLocation: [number, number] | null;
  onSaveSearch: () => void;
  isSaving: boolean;
  isAuthenticated: boolean;
  mapBounds: L.LatLngBounds | null;
  drawnBounds: L.LatLngBounds | null;
  onDrawComplete: (bounds: L.LatLngBounds | null) => void;
  isDrawing: boolean;
  onDrawStart: () => void;
  flyToTarget: { center: [number, number]; zoom: number } | null;
  onFlyComplete: () => void;
  onRecenter: () => void;
  isMobile: boolean;
  searchMode: 'manual' | 'ai';
}

const FlyToController: React.FC<{
  target: { center: [number, number], zoom: number } | null,
  onComplete: () => void
}> = ({target, onComplete}) => {
    const map = useMap();
    useEffect(() => {
        if (target) {
            const onMoveEnd = () => {
                onComplete();
                map.off('moveend', onMoveEnd);
            };
            map.on('moveend', onMoveEnd);
            map.flyTo(target.center, target.zoom, {
                animate: true,
                duration: 2.5
            });
        }
    }, [target, map, onComplete]);
    return null;
}

const MapEvents: React.FC<{ onMove: (bounds: L.LatLngBounds, center: L.LatLng) => void; mapBounds: L.LatLngBounds | null; searchMode: 'manual' | 'ai'; }> = ({ onMove, mapBounds, searchMode }) => {
    const map = useMap();

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setTimeout(() => {
                if (map && map.getContainer()) {
                    map.invalidateSize();
                }
            }, 0);
        });

        const mapContainer = map.getContainer();
        if (mapContainer) {
            resizeObserver.observe(mapContainer);
        }

        // Force a resize check shortly after the component mounts.
        // This helps fix layout issues where the map container size isn't computed correctly on initial render.
        const timer = setTimeout(() => {
            if (map && map.getContainer()) {
                map.invalidateSize();
            }
        }, 100);

        return () => {
            if (mapContainer) {
                resizeObserver.unobserve(mapContainer);
            }
            clearTimeout(timer);
        };
    }, [map]);

    useEffect(() => {
        if (mapBounds) {
            // This effect runs when the mapBounds prop changes. This happens after the parent
            // SearchPage component updates its state from the map's 'moveend' event.
            // By calling invalidateSize() in a timeout, we ensure the map re-checks its
            // container size *after* the React render cycle completes, fixing any
            // layout shifts that might occur from other components updating (like the property count).
            const timer = setTimeout(() => {
                if (map && map.getContainer()) {
                    map.invalidateSize();
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [map, mapBounds]);

    useEffect(() => {
        // When the search mode changes (e.g., from manual to AI), the left panel's content
        // might change, causing a layout shift. We need to tell the map to re-check
        // its container size to fill the space correctly.
        const timer = setTimeout(() => {
            if (map && map.getContainer()) {
                map.invalidateSize();
            }
        }, 50); // A small delay to let layout settle
        return () => clearTimeout(timer);
    }, [map, searchMode]);


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

const ZoomBasedTileSwitch: React.FC<{
    mapType: TileLayerType;
    setMapType: (type: TileLayerType) => void;
}> = ({ mapType, setMapType }) => {
    const map = useMap();

    useEffect(() => {
        const handleZoomEnd = () => {
            const currentZoom = map.getZoom();

            if (currentZoom >= 18) {
                // Switch to satellite view at maximum zoom
                if (mapType !== 'satellite') {
                    setMapType('satellite');
                }
            } else {
                // Switch back to street view at lower zoom levels
                if (mapType !== 'street') {
                    setMapType('street');
                }
            }
        };

        map.on('zoomend', handleZoomEnd);

        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map, mapType, setMapType]);

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

            // FIX: Calculation needs to be relative to the map container, not the viewport
            const rect = mapContainer.getBoundingClientRect();
            const point = map.containerPointToLayerPoint(L.point(clientX - rect.left, clientY - rect.top));
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
            
            // FIX: Calculation needs to be relative to the map container, not the viewport
            const rect = mapContainer.getBoundingClientRect();
            const point = map.containerPointToLayerPoint(L.point(clientX - rect.left, clientY - rect.top));
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
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
            <circle cx="15" cy="15" r="13" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
            <text x="15" y="16" font-family="Inter, sans-serif" font-size="8" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

    return L.divIcon({
        html: svgHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
};

const createDetailedMarkerIcon = (property: Property) => {
    const price = formatMarkerPrice(property.price);
    const color = PROPERTY_TYPE_COLORS[property.propertyType] || PROPERTY_TYPE_COLORS.other;

    const svgHtml = `
        <svg width="45" height="36" viewBox="0 0 70 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)); transform-origin: bottom center;">
            <path d="M35 56L25 44H45L35 56Z" fill="#003A96" />
            <path d="M65 24.5V44H5V24.5L35 5L65 24.5Z" fill="${color}" stroke="#FFFFFF" stroke-width="2" />
            <text x="35" y="30" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${price}</text>
        </svg>
    `;

    return L.divIcon({
        html: svgHtml,
        className: '',
        iconSize: [45, 36],
        iconAnchor: [22.5, 36],
        popupAnchor: [0, -36]
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

const PropertyPopup: React.FC<{ property: Property; onPopupClick: (id: string) => void }> = ({ property, onPopupClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = property.images && property.images.length > 0
        ? property.images.map(img => img.url)
        : [property.imageUrl];

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div
            className="w-56 cursor-pointer"
            onClick={() => onPopupClick(property.id)}
        >
            {/* Image carousel */}
            <div className="relative mb-2">
                <img
                    src={images[currentImageIndex]}
                    alt={property.address}
                    className="w-full h-28 object-cover rounded"
                />

                {/* Image navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-sm"
                        >
                            ‹
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors text-sm"
                        >
                            ›
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {currentImageIndex + 1}/{images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Price and property type */}
            <div className="mb-1.5">
                <div className="flex items-center justify-between">
                    <p className="font-bold text-base text-primary">{formatPrice(property.price, property.country)}</p>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 capitalize">
                        {property.propertyType}
                    </span>
                </div>
            </div>

            {/* Address */}
            <p className="text-xs text-neutral-600 mb-2 line-clamp-1">{property.address}, {property.city}</p>

            {/* Essential information */}
            <div className="grid grid-cols-3 gap-1.5 mb-2 text-center">
                <div className="bg-neutral-50 rounded py-1.5">
                    <div className="text-xs text-neutral-500">Beds</div>
                    <div className="font-bold text-sm text-neutral-800">{property.beds}</div>
                </div>
                <div className="bg-neutral-50 rounded py-1.5">
                    <div className="text-xs text-neutral-500">Baths</div>
                    <div className="font-bold text-sm text-neutral-800">{property.baths}</div>
                </div>
                <div className="bg-neutral-50 rounded py-1.5">
                    <div className="text-xs text-neutral-500">m²</div>
                    <div className="font-bold text-sm text-neutral-800">{property.sqft}</div>
                </div>
            </div>

            {/* Additional features */}
            <div className="flex flex-wrap gap-1 mb-1.5">
                {property.livingRooms > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {property.livingRooms} Living
                    </span>
                )}
                {property.parking > 0 && (
                    <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                        {property.parking} Parking
                    </span>
                )}
                {property.yearBuilt && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                        {property.yearBuilt}
                    </span>
                )}
            </div>

            {/* View details prompt */}
            <div className="text-center pt-1.5 border-t border-neutral-200">
                <p className="text-xs font-semibold text-primary">Click for details →</p>
            </div>
        </div>
    );
};

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
                    <Popup maxWidth={230} minWidth={220}>
                        <PropertyPopup property={prop} onPopupClick={onPopupClick} />
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

const Legend: React.FC = () => (
    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-neutral-200 animate-fade-in">
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
);


const MapComponent: React.FC<MapComponentProps> = ({ properties, onMapMove, userLocation, onSaveSearch, isSaving, isAuthenticated, mapBounds, drawnBounds, onDrawComplete, isDrawing, onDrawStart, flyToTarget, onFlyComplete, onRecenter, isMobile, searchMode }) => {
  const { dispatch } = useAppContext();
  const [mapType, setMapType] = useState<TileLayerType>('street');
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [showCadastre, setShowCadastre] = useState(false);
  
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
        if (userLocation) return { center: userLocation, zoom: 13 };
        return { center: [41.5, 22] as [number, number], zoom: 7 };
      }, [userLocation]);
    
  const handlePopupClick = (propertyId: string) => {
    dispatch({ type: 'SET_SELECTED_PROPERTY', payload: propertyId });
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        maxZoom={18}
        minZoom={7}
        zoomControl={false}
        maxBounds={BALKAN_BOUNDS}
        maxBoundsViscosity={1.0}
        dragging={true}
      >
        <FlyToController target={flyToTarget} onComplete={onFlyComplete} />
        <MapEvents onMove={onMapMove} mapBounds={mapBounds} searchMode={searchMode} />
        <MapDrawEvents isDrawing={isDrawing} onDrawComplete={onDrawComplete} />
        <ZoomBasedTileSwitch mapType={mapType} setMapType={setMapType} />
        {drawnBounds && !isDrawing && (
            <Rectangle
                bounds={drawnBounds}
                pathOptions={{ color: '#0252CD', weight: 3, fillOpacity: 0.2 }}
            />
        )}
        <TileLayer
          key={mapType}
          attribution={TILE_LAYERS[mapType].attribution}
          url={TILE_LAYERS[mapType].url}
        />
        <CadastreLayer enabled={showCadastre && mapType === 'satellite'} opacity={0.7} />
        <Markers properties={propertiesInView} onPopupClick={handlePopupClick} />
      </MapContainer>
      
      {!isMobile && (
        <>
            <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-3">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg flex items-center gap-2">
                     <button
                        onClick={onRecenter}
                        className="p-2 rounded-full hover:bg-black/10 transition-colors"
                        title="Center on my location"
                    >
                        <CrosshairsIcon className="w-6 h-6 text-neutral-700" />
                    </button>
                    <div className="flex items-center gap-1 bg-neutral-200/50 p-1 rounded-full">
                        <button
                            onClick={() => setMapType('street')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mapType === 'street' ? 'bg-white shadow text-primary' : 'text-neutral-600 hover:bg-white/50'}`}
                        >
                            Street
                        </button>
                        <button
                            onClick={() => setMapType('satellite')}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mapType === 'satellite' ? 'bg-white shadow text-primary' : 'text-neutral-600 hover:bg-white/50'}`}
                        >
                            Satellite
                        </button>
                    </div>
                    <button
                        onClick={onDrawStart}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-md transition-colors ${
                            isDrawing
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-neutral-800 text-white hover:bg-neutral-900'
                        }`}
                    >
                        {isDrawing ? <XCircleIcon className="w-5 h-5" /> : <PencilIcon className="w-5 h-5" />}
                        <span>{isDrawing ? 'Cancel' : 'Draw Area'}</span>
                    </button>
                </div>

                {mapType === 'satellite' && (
                    <button
                        onClick={() => setShowCadastre(!showCadastre)}
                        className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg transition-all animate-fade-in ${showCadastre ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-white/90 text-neutral-800 hover:bg-white'}`}
                        title="Show cadastral parcels (zoom in to see)"
                    >
                        {showCadastre ? '✓ ' : ''}Cadastral Parcels
                    </button>
                )}

                {drawnBounds && !isDrawing && (
                    <div className="flex flex-col items-end gap-2 animate-fade-in">
                        {isAuthenticated && (
                            <button 
                                onClick={onSaveSearch} 
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                            >
                                <BellIcon className="w-5 h-5" />
                                <span>{isSaving ? 'Saving...' : 'Save Area'}</span>
                            </button>
                        )}
                        <button
                            onClick={() => onDrawComplete(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-bold rounded-full shadow-lg hover:bg-neutral-900"
                        >
                            <XCircleIcon className="w-5 h-5" />
                            <span>Clear Area</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="absolute bottom-4 left-4 z-[1000]">
                <Legend />
            </div>
        </>
      )}

      {isMobile && (
        <div className="absolute bottom-20 left-4 z-[1000] pointer-events-none flex flex-col gap-2">
            {isLegendOpen && (
                <div className="absolute bottom-full mb-2 pointer-events-auto">
                    <Legend />
                </div>
            )}
            {mapType === 'satellite' && (
                <button
                    onClick={() => setShowCadastre(!showCadastre)}
                    className={`pointer-events-auto px-3 py-2 text-xs font-bold rounded-full shadow-lg transition-all animate-fade-in ${showCadastre ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-white/90 text-neutral-800 hover:bg-white'}`}
                    title="Show cadastral parcels (zoom in to see)"
                >
                    {showCadastre ? '✓ ' : ''}Parcels
                </button>
            )}
            <button onClick={() => setIsLegendOpen(p => !p)} className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg pointer-events-auto" title="Map Legend">
                <CubeTransparentIcon className="w-6 h-6 text-neutral-800" />
            </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;