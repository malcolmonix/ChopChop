// Enhanced Location Storage Service
import { UserAddress } from './user-profile';
import { LocationResult } from './location-service';

interface StoredLocation {
  id: string;
  location: LocationResult;
  timestamp: number;
  usage_count: number;
}

interface LocationCache {
  coordinates: { [key: string]: LocationResult };
  addresses: { [key: string]: LocationResult };
  places: { [key: string]: LocationResult };
}

interface LocationPreferences {
  defaultSearchRadius: number;
  preferredMapZoom: number;
  autoSaveLocations: boolean;
  validateDeliveryZone: boolean;
  lastUsedPickerType: 'search' | 'map';
  recentSearchQueries: string[];
}

class LocationStorageService {
  private static instance: LocationStorageService;
  private readonly STORAGE_PREFIX = 'chopchop_location_';
  private readonly MAX_RECENT_LOCATIONS = 10;
  private readonly MAX_CACHE_SIZE = 100;
  private readonly CACHE_EXPIRY_DAYS = 7;

  static getInstance(): LocationStorageService {
    if (!LocationStorageService.instance) {
      LocationStorageService.instance = new LocationStorageService();
    }
    return LocationStorageService.instance;
  }

  // === Recent Locations Management ===
  
  async saveRecentLocation(location: LocationResult): Promise<void> {
    try {
      const recent = await this.getRecentLocations();
      
      // Remove if already exists to avoid duplicates
      const filtered = recent.filter(r => r.location.placeId !== location.placeId);
      
      const newLocation: StoredLocation = {
        id: location.placeId,
        location,
        timestamp: Date.now(),
        usage_count: this.getLocationUsageCount(location.placeId) + 1
      };

      // Add to beginning and limit size
      const updated = [newLocation, ...filtered].slice(0, this.MAX_RECENT_LOCATIONS);
      
      localStorage.setItem(
        `${this.STORAGE_PREFIX}recent_locations`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Failed to save recent location:', error);
    }
  }

  async getRecentLocations(): Promise<StoredLocation[]> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}recent_locations`);
      if (!stored) return [];

      const locations: StoredLocation[] = JSON.parse(stored);
      
      // Filter out expired locations
      const cutoff = Date.now() - (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      return locations.filter(loc => loc.timestamp > cutoff);
    } catch (error) {
      console.error('Failed to get recent locations:', error);
      return [];
    }
  }

  async clearRecentLocations(): Promise<void> {
    localStorage.removeItem(`${this.STORAGE_PREFIX}recent_locations`);
  }

  // === Location Cache Management ===

  async cacheLocationResult(key: string, location: LocationResult, type: 'coordinate' | 'address' | 'place'): Promise<void> {
    try {
      const cache = await this.getLocationCache();
      const targetCache = cache[type === 'coordinate' ? 'coordinates' : type === 'address' ? 'addresses' : 'places'];

      targetCache[key] = location;

      // Limit cache size
      const entries = Object.entries(targetCache);
      if (entries.length > this.MAX_CACHE_SIZE) {
        // Remove oldest entries (simple approach - could be improved with LRU)
        const sorted = entries.slice(-this.MAX_CACHE_SIZE);
        cache[type === 'coordinate' ? 'coordinates' : type === 'address' ? 'addresses' : 'places'] = 
          Object.fromEntries(sorted);
      }

      localStorage.setItem(`${this.STORAGE_PREFIX}cache`, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache location result:', error);
    }
  }

  async getCachedLocation(key: string, type: 'coordinate' | 'address' | 'place'): Promise<LocationResult | null> {
    try {
      const cache = await this.getLocationCache();
      const targetCache = cache[type === 'coordinate' ? 'coordinates' : type === 'address' ? 'addresses' : 'places'];
      return targetCache[key] || null;
    } catch (error) {
      console.error('Failed to get cached location:', error);
      return null;
    }
  }

  private async getLocationCache(): Promise<LocationCache> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}cache`);
      if (!stored) {
        return { coordinates: {}, addresses: {}, places: {} };
      }
      return JSON.parse(stored);
    } catch (error) {
      return { coordinates: {}, addresses: {}, places: {} };
    }
  }

  async clearLocationCache(): Promise<void> {
    localStorage.removeItem(`${this.STORAGE_PREFIX}cache`);
  }

  // === Search History Management ===

  async saveSearchQuery(query: string): Promise<void> {
    try {
      const preferences = await this.getLocationPreferences();
      
      // Remove if already exists
      const filtered = preferences.recentSearchQueries.filter(q => 
        q.toLowerCase() !== query.toLowerCase()
      );
      
      // Add to beginning and limit to 10
      preferences.recentSearchQueries = [query, ...filtered].slice(0, 10);
      
      await this.saveLocationPreferences(preferences);
    } catch (error) {
      console.error('Failed to save search query:', error);
    }
  }

  async getSearchHistory(): Promise<string[]> {
    const preferences = await this.getLocationPreferences();
    return preferences.recentSearchQueries;
  }

  // === Preferences Management ===

  async getLocationPreferences(): Promise<LocationPreferences> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}preferences`);
      if (!stored) {
        return this.getDefaultPreferences();
      }
      
      const preferences = JSON.parse(stored);
      return { ...this.getDefaultPreferences(), ...preferences };
    } catch (error) {
      console.error('Failed to get location preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  async saveLocationPreferences(preferences: Partial<LocationPreferences>): Promise<void> {
    try {
      const current = await this.getLocationPreferences();
      const updated = { ...current, ...preferences };
      
      localStorage.setItem(
        `${this.STORAGE_PREFIX}preferences`,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Failed to save location preferences:', error);
    }
  }

  private getDefaultPreferences(): LocationPreferences {
    return {
      defaultSearchRadius: 5000, // 5km
      preferredMapZoom: 15,
      autoSaveLocations: false,
      validateDeliveryZone: true,
      lastUsedPickerType: 'search',
      recentSearchQueries: []
    };
  }

  // === Usage Analytics ===

  private getLocationUsageCount(placeId: string): number {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}usage_${placeId}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  async incrementLocationUsage(placeId: string): Promise<void> {
    try {
      const count = this.getLocationUsageCount(placeId) + 1;
      localStorage.setItem(`${this.STORAGE_PREFIX}usage_${placeId}`, count.toString());
    } catch (error) {
      console.error('Failed to increment location usage:', error);
    }
  }

  // === Address Validation Cache ===

  async cacheAddressValidation(address: string, isValid: boolean, errors?: string[]): Promise<void> {
    try {
      const validationCache = await this.getAddressValidationCache();
      validationCache[address.toLowerCase()] = {
        isValid,
        errors: errors || [],
        timestamp: Date.now()
      };

      localStorage.setItem(
        `${this.STORAGE_PREFIX}validation_cache`,
        JSON.stringify(validationCache)
      );
    } catch (error) {
      console.error('Failed to cache address validation:', error);
    }
  }

  async getCachedAddressValidation(address: string): Promise<{ isValid: boolean; errors: string[] } | null> {
    try {
      const validationCache = await this.getAddressValidationCache();
      const cached = validationCache[address.toLowerCase()];
      
      if (!cached) return null;

      // Check if cache is still valid (24 hours)
      const isExpired = Date.now() - cached.timestamp > (24 * 60 * 60 * 1000);
      if (isExpired) {
        delete validationCache[address.toLowerCase()];
        localStorage.setItem(
          `${this.STORAGE_PREFIX}validation_cache`,
          JSON.stringify(validationCache)
        );
        return null;
      }

      return { isValid: cached.isValid, errors: cached.errors };
    } catch (error) {
      console.error('Failed to get cached address validation:', error);
      return null;
    }
  }

  private async getAddressValidationCache(): Promise<{ [key: string]: { isValid: boolean; errors: string[]; timestamp: number } }> {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_PREFIX}validation_cache`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  // === Utility Methods ===

  async exportLocationData(): Promise<string> {
    try {
      const data = {
        recentLocations: await this.getRecentLocations(),
        preferences: await this.getLocationPreferences(),
        searchHistory: await this.getSearchHistory(),
        cache: await this.getLocationCache(),
        timestamp: new Date().toISOString()
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export location data:', error);
      return '';
    }
  }

  async importLocationData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.recentLocations) {
        localStorage.setItem(
          `${this.STORAGE_PREFIX}recent_locations`,
          JSON.stringify(data.recentLocations)
        );
      }

      if (data.preferences) {
        await this.saveLocationPreferences(data.preferences);
      }

      if (data.cache) {
        localStorage.setItem(`${this.STORAGE_PREFIX}cache`, JSON.stringify(data.cache));
      }

      return true;
    } catch (error) {
      console.error('Failed to import location data:', error);
      return false;
    }
  }

  async clearAllLocationData(): Promise<void> {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear location data:', error);
    }
  }

  // === Storage Statistics ===

  getStorageStats(): { totalSize: number; itemCount: number; cacheHitRate?: number } {
    let totalSize = 0;
    let itemCount = 0;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
            itemCount++;
          }
        }
      });

      return {
        totalSize,
        itemCount,
        cacheHitRate: this.calculateCacheHitRate()
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalSize: 0, itemCount: 0 };
    }
  }

  private calculateCacheHitRate(): number {
    // Simple cache hit rate calculation - could be improved
    try {
      const hits = parseInt(localStorage.getItem(`${this.STORAGE_PREFIX}cache_hits`) || '0', 10);
      const misses = parseInt(localStorage.getItem(`${this.STORAGE_PREFIX}cache_misses`) || '0', 10);
      
      if (hits + misses === 0) return 0;
      return (hits / (hits + misses)) * 100;
    } catch (error) {
      return 0;
    }
  }
}

// Export singleton instance
export const locationStorageService = LocationStorageService.getInstance();