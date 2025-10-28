// Enhanced Location Picker with Perfect Flow
import React, { useState, useEffect } from 'react';
import { UserAddress } from '../services/user-profile';
import { LocationResult } from '../services/location-service';
import { useLocationFlow } from '../hooks/useLocationFlow';
import { ModernLocationPicker } from './modern-location-picker';

interface EnhancedLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSaved: (address: UserAddress) => void;
  currentAddress?: UserAddress | null;
  autoSave?: boolean;
  showSaveOptions?: boolean;
}

export const EnhancedLocationPicker: React.FC<EnhancedLocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSaved,
  currentAddress,
  autoSave = false,
  showSaveOptions = true
}) => {
  const {
    selectedLocation,
    validationErrors,
    isValidating,
    isDuplicate,
    suggestedLabel,
    selectLocation,
    saveLocationAsAddress,
    cancelLocationPicking,
    saveCurrentLocation,
    profile,
    addresses
  } = useLocationFlow({ autoSave, validateDeliveryZone: true, allowDuplicates: false });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Update custom label when suggestion changes
  useEffect(() => {
    setCustomLabel(suggestedLabel);
  }, [suggestedLabel]);

  const handleLocationSelect = async (addressData: Partial<UserAddress>) => {
    // Convert address data to LocationResult format for validation
    if (addressData.coordinates && addressData.street) {
      const location: LocationResult = {
        placeId: 'user-selected',
        formattedAddress: `${addressData.street}, ${addressData.city}, ${addressData.state}`,
        coordinates: addressData.coordinates,
        addressComponents: {
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          country: addressData.country || '',
          postalCode: addressData.postalCode || ''
        }
      };

      await selectLocation(location);

      if (autoSave && validationErrors.length === 0 && !isDuplicate) {
        // Auto-save successful, close picker
        const newAddress: UserAddress = {
          id: `addr_${Date.now()}`,
          label: addressData.label || suggestedLabel,
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          country: addressData.country || '',
          postalCode: addressData.postalCode || '',
          coordinates: addressData.coordinates,
          instructions: addressData.instructions || '',
          isDefault: addresses.length === 0
        };
        
        onLocationSaved(newAddress);
        onClose();
      } else if (showSaveOptions) {
        // Show save dialog for user confirmation
        setShowSaveDialog(true);
      } else {
        // Return selected location without saving
        const tempAddress: UserAddress = {
          id: 'temp',
          label: addressData.label || 'Selected Location',
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          country: addressData.country || '',
          postalCode: addressData.postalCode || '',
          coordinates: addressData.coordinates,
          instructions: '',
          isDefault: false
        };
        
        onLocationSaved(tempAddress);
        onClose();
      }
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    setIsProcessing(true);
    try {
      const addressId = await saveLocationAsAddress(
        selectedLocation,
        customLabel,
        instructions
      );

      // Find the saved address
      const savedAddress = addresses.find(addr => addr.id === addressId);
      if (savedAddress) {
        onLocationSaved(savedAddress);
      }

      setShowSaveDialog(false);
      onClose();
    } catch (error) {
      console.error('Failed to save location:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickSaveCurrentLocation = async () => {
    setIsProcessing(true);
    try {
      const addressId = await saveCurrentLocation('Current Location');
      if (addressId) {
        const savedAddress = addresses.find(addr => addr.id === addressId);
        if (savedAddress) {
          onLocationSaved(savedAddress);
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to save current location:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShowSaveDialog(false);
    setCustomLabel('');
    setInstructions('');
    cancelLocationPicking();
    onClose();
  };

  if (!isOpen) return null;

  // Save dialog overlay
  if (showSaveDialog && selectedLocation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Save Location</h3>
            <p className="text-sm text-gray-600 mt-2">
              Add this location to your saved addresses for faster ordering
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Selected Location Display */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-800">Selected Location</h4>
                  <p className="text-sm text-green-700 mt-1">{selectedLocation.formattedAddress}</p>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Please fix these issues:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Duplicate Warning */}
            {isDuplicate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800">Duplicate Address</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You already have a similar address saved. You can still save this as a new address.
                </p>
              </div>
            )}

            {/* Label Input */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                Address Label
              </label>
              <input
                id="label"
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Home, Work, Gym"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">Choose a name to easily identify this location</p>
            </div>

            {/* Instructions Input */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Ring the doorbell, Gate code: 1234, Leave at the door"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">Help delivery drivers find you easily</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex space-x-3">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              disabled={isProcessing}
            >
              Use Without Saving
            </button>
            <button
              onClick={handleSaveLocation}
              disabled={isProcessing || validationErrors.length > 0 || !customLabel.trim()}
              className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save & Use'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main location picker
  return (
    <div className="relative">
      <ModernLocationPicker
        onAddressSelect={handleLocationSelect}
        onClose={handleClose}
        currentAddress={currentAddress}
        isOpen={isOpen}
      />

      {/* Quick Actions Overlay */}
      {!selectedLocation && (
        <div className="absolute top-20 right-4 space-y-2 z-10">
          <button
            onClick={handleQuickSaveCurrentLocation}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <span>Quick Save Current</span>
          </button>
        </div>
      )}

      {/* Validation Status */}
      {(isValidating || validationErrors.length > 0) && (
        <div className="absolute bottom-20 left-4 right-4 z-10">
          {isValidating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-blue-700 text-sm">Validating location...</span>
            </div>
          )}
          
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-medium text-red-800 text-sm mb-1">Location Issues:</h4>
              <ul className="text-xs text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};