// Modern Location Picker - Uber Eats/Bolt Style
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserAddress } from '../services/user-profile';
import { locationService, LocationResult, PlaceAutocompleteResult } from '../services/location-service';
import { InteractiveMap } from './interactive-map';

interface ModernLocationPickerProps {
  onAddressSelect: (address: Partial<UserAddress>) => void;
  onClose: () => void;
  currentAddress?: UserAddress | null;
  isOpen?: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  type: 'home' | 'work' | 'other';
  icon: string;
}

export const ModernLocationPicker: React.FC<ModernLocationPickerProps> = ({
  onAddressSelect,
  onClose,
  currentAddress,
  isOpen = true
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'map'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recentAddresses, setRecentAddresses] = useState<SavedAddress[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 6.5244, lng: 3.3792 }); // Lagos default
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<any>(null);

  // Sample saved addresses (in real app, this would come from user profile)
  const savedAddresses: SavedAddress[] = [
    { id: '1', label: 'Home', address: '123 Ikeja GRA, Lagos', type: 'home', icon: '🏠' },
    { id: '2', label: 'Office', address: 'Victoria Island, Lagos', type: 'work', icon: '🏢' },
    { id: '3', label: 'Gym', address: 'Lekki Phase 1, Lagos', type: 'other', icon: '💪' },
  ];

  // Load recent addresses from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentAddresses');
    if (recent) {
      setRecentAddresses(JSON.parse(recent));
    }
  }, []);

  // Initialize map when tab switches to map
  useEffect(() => {
    if (activeTab === 'map' && !mapLoaded) {
      // TODO: Implement initializeMap function
      // initializeMap();
      setMapLoaded(true);
    }
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await locationService.getAutocompleteSuggestions(
            searchQuery,
            currentUserLocation || undefined
          );
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentUserLocation]);

  const handleMapLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    
    if (location.address) {
      setSelectedLocation({
        placeId: 'map-selected',
        formattedAddress: location.address,
        coordinates: { lat: location.lat, lng: location.lng },
        addressComponents: {
          street: location.address,
          city: 'Lagos',
          state: 'Lagos State',
          country: 'Nigeria'
        }
      });
      setSearchQuery(location.address);
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentUserLocation(location);
        setMapCenter(location);
        
        // Reverse geocode to get address
        const locationResult = await locationService.reverseGeocode(location.lat, location.lng);
        if (locationResult) {
          setSelectedLocation(locationResult);
          setSearchQuery(locationResult.formattedAddress);
        }
      } else {
        alert('Unable to get your current location. Please check your location settings.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handlePlaceSelect = async (place: PlaceAutocompleteResult) => {
    setIsLoadingLocation(true);
    setSearchQuery(place.description);
    setSearchResults([]);

    try {
      const locationResult = await locationService.getPlaceDetails(place.placeId);
      if (locationResult) {
        setSelectedLocation(locationResult);
        setMapCenter(locationResult.coordinates);
        
        // Save to recent addresses
        const recentAddress: SavedAddress = {
          id: Date.now().toString(),
          label: place.mainText,
          address: place.description,
          type: 'other',
          icon: '📍'
        };
        
        const updatedRecent = [recentAddress, ...recentAddresses.slice(0, 4)];
        setRecentAddresses(updatedRecent);
        localStorage.setItem('recentAddresses', JSON.stringify(updatedRecent));
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSearchQuery(address.address);
    // In real app, you'd geocode this address to get coordinates
    setSelectedLocation({
      placeId: address.id,
      formattedAddress: address.address,
      coordinates: mapCenter, // Use default for now
      addressComponents: {
        street: address.address,
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria'
      }
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onAddressSelect({
        street: selectedLocation.addressComponents.street || selectedLocation.formattedAddress,
        city: selectedLocation.addressComponents.city || 'Lagos',
        state: selectedLocation.addressComponents.state || 'Lagos State',
        country: selectedLocation.addressComponents.country || 'Nigeria',
        coordinates: selectedLocation.coordinates,
        label: selectedLocation.addressComponents.street ? 'Selected Address' : 'GPS Location',
        isDefault: false,
        postalCode: selectedLocation.addressComponents.postalCode || '',
        instructions: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:rounded-t-2xl sm:rounded-b-none rounded-t-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔍 Search
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'map'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🗺️ Map
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'search' && (
            <div className="p-4 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Search for address, landmark, or area"
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                  </div>
                )}
              </div>

              {/* Current Location */}
              <button
                onClick={handleCurrentLocation}
                disabled={isLoadingLocation}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {isLoadingLocation ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-blue-600">Use current location</div>
                  <div className="text-sm text-gray-500">Enable GPS to find nearby locations</div>
                </div>
              </button>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 px-2">Search Results</h3>
                  {searchResults.map((result) => (
                    <button
                      key={result.placeId}
                      onClick={() => handlePlaceSelect(result)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.mainText}</div>
                        <div className="text-sm text-gray-500 truncate">{result.secondaryText}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && searchQuery.length === 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 px-2">Saved Addresses</h3>
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => handleSavedAddressSelect(address)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{address.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{address.label}</div>
                        <div className="text-sm text-gray-500 truncate">{address.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Addresses */}
              {recentAddresses.length > 0 && searchQuery.length === 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500 px-2">Recent</h3>
                  {recentAddresses.map((address) => (
                    <button
                      key={address.id}
                      onClick={() => handleSavedAddressSelect(address)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">{address.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{address.label}</div>
                        <div className="text-sm text-gray-500 truncate">{address.address}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="h-96 relative">
              {/* Map Container */}
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {mapLoaded ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">Interactive Map</p>
                    <p className="text-sm text-gray-500">Drag the pin to select location</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Lat: {mapCenter.lat.toFixed(6)}, Lng: {mapCenter.lng.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                )}
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <button
                  onClick={handleCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {isLoadingLocation ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  ) : (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="p-4 bg-green-50 border-t">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-800">Location Selected</div>
                <div className="text-sm text-green-700">{selectedLocation.formattedAddress}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};