// Interactive Map Component for Location Picking
import React, { useEffect, useRef, useState } from 'react';
import { locationService } from '../services/location-service';

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  onLocationSelect,
  height = '400px',
  zoom = 15
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerPosition, setMarkerPosition] = useState(center);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [mapError, setMapError] = useState<string | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      try {
        // Try to load Leaflet from CDN
        if (typeof window !== 'undefined' && !window.L) {
          // Load CSS
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          // Load JS
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            if (mounted) {
              initializeMap();
            }
          };
          script.onerror = () => {
            setMapError('Failed to load map library');
          };
          document.head.appendChild(script);
        } else if (window.L) {
          initializeMap();
        }
      } catch (error) {
        setMapError('Failed to initialize map');
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || mapInstance) return;

      try {
        const L = window.L;
        
        // Create map
        const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create custom icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
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
              cursor: grab;
            ">📍</div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        // Add draggable marker
        const marker = L.marker([center.lat, center.lng], { 
          icon: customIcon,
          draggable: true 
        }).addTo(map);

        // Handle marker drag
        marker.on('dragend', async (e) => {
          const position = e.target.getLatLng();
          setMarkerPosition({ lat: position.lat, lng: position.lng });
          
          // Reverse geocode to get address
          setIsLoadingAddress(true);
          try {
            const result = await locationService.reverseGeocode(position.lat, position.lng);
            if (result) {
              setCurrentAddress(result.formattedAddress);
              onLocationSelect({
                lat: position.lat,
                lng: position.lng,
                address: result.formattedAddress
              });
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          } finally {
            setIsLoadingAddress(false);
          }
        });

        // Handle map click
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
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
        });

        setMapInstance(map);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Update marker position when center changes
  useEffect(() => {
    if (mapInstance && window.L) {
      const marker = mapInstance.eachLayer((layer: any) => {
        if (layer.options && layer.options.draggable) {
          layer.setLatLng([center.lat, center.lng]);
        }
      });
      mapInstance.setView([center.lat, center.lng], zoom);
      setMarkerPosition(center);
    }
  }, [center, mapInstance]);

  if (mapError) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Using fallback location picker...</p>
            <p>📍 Current: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }} 
        className="rounded-lg overflow-hidden"
      />
      
      {/* Loading overlay */}
      {isLoadingAddress && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-sm text-gray-600">Getting address...</span>
        </div>
      )}

      {/* Address display */}
      {currentAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-md">
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
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">📍 Drag pin or tap to select</div>
          <div className="text-gray-500">
            {markerPosition.lat.toFixed(4)}, {markerPosition.lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Type declaration for Leaflet global
declare global {
  interface Window {
    L: any;
  }
}