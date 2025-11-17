import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  address: string;
  zoom?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ lat, lng, address, zoom = 17, onLocationChange }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with higher zoom for street-level view
    const map = L.map(mapContainerRef.current, {
      minZoom: 14, // Prevent zooming out beyond city view
      maxZoom: 19,
    }).setView([lat, lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      minZoom: 14,
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([lat, lng], {
      draggable: true,
      autoPan: true,
    }).addTo(map);

    marker.bindPopup(`<b>Drag me to adjust location</b><br>${address}`).openPopup();

    // Handle marker drag
    marker.on('dragstart', () => {
      setIsDragging(true);
    });

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      onLocationChange(position.lat, position.lng);
      setIsDragging(false);
      marker.setPopupContent(`<b>Location adjusted</b><br>Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`);
      marker.openPopup();
    });

    marker.on('drag', (e) => {
      const position = e.target.getLatLng();
      marker.setPopupContent(`<b>Dragging...</b><br>Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update marker position when lat/lng changes externally with smooth animation
  useEffect(() => {
    if (markerRef.current && mapRef.current && !isDragging) {
      const newLatLng = L.latLng(lat, lng);
      markerRef.current.setLatLng(newLatLng);

      // Use flyTo for smooth animated zoom and pan to the location
      mapRef.current.flyTo(newLatLng, zoom, {
        duration: 1.5, // 1.5 second animation
        easeLinearity: 0.25
      });

      markerRef.current.setPopupContent(`<b>Drag me to adjust location</b><br>${address}`);

      // Open popup after animation completes
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 1600);
    }
  }, [lat, lng, address, zoom, isDragging]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-700">Adjust Property Location</p>
        <p className="text-xs text-neutral-500">Drag the marker to fine-tune</p>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-80 rounded-lg border-2 border-neutral-300 shadow-sm"
        style={{ zIndex: 0 }}
      />
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Tip:</span> Drag the red marker to the exact location of your property.
          This helps buyers find your listing more accurately.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
          <span className="text-neutral-500">Latitude:</span> <span className="font-mono font-semibold text-neutral-800">{lat.toFixed(6)}</span>
        </div>
        <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
          <span className="text-neutral-500">Longitude:</span> <span className="font-mono font-semibold text-neutral-800">{lng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
