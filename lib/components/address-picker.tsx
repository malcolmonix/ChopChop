// Enhanced Address Picker Component with Location API and Map
import React, { useState, useEffect, useRef } from 'react';
import { UserAddress } from '../services/user-profile';
import { locationService, LocationResult, PlaceAutocompleteResult } from '../services/location-service';
import { MapPicker } from './map-picker';

interface AddressPickerProps {
  onAddressSelect: (address: Partial<UserAddress>) => void;
  onClose: () => void;
  currentAddress?: UserAddress | null;
}

export const AddressPicker: React.FC<AddressPickerProps> = ({
  onAddressSelect,
  onClose,
  currentAddress
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceAutocompleteResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'map'>('search');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [addressForm, setAddressForm] = useState({
    street: currentAddress?.street || '',
    city: currentAddress?.city || 'Lagos',
    state: currentAddress?.state || 'Lagos State',
    country: currentAddress?.country || 'Nigeria',
    instructions: currentAddress?.instructions || '',
  });

  // Initialize location service
  useEffect(() => {
    const initializeLocationService = async () => {
      try {
        // For development, we'll use the fallback service
        // In production, uncomment and add your Google API key:
        // await locationService.initializeGoogleMaps('YOUR_GOOGLE_MAPS_API_KEY');
        
        // Get user's current location
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentUserLocation(location);
        }
      } catch (error) {
        console.error('Failed to initialize location service:', error);
      }
    };

    initializeLocationService();
  }, []);

  // Handle search input with debouncing
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

  // Handle place selection
  const handlePlaceSelect = async (placeResult: PlaceAutocompleteResult) => {
    setIsLoadingLocation(true);
    setSearchQuery(placeResult.description);
    setSearchResults([]);

    try {
      const locationResult = await locationService.getPlaceDetails(placeResult.placeId);
      if (locationResult) {
        setSelectedLocation(locationResult);
        setAddressForm({
          street: locationResult.addressComponents.street || locationResult.formattedAddress,
          city: locationResult.addressComponents.city || 'Lagos',
          state: locationResult.addressComponents.state || 'Lagos State',
          country: locationResult.addressComponents.country || 'Nigeria',
          instructions: addressForm.instructions,
        });
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirmAddress = () => {
    if (selectedLocation || addressForm.street) {
      onAddressSelect({
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        country: addressForm.country,
        coordinates: selectedLocation ? selectedLocation.coordinates : { lat: 6.5244, lng: 3.3792 }, // Lagos default
        label: 'Selected Address',
        isDefault: false,
        postalCode: selectedLocation?.addressComponents.postalCode || '',
        instructions: addressForm.instructions
      });
    }
  };

  const handleMapLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setAddressForm({
      street: location.addressComponents.street || location.formattedAddress,
      city: location.addressComponents.city || 'Lagos',
      state: location.addressComponents.state || 'Lagos State',
      country: location.addressComponents.country || 'Nigeria',
      instructions: addressForm.instructions,
    });
    setShowMapPicker(false);
    setActiveTab('search'); // Switch back to search tab to show selected location
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCurrentUserLocation(location);
        
        // Reverse geocode to get address
        const locationResult = await locationService.reverseGeocode(location.lat, location.lng);
        if (locationResult) {
          setSelectedLocation(locationResult);
          setSearchQuery(locationResult.formattedAddress);
          setAddressForm({
            street: locationResult.addressComponents.street || locationResult.formattedAddress,
            city: locationResult.addressComponents.city || 'Lagos',
            state: locationResult.addressComponents.state || 'Lagos State',
            country: locationResult.addressComponents.country || 'Nigeria',
            instructions: addressForm.instructions,
          });
        } else {
          // Fallback if reverse geocoding fails
          setSelectedLocation({
            placeId: '',
            formattedAddress: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            coordinates: location,
            addressComponents: {},
          });
          setSearchQuery(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        }
      } else {
        alert('Unable to get your current location. Please check your location settings and try again.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Unable to get your current location. Please enter your address manually.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="flex items-center justify-between p-6 pb-0">
            <h2 className="text-xl font-semibold text-gray-900">Select Delivery Address</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b px-6">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'search'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Address</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'map'
                  ? 'border-orange-500 text-orange-600 bg-orange-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Map Picker</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Tab Content */}
          {activeTab === 'search' && (
            <>
              {/* Search Address */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Search for your address
                </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-10"
                placeholder="Enter street address, landmark, or area"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={result.placeId}
                    onClick={() => handlePlaceSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-orange-50 focus:outline-none"
                  >
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.mainText}</p>
                        <p className="text-sm text-gray-500 truncate">{result.secondaryText}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-sm text-gray-500">OR</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Current Location Button */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Getting Location...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {/* Address Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={addressForm.street}
                onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your street address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Lagos State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                value={addressForm.instructions}
                onChange={(e) => setAddressForm(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Ring the bell twice, Gate opposite the pharmacy"
                rows={3}
              />
            </div>
          </div>

              {/* Selected Location Display */}
              {selectedLocation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Location Selected</h3>
                      <p className="text-sm text-green-700 mb-2">
                        {selectedLocation.formattedAddress}
                      </p>
                      <p className="text-xs text-green-600">
                        GPS: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Map Tab Content */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Location on Map</h3>
                <p className="text-gray-600 mb-6">
                  Use our interactive map to pinpoint your exact location with precision
                </p>
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Open Map Picker</span>
                </button>
              </div>

              {/* Show selected location from map */}
              {selectedLocation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Location Selected from Map</h3>
                      <p className="text-sm text-green-700 mb-2">
                        {selectedLocation.formattedAddress}
                      </p>
                      <p className="text-xs text-green-600">
                        GPS: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedLocation ? (
              <span className="text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Location verified
              </span>
            ) : addressForm.street ? (
              'Ready to confirm address'
            ) : (
              'Please search or enter your address'
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAddress}
              disabled={!addressForm.street || isLoadingLocation}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoadingLocation ? 'Loading...' : 'Confirm Address'}
            </button>
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <MapPicker
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapPicker(false)}
          initialLocation={
            selectedLocation 
              ? {
                  lat: selectedLocation.coordinates.lat,
                  lng: selectedLocation.coordinates.lng
                }
              : undefined
          }
        />
      )}
    </div>
  );
};