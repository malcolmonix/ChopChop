'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services/location-service';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
}

// Custom marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 30px;
          height: 30px;
          background: #ff6b35;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        ">📍</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Component to handle map events
function MapEventHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center when prop changes
function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center.lat, center.lng, map]);

  return null;
}

export const InteractiveMap = ({
  center,
  onLocationSelect,
  height = '400px',
  zoom = 15
}: InteractiveMapProps) => {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>(center);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const markerRef = useRef<L.Marker>(null);

  // Update marker position when center prop changes
  useEffect(() => {
    setMarkerPosition(center);
  }, [center]);

  const handleLocationClick = async (lat: number, lng: number) => {
    setMarkerPosition({ lat, lng });
    setIsLoadingAddress(true);

    try {
      const result = await locationService.reverseGeocode(lat, lng);
      if (result) {
        setCurrentAddress(result.formattedAddress);
        onLocationSelect({
          lat,
          lng,
          address: result.formattedAddress
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMarkerDrag = (event: L.DragEndEvent) => {
    const marker = event.target;
    const position = marker.getLatLng();
    handleLocationClick(position.lat, position.lng);
  };

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height, width: '100%' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventHandler onLocationSelect={handleLocationClick} />
        <MapUpdater center={center} />

        <Marker
          position={[markerPosition.lat, markerPosition.lng]}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDrag,
          }}
          icon={createCustomIcon()}
          ref={markerRef}
        />
      </MapContainer>

      {/* Loading overlay */}
      {isLoadingAddress && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 z-[1000]">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-sm text-gray-600">Getting address...</span>
        </div>
      )}

      {/* Address display */}
      {currentAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">Selected Location</div>
              <div className="text-xs text-gray-600 truncate">{currentAddress}</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md z-[1000]">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">📍 Drag pin or tap to select</div>
        </div>
      </div>

      {/* CSS for custom marker */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};