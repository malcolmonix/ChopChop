// User Profile Hook
import { useState, useEffect, useCallback } from 'react';
import { userProfileService, UserProfile, UserAddress } from '../services/user-profile';

// Simple mock user for now - replace with actual auth later
const mockUser = { uid: 'mock-user-123' };

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = mockUser; // Mock user for now

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let userProfile = await userProfileService.getUserProfile(user.uid);
      
      // Create initial profile if doesn't exist
      if (!userProfile) {
        userProfile = await userProfileService.createInitialProfile(user.uid, {
          name: '',
          email: '',
          phone: '',
        });
      }
      
      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      setError(null);
      await userProfileService.updateProfile(user.uid, updates);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  }, [user, profile]);

  // Add address
  const addAddress = useCallback(async (address: Omit<UserAddress, 'id'>) => {
    if (!user) return '';

    try {
      setError(null);
      const addressId = await userProfileService.addAddress(user.uid, address);
      await loadProfile(); // Reload to get updated addresses
      return addressId;
    } catch (err) {
      console.error('Error adding address:', err);
      setError('Failed to add address');
      return '';
    }
  }, [user, loadProfile]);

  // Update address
  const updateAddress = useCallback(async (addressId: string, updates: Partial<UserAddress>) => {
    if (!user) return;

    try {
      setError(null);
      await userProfileService.updateAddress(user.uid, addressId, updates);
      await loadProfile(); // Reload to get updated addresses
    } catch (err) {
      console.error('Error updating address:', err);
      setError('Failed to update address');
    }
  }, [user, loadProfile]);

  // Remove address
  const removeAddress = useCallback(async (addressId: string) => {
    if (!user) return;

    try {
      setError(null);
      await userProfileService.removeAddress(user.uid, addressId);
      await loadProfile(); // Reload to get updated addresses
    } catch (err) {
      console.error('Error removing address:', err);
      setError('Failed to remove address');
    }
  }, [user, loadProfile]);

  // Get default address
  const getDefaultAddress = useCallback((): UserAddress | null => {
    if (!profile) return null;
    return userProfileService.getDefaultAddress(profile);
  }, [profile]);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId: string) => {
    if (!user || !profile) return;

    try {
      setError(null);
      // Update all addresses to set the new default
      const updatedAddresses = profile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      await userProfileService.updateProfile(user.uid, {
        addresses: updatedAddresses,
        defaultAddressId: addressId,
      });

      await loadProfile();
    } catch (err) {
      console.error('Error setting default address:', err);
      setError('Failed to set default address');
    }
  }, [user, profile, loadProfile]);

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    addresses: profile?.addresses || [],
    isLoading: loading,
    updateProfile,
    addAddress,
    updateAddress,
    removeAddress,
    getDefaultAddress,
    setDefaultAddress,
    reload: loadProfile,
  };
}

// Hook for address search
export function useAddressSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserAddress[]>([]);
  const { profile } = useUserProfile();

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (profile) {
      const searchResults = userProfileService.searchAddresses(profile, searchQuery);
      setResults(searchResults);
    }
  }, [profile]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  useEffect(() => {
    if (profile && query) {
      const searchResults = userProfileService.searchAddresses(profile, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [profile, query]);

  return {
    query,
    results,
    search,
    clearSearch,
  };
}