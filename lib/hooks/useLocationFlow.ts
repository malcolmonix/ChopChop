// Enhanced Location Management Hook
import { useState, useEffect, useCallback } from 'react';
import { UserAddress } from '../services/user-profile';
import { useUserProfile } from './useUserProfile';
import { locationService, LocationResult } from '../services/location-service';

interface LocationPickingState {
  isPickingLocation: boolean;
  selectedLocation: LocationResult | null;
  validationErrors: string[];
  isValidating: boolean;
  isDuplicate: boolean;
  suggestedLabel: string;
}

interface LocationFlowOptions {
  autoSave?: boolean;
  validateDeliveryZone?: boolean;
  allowDuplicates?: boolean;
  defaultLabel?: string;
}

export function useLocationFlow(options: LocationFlowOptions = {}) {
  const { 
    autoSave = false,
    validateDeliveryZone: shouldValidateDeliveryZone = true,
    allowDuplicates = false,
    defaultLabel = 'New Address'
  } = options;

  const { profile, addAddress, updateAddress, addresses, getDefaultAddress } = useUserProfile();
  
  const [state, setState] = useState<LocationPickingState>({
    isPickingLocation: false,
    selectedLocation: null,
    validationErrors: [],
    isValidating: false,
    isDuplicate: false,
    suggestedLabel: defaultLabel
  });

  const [recentLocations, setRecentLocations] = useState<LocationResult[]>([]);

  // Load recent locations from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentLocations');
    if (recent) {
      try {
        setRecentLocations(JSON.parse(recent));
      } catch (error) {
        console.error('Failed to load recent locations:', error);
      }
    }
  }, []);

  // Validate delivery zone (Nigerian bounds)
  const validateDeliveryZone = useCallback((location: LocationResult): boolean => {
    const { lat, lng } = location.coordinates;
    
    // Nigerian bounds (approximate)
    const nigerianBounds = {
      north: 13.9,
      south: 4.3,
      east: 14.7,
      west: 2.7
    };

    return (
      lat >= nigerianBounds.south &&
      lat <= nigerianBounds.north &&
      lng >= nigerianBounds.west &&
      lng <= nigerianBounds.east
    );
  }, []);

  // Check for duplicate addresses
  const checkForDuplicate = useCallback((location: LocationResult): UserAddress | null => {
    if (!addresses || allowDuplicates) return null;

    const threshold = 0.001; // ~100 meters
    
    return addresses.find(addr => {
      const distance = Math.sqrt(
        Math.pow(addr.coordinates.lat - location.coordinates.lat, 2) +
        Math.pow(addr.coordinates.lng - location.coordinates.lng, 2)
      );
      return distance < threshold;
    }) || null;
  }, [addresses, allowDuplicates]);

  // Generate smart label suggestion
  const generateSmartLabel = useCallback((location: LocationResult): string => {
    const addressParts = location.formattedAddress.toLowerCase();
    
    // Smart label detection
    if (addressParts.includes('home') || addressParts.includes('house') || addressParts.includes('residence')) {
      return 'Home';
    }
    if (addressParts.includes('office') || addressParts.includes('work') || addressParts.includes('company')) {
      return 'Work';
    }
    if (addressParts.includes('school') || addressParts.includes('university') || addressParts.includes('college')) {
      return 'School';
    }
    if (addressParts.includes('gym') || addressParts.includes('fitness')) {
      return 'Gym';
    }
    if (addressParts.includes('hospital') || addressParts.includes('clinic')) {
      return 'Medical';
    }
    
    // Extract area name for label
    const parts = location.formattedAddress.split(',');
    if (parts.length > 1) {
      const areaName = parts[0].trim();
      return areaName.length > 20 ? 'Location' : areaName;
    }
    
    return defaultLabel;
  }, [defaultLabel]);

  // Validate location thoroughly
  const validateLocation = useCallback(async (location: LocationResult): Promise<string[]> => {
    const errors: string[] = [];

    // Check delivery zone
    if (shouldValidateDeliveryZone && !validateDeliveryZone(location)) {
      errors.push('This location is outside our delivery zone. We currently serve locations within Nigeria.');
    }

    // Check for coordinates validity
    if (!location.coordinates || 
        isNaN(location.coordinates.lat) || 
        isNaN(location.coordinates.lng) ||
        Math.abs(location.coordinates.lat) > 90 ||
        Math.abs(location.coordinates.lng) > 180) {
      errors.push('Invalid location coordinates. Please select a valid location.');
    }

    // Check address completeness
    if (!location.formattedAddress || location.formattedAddress.trim().length < 10) {
      errors.push('Address is too short or incomplete. Please provide a more detailed address.');
    }

    // Additional validation can be added here (e.g., API calls to verify address)
    
    return errors;
  }, [shouldValidateDeliveryZone, validateDeliveryZone]);

  // Save location to recent locations
  const saveToRecentLocations = useCallback((location: LocationResult) => {
    const updatedRecent = [
      location,
      ...recentLocations.filter(r => r.placeId !== location.placeId).slice(0, 9)
    ];
    
    setRecentLocations(updatedRecent);
    localStorage.setItem('recentLocations', JSON.stringify(updatedRecent));
  }, [recentLocations]);

  // Start location picking process
  const startLocationPicking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPickingLocation: true,
      selectedLocation: null,
      validationErrors: [],
      isDuplicate: false
    }));
  }, []);

  // Handle location selection
  const selectLocation = useCallback(async (location: LocationResult) => {
    setState(prev => ({ ...prev, isValidating: true, selectedLocation: location }));

    try {
      // Validate location
      const errors = await validateLocation(location);
      
      // Check for duplicates
      const duplicate = checkForDuplicate(location);
      
      // Generate smart label
      const suggestedLabel = generateSmartLabel(location);

      setState(prev => ({
        ...prev,
        selectedLocation: location,
        validationErrors: errors,
        isDuplicate: !!duplicate,
        suggestedLabel,
        isValidating: false
      }));

      // Save to recent locations if valid
      if (errors.length === 0) {
        saveToRecentLocations(location);
      }

      // Auto-save if enabled and no errors
      if (autoSave && errors.length === 0 && !duplicate) {
        await saveLocationAsAddress(location, suggestedLabel);
      }

    } catch (error) {
      console.error('Error processing location:', error);
      setState(prev => ({
        ...prev,
        validationErrors: ['Failed to process location. Please try again.'],
        isValidating: false
      }));
    }
  }, [validateLocation, checkForDuplicate, generateSmartLabel, saveToRecentLocations, autoSave]);

  // Save location as address
  const saveLocationAsAddress = useCallback(async (
    location: LocationResult, 
    label: string,
    instructions?: string
  ): Promise<string> => {
    if (!location) throw new Error('No location selected');

    const addressData: Omit<UserAddress, 'id'> = {
      label: label.trim() || 'New Address',
      street: location.addressComponents.street || location.formattedAddress,
      city: location.addressComponents.city || 'Lagos',
      state: location.addressComponents.state || 'Lagos State',
      country: location.addressComponents.country || 'Nigeria',
      postalCode: location.addressComponents.postalCode || '',
      coordinates: location.coordinates,
      instructions: instructions || '',
      isDefault: addresses.length === 0 // First address becomes default
    };

    const addressId = await addAddress(addressData);
    
    setState(prev => ({
      ...prev,
      isPickingLocation: false,
      selectedLocation: null,
      validationErrors: [],
      isDuplicate: false
    }));

    return addressId;
  }, [addAddress, addresses.length]);

  // Cancel location picking
  const cancelLocationPicking = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPickingLocation: false,
      selectedLocation: null,
      validationErrors: [],
      isDuplicate: false
    }));
  }, []);

  // Get location from coordinates (reverse geocoding)
  const getLocationFromCoordinates = useCallback(async (lat: number, lng: number): Promise<LocationResult | null> => {
    try {
      return await locationService.reverseGeocode(lat, lng);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }, []);

  // Quick save current location
  const saveCurrentLocation = useCallback(async (label?: string): Promise<string | null> => {
    try {
      setState(prev => ({ ...prev, isValidating: true }));
      
      const coordinates = await locationService.getCurrentLocation();
      if (!coordinates) {
        throw new Error('Unable to get current location');
      }

      const location = await getLocationFromCoordinates(coordinates.lat, coordinates.lng);
      if (!location) {
        throw new Error('Unable to resolve current location address');
      }

      const finalLabel = label || generateSmartLabel(location) || 'Current Location';
      return await saveLocationAsAddress(location, finalLabel);
      
    } catch (error) {
      console.error('Failed to save current location:', error);
      setState(prev => ({ 
        ...prev, 
        validationErrors: [error.message || 'Failed to save current location'],
        isValidating: false 
      }));
      return null;
    }
  }, [getLocationFromCoordinates, generateSmartLabel, saveLocationAsAddress]);

  return {
    // State
    ...state,
    recentLocations,
    
    // Actions
    startLocationPicking,
    selectLocation,
    saveLocationAsAddress,
    cancelLocationPicking,
    saveCurrentLocation,
    getLocationFromCoordinates,
    
    // Utilities
    generateSmartLabel,
    validateLocation,
    checkForDuplicate,
    
    // Profile integration
    profile,
    addresses,
    defaultAddress: getDefaultAddress(),
  };
}