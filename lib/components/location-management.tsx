// Location Management Dashboard
import React, { useState, useEffect } from 'react';
import { UserAddress } from '../services/user-profile';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLocationFlow } from '../hooks/useLocationFlow';
import { locationStorageService } from '../services/location-storage';

interface LocationManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationManagement: React.FC<LocationManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    addresses, 
    updateAddress, 
    removeAddress, 
    setDefaultAddress,
    getDefaultAddress 
  } = useUserProfile();
  
  const { 
    startLocationPicking,
    saveCurrentLocation,
    recentLocations
  } = useLocationFlow({ autoSave: false });

  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [editForm, setEditForm] = useState({
    label: '',
    instructions: ''
  });
  const [storageStats, setStorageStats] = useState({ totalSize: 0, itemCount: 0 });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultAddress = getDefaultAddress();

  // Load storage statistics and search history
  useEffect(() => {
    const loadData = async () => {
      const stats = locationStorageService.getStorageStats();
      setStorageStats(stats);
      
      const history = await locationStorageService.getSearchHistory();
      setSearchHistory(history);
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setEditForm({
      label: address.label,
      instructions: address.instructions || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAddress) return;
    
    setIsLoading(true);
    try {
      await updateAddress(editingAddress.id, {
        label: editForm.label,
        instructions: editForm.instructions
      });
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to update address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setIsLoading(true);
    try {
      await removeAddress(addressId);
    } catch (error) {
      console.error('Failed to remove address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setIsLoading(true);
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error('Failed to set default address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddCurrent = async () => {
    setIsLoading(true);
    try {
      await saveCurrentLocation('Quick Location');
    } catch (error) {
      console.error('Failed to add current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearchHistory = async () => {
    if (!confirm('Clear all search history?')) return;
    
    try {
      await locationStorageService.saveLocationPreferences({ recentSearchQueries: [] });
      setSearchHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear all cached location data? This will remove stored searches and improve performance.')) return;
    
    try {
      await locationStorageService.clearLocationCache();
      const stats = locationStorageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await locationStorageService.exportLocationData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chopchop-locations-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h2 className="text-2xl font-bold">Manage Locations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <button
                  onClick={handleQuickAddCurrent}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Add Current Location</span>
                </button>
                
                <button
                  onClick={startLocationPicking}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add New Location</span>
                </button>
              </div>

              {/* Storage Stats */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2">Storage Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stored Items:</span>
                    <span className="font-medium">{storageStats.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cache Size:</span>
                    <span className="font-medium">{(storageStats.totalSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recent Locations:</span>
                    <span className="font-medium">{recentLocations.length}</span>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Data Management</h3>
                <button
                  onClick={handleExportData}
                  className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Export Data
                </button>
                <button
                  onClick={handleClearCache}
                  className="w-full bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Clear Cache
                </button>
                <button
                  onClick={handleClearSearchHistory}
                  className="w-full bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Clear Search History
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Saved Addresses */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Saved Addresses ({addresses.length})</h3>
              
              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600">No saved addresses yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add a location to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-white border rounded-lg p-4 ${
                        address.isDefault ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      {editingAddress?.id === address.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.label}
                            onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Address label"
                          />
                          <textarea
                            value={editForm.instructions}
                            onChange={(e) => setEditForm(prev => ({ ...prev, instructions: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Delivery instructions"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              disabled={isLoading}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAddress(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{address.label}</h4>
                                {address.isDefault && (
                                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {address.street}, {address.city}, {address.state}
                              </p>
                              {address.instructions && (
                                <p className="text-gray-500 text-xs">
                                  📝 {address.instructions}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {!address.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(address.id)}
                                  disabled={isLoading}
                                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                >
                                  Set Default
                                </button>
                              )}
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Searches</h3>
                  <button
                    onClick={handleClearSearchHistory}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((query, index) => (
                      <span
                        key={index}
                        className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border"
                      >
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};