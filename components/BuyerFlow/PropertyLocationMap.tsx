import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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

interface PropertyLocationMapProps {
    lat: number;
    lng: number;
    address: string;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({ lat, lng, address }) => {
    const [mapType, setMapType] = useState<TileLayerType>('street');
    const [showCadastre, setShowCadastre] = useState(false);

    if (isNaN(lat) || isNaN(lng)) {
        return <div className="h-full bg-neutral-200 flex items-center justify-center text-neutral-500">Location data unavailable.</div>;
    }

    return (
        <div className="w-full h-full relative">
            <MapContainer center={[lat, lng]} zoom={17} scrollWheelZoom={true} className="w-full h-full rounded-lg" maxZoom={19}>
                <TileLayer
                    key={mapType}
                    attribution={TILE_LAYERS[mapType].attribution}
                    url={TILE_LAYERS[mapType].url}
                />
                <CadastreLayer enabled={showCadastre && mapType === 'satellite'} opacity={0.7} />
                <Marker position={[lat, lng]}>
                    <Popup>
                        {address}
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Map controls */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg shadow-lg">
                    <button
                        onClick={() => setMapType('street')}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-all ${mapType === 'street' ? 'bg-primary text-white shadow' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        Street
                    </button>
                    <button
                        onClick={() => setMapType('satellite')}
                        className={`px-2 py-1 rounded text-xs font-semibold transition-all ${mapType === 'satellite' ? 'bg-primary text-white shadow' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        Satellite
                    </button>
                </div>
                {mapType === 'satellite' && (
                    <button
                        onClick={() => setShowCadastre(!showCadastre)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all shadow-lg ${showCadastre ? 'bg-primary text-white' : 'bg-white/90 text-neutral-700 hover:bg-white'}`}
                        title="Show cadastral parcels"
                    >
                        Parcels
                    </button>
                )}
            </div>
        </div>
    );
};

export default PropertyLocationMap;
