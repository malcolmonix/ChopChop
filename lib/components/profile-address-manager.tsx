import React, { useState, useEffect } from 'react';
import { cityService, City } from '../services/city-service';
import { locationStorageService, StoredLocation } from '../services/location-storage';
import { LocationResult } from '../services/location-service';

interface SavedAddress extends StoredLocation {
  isDefault: boolean;
  nickname: string;
  deliveryInstructions?: string;
  isVerified: boolean;
}

interface AddressFormData {
  nickname: string;
  address: string;
  coordinates: { lat: number; lng: number };
  cityId: string;
  deliveryInstructions: string;
  isDefault: boolean;
}

interface ProfileAddressManagerProps {
  onAddressSelect?: (address: SavedAddress) => void;
  allowSelection?: boolean;
  className?: string;
}

export const ProfileAddressManager: React.FC<ProfileAddressManagerProps> = ({
  onAddressSelect,
  allowSelection = false,
  className = ''
}) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [cities] = useState<City[]>(cityService.getCities());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    nickname: '',
    address: '',
    coordinates: { lat: 0, lng: 0 },
    cityId: cityService.getCurrentCity().id,
    deliveryInstructions: '',
    isDefault: false
  });

  useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      // Get all saved locations and convert to saved addresses
      const savedLocations = await locationStorageService.getRecentLocations();
      const savedAddressData = localStorage.getItem('chopchop_saved_addresses');
      const addressExtras = savedAddressData ? JSON.parse(savedAddressData) : {};

      const convertedAddresses: SavedAddress[] = savedLocations.map(location => ({
        ...location,
        isDefault: addressExtras[location.id]?.isDefault || false,
        nickname: addressExtras[location.id]?.nickname || location.location.formattedAddress || 'Unnamed Address',
        deliveryInstructions: addressExtras[location.id]?.deliveryInstructions || '',
        isVerified: addressExtras[location.id]?.isVerified || false
      }));

      // Ensure only one default address
      const defaultAddresses = convertedAddresses.filter(addr => addr.isDefault);
      if (defaultAddresses.length > 1) {
        convertedAddresses.forEach((addr, index) => {
          addr.isDefault = index === 0 && defaultAddresses.includes(addr);
        });
        saveAddressExtras(convertedAddresses);
      }

      setAddresses(convertedAddresses);
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      setAddresses([]);
    }
  };

  const saveAddressExtras = (addressList: SavedAddress[]) => {
    try {
      const addressExtras = addressList.reduce((acc, address) => {
        acc[address.id] = {
          nickname: address.nickname,
          isDefault: address.isDefault,
          deliveryInstructions: address.deliveryInstructions,
          isVerified: address.isVerified
        };
        return acc;
      }, {} as Record<string, any>);

      localStorage.setItem('chopchop_saved_addresses', JSON.stringify(addressExtras));
    } catch (error) {
      console.error('Error saving address extras:', error);
    }
  };

  const handleAddAddress = async () => {
    if (!formData.nickname.trim() || !formData.address.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create location data in proper LocationResult format
      const locationData: LocationResult = {
        placeId: `manual_${Date.now()}`,
        formattedAddress: formData.address,
        coordinates: formData.coordinates,
        addressComponents: {
          street: formData.address, // Basic fallback
          city: 'Lagos', // Default city
          state: 'Lagos State',
          country: 'Nigeria'
        }
      };

      // Save location using storage service
      await locationStorageService.saveRecentLocation(locationData);

      // Create new address (generate an ID since saveRecentLocation doesn't return one)
      const newAddress: SavedAddress = {
        id: Date.now().toString(),
        location: locationData,
        timestamp: Date.now(),
        usage_count: 1,
        nickname: formData.nickname,
        isDefault: formData.isDefault,
        deliveryInstructions: formData.deliveryInstructions,
        isVerified: false
      };

      // If this is set as default, remove default from others
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: formData.isDefault ? false : addr.isDefault
      }));

      updatedAddresses.push(newAddress);
      setAddresses(updatedAddresses);
      saveAddressExtras(updatedAddresses);

      // Reset form
      setFormData({
        nickname: '',
        address: '',
        coordinates: { lat: 0, lng: 0 },
        cityId: cityService.getCurrentCity().id,
        deliveryInstructions: '',
        isDefault: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  const handleEditAddress = (address: SavedAddress) => {
    setEditingAddress(address);
    setFormData({
      nickname: address.nickname,
      address: address.location.formattedAddress,
      coordinates: address.location.coordinates,
      cityId: address.location.coordinates ? getCityFromCoordinates(address.location.coordinates) : cityService.getCurrentCity().id,
      deliveryInstructions: address.deliveryInstructions || '',
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    const updatedAddresses = addresses.map(addr => {
      if (addr.id === editingAddress.id) {
        return {
          ...addr,
          nickname: formData.nickname,
          deliveryInstructions: formData.deliveryInstructions,
          isDefault: formData.isDefault
        };
      }
      // If new address is set as default, remove default from others
      return formData.isDefault ? { ...addr, isDefault: false } : addr;
    });

    setAddresses(updatedAddresses);
    saveAddressExtras(updatedAddresses);

    // Reset form
    setEditingAddress(null);
    setShowAddForm(false);
    setFormData({
      nickname: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
      cityId: cityService.getCurrentCity().id,
      deliveryInstructions: '',
      isDefault: false
    });
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // If deleted address was default and there are other addresses, make first one default
      if (addresses.find(addr => addr.id === addressId)?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      setAddresses(updatedAddresses);
      saveAddressExtras(updatedAddresses);

      // Remove from location storage (method not available, would need implementation)
      // locationStorageService.removeLocation(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));

    setAddresses(updatedAddresses);
    saveAddressExtras(updatedAddresses);
  };

  const getCityFromCoordinates = (coordinates: { lat: number; lng: number }): string => {
    for (const city of cities) {
      if (cityService.isWithinCityBounds(city.id, coordinates.lat, coordinates.lng)) {
        return city.id;
      }
    }
    return cityService.getCurrentCity().id;
  };

  const getAddressCity = (address: SavedAddress): City | null => {
    if (address.location.coordinates) {
      const cityId = getCityFromCoordinates(address.location.coordinates);
      return cityService.getCityById(cityId);
    }
    return null;
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Delivery Addresses</h2>
          <p className="text-gray-600">Manage your saved addresses for quick ordering</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Add New Address
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-4">Add your first delivery address to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => {
            const city = getAddressCity(address);
            return (
              <div 
                key={address.id}
                className={`p-4 bg-white border-2 rounded-xl transition-all duration-200 ${
                  address.isDefault 
                    ? 'border-orange-200 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${allowSelection ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={() => allowSelection && onAddressSelect?.(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{address.nickname}</h3>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                      {address.isVerified && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">
                          Verified
                        </span>
                      )}
                      {city && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {city.name}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{address.location.formattedAddress}</p>
                    
                    {address.deliveryInstructions && (
                      <p className="text-sm text-gray-500 italic">
                        📝 {address.deliveryInstructions}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Added {new Date(address.timestamp).toLocaleDateString()}</span>
                      {city && cityService.canDeliverToLocation(city.id, address.location.coordinates.lat, address.location.coordinates.lng) ? (
                        <span className="text-green-600">✓ Delivery available</span>
                      ) : (
                        <span className="text-red-600">⚠️ Outside delivery zone</span>
                      )}
                    </div>
                  </div>

                  {!allowSelection && (
                    <div className="flex items-center gap-2 ml-4">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Nickname *
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g., Home, Office, Apartment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter complete address including landmarks"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}, {city.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.deliveryInstructions}
                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                    placeholder="e.g., Ring the bell, Call when you arrive, Leave at the gate"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    setFormData({
                      nickname: '',
                      address: '',
                      coordinates: { lat: 0, lng: 0 },
                      cityId: cityService.getCurrentCity().id,
                      deliveryInstructions: '',
                      isDefault: false
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};