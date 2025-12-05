'use client';

import React from 'react';
import { MapboxInteractiveMap } from './mapbox-interactive-map';

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  height?: string;
  zoom?: number;
}

// Use Mapbox instead of Leaflet to avoid SSR issues
export const InteractiveMapWrapper: React.FC<InteractiveMapProps> = (props) => {
  return <MapboxInteractiveMap {...props} />;
};
