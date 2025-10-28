// Location utilities and hooks
import { useState, useEffect } from 'react';
import { locationService, LocationResult, PlaceAutocompleteResult } from '../services/location-service';

// Hook for location search with debouncing
export function useLocationSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        setError(null);
        
        try {
          const searchResults = await locationService.getAutocompleteSuggestions(query);
          setResults(searchResults);
        } catch (err) {
          setError('Failed to search locations');
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}

// Hook for getting current location
export function useCurrentLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userLocation = await locationService.getCurrentLocation();
      if (userLocation) {
        setLocation(userLocation);
      } else {
        setError('Unable to get your location. Please check location permissions.');
      }
    } catch (err) {
      setError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
  };
}

// Hook for reverse geocoding
export function useReverseGeocode() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<LocationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await locationService.reverseGeocode(lat, lng);
      return result;
    } catch (err) {
      setError('Failed to get address for location');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reverseGeocode,
    isLoading,
    error,
  };
}

// Utility function to format address components
export function formatAddress(addressComponents: LocationResult['addressComponents']): string {
  const parts = [];
  
  if (addressComponents.street) parts.push(addressComponents.street);
  if (addressComponents.city) parts.push(addressComponents.city);
  if (addressComponents.state) parts.push(addressComponents.state);
  if (addressComponents.country) parts.push(addressComponents.country);
  
  return parts.join(', ');
}

// Utility function to validate Nigerian addresses
export function isValidNigerianLocation(location: LocationResult): boolean {
  // Check if coordinates are within Nigeria's bounds (approximately)
  const { lat, lng } = location.coordinates;
  const nigeriaBounds = {
    north: 13.9,
    south: 4.3,
    east: 14.7,
    west: 2.7,
  };
  
  return (
    lat >= nigeriaBounds.south &&
    lat <= nigeriaBounds.north &&
    lng >= nigeriaBounds.west &&
    lng <= nigeriaBounds.east
  );
}

// Common Nigerian cities for quick selection
export const NIGERIAN_CITIES = [
  { name: 'Lagos', state: 'Lagos State', coordinates: { lat: 6.5244, lng: 3.3792 } },
  { name: 'Abuja', state: 'FCT', coordinates: { lat: 9.0579, lng: 7.4951 } },
  { name: 'Kano', state: 'Kano State', coordinates: { lat: 12.0022, lng: 8.5920 } },
  { name: 'Ibadan', state: 'Oyo State', coordinates: { lat: 7.3775, lng: 3.9470 } },
  { name: 'Port Harcourt', state: 'Rivers State', coordinates: { lat: 4.8156, lng: 7.0498 } },
  { name: 'Benin City', state: 'Edo State', coordinates: { lat: 6.3350, lng: 5.6037 } },
  { name: 'Kaduna', state: 'Kaduna State', coordinates: { lat: 10.5222, lng: 7.4383 } },
  { name: 'Enugu', state: 'Enugu State', coordinates: { lat: 6.4474, lng: 7.5022 } },
];