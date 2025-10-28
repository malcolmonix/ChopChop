// User Profile Service
export interface UserAddress {
  id: string;
  label: string; // e.g., 'Home', 'Work', 'Other'
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  instructions?: string; // Special delivery instructions
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: UserAddress[];
  defaultAddressId?: string;
  preferences: {
    notifications: boolean;
    marketing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

class UserProfileService {
  private static instance: UserProfileService;

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  // Get user profile from localStorage (simplified for now)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const localProfile = this.getLocalProfile(userId);
      return localProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Save user profile to localStorage
  async saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    try {
      const now = new Date();
      const profileData = {
        ...profile,
        id: userId,
        updatedAt: now,
        createdAt: profile.createdAt || now,
      };

      this.saveLocalProfile(userId, profileData as UserProfile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Update specific profile fields
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const localProfile = this.getLocalProfile(userId);
      if (localProfile) {
        this.saveLocalProfile(userId, { ...localProfile, ...updateData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  // Add new address
  async addAddress(userId: string, address: Omit<UserAddress, 'id'>): Promise<string> {
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAddress: UserAddress = {
      ...address,
      id: addressId,
    };

    try {
      const profile = await this.getUserProfile(userId);
      if (profile) {
        const updatedAddresses = [...profile.addresses, newAddress];
        
        // If this is the first address or marked as default, set it as default
        if (updatedAddresses.length === 1 || address.isDefault) {
          updatedAddresses.forEach(addr => addr.isDefault = addr.id === addressId);
        }

        await this.updateProfile(userId, { 
          addresses: updatedAddresses,
          defaultAddressId: address.isDefault ? addressId : profile.defaultAddressId,
        });
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }

    return addressId;
  }

  // Update existing address
  async updateAddress(userId: string, addressId: string, updates: Partial<UserAddress>): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (profile) {
        const updatedAddresses = profile.addresses.map(addr => 
          addr.id === addressId ? { ...addr, ...updates } : addr
        );

        // Handle default address change
        if (updates.isDefault) {
          updatedAddresses.forEach(addr => addr.isDefault = addr.id === addressId);
        }

        await this.updateProfile(userId, { 
          addresses: updatedAddresses,
          defaultAddressId: updates.isDefault ? addressId : profile.defaultAddressId,
        });
      }
    } catch (error) {
      console.error('Error updating address:', error);
    }
  }

  // Remove address
  async removeAddress(userId: string, addressId: string): Promise<void> {
    try {
      const profile = await this.getUserProfile(userId);
      if (profile) {
        const updatedAddresses = profile.addresses.filter(addr => addr.id !== addressId);
        
        // If removed address was default, set first address as default
        let newDefaultId = profile.defaultAddressId;
        if (profile.defaultAddressId === addressId && updatedAddresses.length > 0) {
          updatedAddresses[0].isDefault = true;
          newDefaultId = updatedAddresses[0].id;
        }

        await this.updateProfile(userId, { 
          addresses: updatedAddresses,
          defaultAddressId: newDefaultId,
        });
      }
    } catch (error) {
      console.error('Error removing address:', error);
    }
  }

  // Get default address
  getDefaultAddress(profile: UserProfile): UserAddress | null {
    if (!profile.addresses.length) return null;
    
    return profile.addresses.find(addr => addr.isDefault) || profile.addresses[0];
  }

  // Local storage methods
  private getLocalProfile(userId: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(`user_profile_${userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error reading local profile:', error);
      return null;
    }
  }

  private saveLocalProfile(userId: string, profile: UserProfile): void {
    try {
      localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving local profile:', error);
    }
  }

  // Create initial profile for new users
  async createInitialProfile(userId: string, initialData: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      addresses: [],
      preferences: {
        notifications: true,
        marketing: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUserProfile(userId, profile);
    return profile;
  }

  // Search addresses by query
  searchAddresses(profile: UserProfile, query: string): UserAddress[] {
    if (!query.trim()) return profile.addresses;
    
    const searchTerm = query.toLowerCase();
    return profile.addresses.filter(addr => 
      addr.label.toLowerCase().includes(searchTerm) ||
      addr.street.toLowerCase().includes(searchTerm) ||
      addr.city.toLowerCase().includes(searchTerm)
    );
  }
}

export const userProfileService = UserProfileService.getInstance();