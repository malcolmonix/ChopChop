'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { locationService } from '../services/location-service';

interface MapboxInteractiveMapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
}

export const MapboxInteractiveMap: React.FC<MapboxInteractiveMapProps> = ({
  center,
  onLocationSelect,
  height = '400px',
  zoom = 15
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Dynamically import mapbox-gl only on client side
    import('mapbox-gl').then((mapboxgl) => {
      if (!mapContainerRef.current || mapRef.current) return;

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: zoom,
        accessToken: mapboxToken
      });

      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create marker
      const marker = new mapboxgl.Marker({
        draggable: true,
        color: '#ff6b35'
      })
        .setLngLat([center.lng, center.lat])
        .addTo(map);

      // Handle marker drag
      marker.on('dragend', async () => {
        const lngLat = marker.getLngLat();
        await handleLocationSelect(lngLat.lat, lngLat.lng);
      });

      // Handle map click
      map.on('click', async (e: any) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        await handleLocationSelect(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center when prop changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [center.lng, center.lat] });
      markerRef.current.setLngLat([center.lng, center.lat]);
    }
  }, [center.lat, center.lng]);

  const handleLocationSelect = async (lat: number, lng: number) => {
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

  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height, width: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {isLoadingAddress && (
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex items-center space-x-2 z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-sm text-gray-600">Getting address...</span>
        </div>
      )}

      {/* Address display */}
      {currentAddress && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-md z-10">
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
      <div className="absolute top-4 right-14 bg-white p-2 rounded-lg shadow-md z-10">
        <div className="text-xs text-gray-600 text-center">
          <div className="font-medium mb-1">📍 Drag pin or tap to select</div>
        </div>
      </div>
    </div>
  );
};
