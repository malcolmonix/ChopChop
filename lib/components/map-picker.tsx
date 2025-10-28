// Interactive Map Picker Component
import React, { useState, useEffect, useRef } from 'react';
import { UserAddress } from '../services/user-profile';
import { locationService, LocationResult } from '../services/location-service';

// Simple map types (we'll use Leaflet which doesn't require API keys)
interface MapPickerProps {
  onLocationSelect: (location: LocationResult) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  onLocationSelect,
  onClose,
  initialLocation = { lat: 6.5244, lng: 3.3792 }, // Lagos default
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);  
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markerRef = useRef<any>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already loaded
        if (typeof window !== 'undefined' && (window as any).L) {
          initializeMap((window as any).L);
          return;
        }

        // Load Leaflet CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          initializeMap((window as any).L);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  const initializeMap = (L: any) => {
    if (!mapRef.current || map) return;

    try {
      // Create map
      const newMap = L.map(mapRef.current).setView([initialLocation.lat, initialLocation.lng], 13);

      // Add OpenStreetMap tiles (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(newMap);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background: #f97316;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      // Add initial marker
      const marker = L.marker([initialLocation.lat, initialLocation.lng], { 
        icon: customIcon,
        draggable: true 
      }).addTo(newMap);

      // Handle marker drag
      marker.on('dragend', async (e: any) => {
        const position = e.target.getLatLng();
        await handleLocationChange(position.lat, position.lng);
      });

      // Handle map click
      newMap.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        await handleLocationChange(lat, lng);
      });

      setMap(newMap);
      markerRef.current = marker;
      setIsMapLoaded(true);

      // Get initial location address
      handleLocationChange(initialLocation.lat, initialLocation.lng);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setIsLoading(true);
    
    try {
      const locationResult = await locationService.reverseGeocode(lat, lng);
      if (locationResult) {
        setSelectedLocation(locationResult);
      } else {
        // Fallback location object
        setSelectedLocation({
          placeId: 'manual',
          formattedAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: { lat, lng },
          addressComponents: {
            street: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city: 'Lagos',
            state: 'Lagos State',
            country: 'Nigeria',
          }
        });
      }
    } catch (error) {
      console.error('Failed to get address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const userLocation = await locationService.getCurrentLocation();
      if (userLocation && map && markerRef.current) {
        map.setView([userLocation.lat, userLocation.lng], 15);
        markerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        await handleLocationChange(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Select Location on Map</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-full min-h-[400px]"
            style={{ minHeight: '400px' }}
          />
          
          {/* Loading overlay */}
          {!isMapLoaded && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="bg-white shadow-lg rounded-lg p-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Go to current location"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg max-w-xs">
            <p className="text-sm text-gray-700">
              <span className="font-medium">📍 Drag the marker</span> or <span className="font-medium">click on the map</span> to select your location
            </p>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 mb-1">Selected Location</h3>
                <p className="text-sm text-gray-700 mb-2">{selectedLocation.formattedAddress}</p>
                <p className="text-xs text-gray-500">
                  {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-white">
          <div className="text-sm text-gray-600">
            {selectedLocation ? 'Location selected' : 'Select a location on the map'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation || isLoading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Confirm Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};