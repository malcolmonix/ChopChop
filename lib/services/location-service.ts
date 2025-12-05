// Enhanced Location Service with Storage Integration
import { locationStorageService } from './location-storage';

// Type declarations for Google Maps (simplified)
declare global {
  interface Window {
    google: any;
  }
  const google: any;
}

export interface LocationResult {
  placeId: string;
  formattedAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

class LocationService {
  private static instance: LocationService;
  private googleMaps: any = null;
  private placesService: any = null;
  private autocompleteService: any = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Initialize Google Maps API
  async initializeGoogleMaps(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        this.googleMaps = google.maps;
        this.initializeServices();
        resolve();
        return;
      }

      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.googleMaps = google.maps;
        this.initializeServices();
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private initializeServices(): void {
    if (!this.googleMaps) return;

    // Create a hidden div for places service
    const div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);

    this.placesService = new this.googleMaps.places.PlacesService(div);
    this.autocompleteService = new this.googleMaps.places.AutocompleteService();
  }

  // Enhanced fallback autocomplete using multiple APIs
  private async fallbackAutocomplete(input: string): Promise<PlaceAutocompleteResult[]> {
    try {
      // Try multiple services for better coverage
      const results = await Promise.allSettled([
        this.searchNominatim(input),
        this.searchPhoton(input),
        this.searchLocal(input)
      ]);

      const allResults: PlaceAutocompleteResult[] = [];

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          allResults.push(...result.value);
        }
      });

      // Remove duplicates and limit results
      const uniqueResults = this.deduplicateResults(allResults);
      return uniqueResults.slice(0, 8);
    } catch (error) {
      console.error('Enhanced fallback autocomplete failed:', error);
      return [];
    }
  }

  // Search using Nominatim (OpenStreetMap)
  private async searchNominatim(input: string): Promise<PlaceAutocompleteResult[]> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&countrycodes=ng&addressdetails=1&dedupe=1`
      );
      const data = await response.json();

      return data.map((item: any) => ({
        placeId: `nom_${item.place_id}` || Math.random().toString(),
        description: item.display_name,
        mainText: item.name || this.extractMainText(item.display_name),
        secondaryText: this.extractSecondaryText(item.display_name, item.name),
      }));
    } catch (error) {
      console.error('Nominatim search failed:', error);
      return [];
    }
  }

  // Search using Photon (alternative OpenStreetMap geocoder)
  private async searchPhoton(input: string): Promise<PlaceAutocompleteResult[]> {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=5&osm_tag=place&osm_tag=amenity&osm_tag=shop&osm_tag=highway&bbox=2.7,4.3,14.7,13.9`
      );
      const data = await response.json();

      return data.features?.map((item: any) => ({
        placeId: `photon_${item.properties.osm_id}` || Math.random().toString(),
        description: this.formatPhotonAddress(item.properties),
        mainText: item.properties.name || item.properties.street || this.extractMainText(this.formatPhotonAddress(item.properties)),
        secondaryText: this.formatPhotonSecondary(item.properties),
      })) || [];
    } catch (error) {
      console.error('Photon search failed:', error);
      return [];
    }
  }

  // Search local Nigerian landmarks and popular locations
  private async searchLocal(input: string): Promise<PlaceAutocompleteResult[]> {
    const localPlaces = [
      // Lagos landmarks
      { name: 'Victoria Island', area: 'Lagos Island', state: 'Lagos', type: 'area' },
      { name: 'Ikoyi', area: 'Lagos Island', state: 'Lagos', type: 'area' },
      { name: 'Lekki Phase 1', area: 'Lekki', state: 'Lagos', type: 'area' },
      { name: 'Surulere', area: 'Lagos Mainland', state: 'Lagos', type: 'area' },
      { name: 'Ikeja', area: 'Lagos Mainland', state: 'Lagos', type: 'area' },
      { name: 'Yaba', area: 'Lagos Mainland', state: 'Lagos', type: 'area' },
      { name: 'Gbagada', area: 'Lagos Mainland', state: 'Lagos', type: 'area' },
      { name: 'Ajah', area: 'Lekki', state: 'Lagos', type: 'area' },
      { name: 'Magodo', area: 'Lagos Mainland', state: 'Lagos', type: 'area' },
      { name: 'Festac Town', area: 'Amuwo Odofin', state: 'Lagos', type: 'area' },

      // Abuja areas
      { name: 'Wuse 2', area: 'Abuja Municipal', state: 'FCT', type: 'area' },
      { name: 'Garki', area: 'Abuja Municipal', state: 'FCT', type: 'area' },
      { name: 'Maitama', area: 'Abuja Municipal', state: 'FCT', type: 'area' },
      { name: 'Asokoro', area: 'Abuja Municipal', state: 'FCT', type: 'area' },
      { name: 'Gwarinpa', area: 'Abuja Municipal', state: 'FCT', type: 'area' },

      // Popular landmarks
      { name: 'National Theatre Lagos', area: 'Surulere', state: 'Lagos', type: 'landmark' },
      { name: 'Lagos Airport', area: 'Ikeja', state: 'Lagos', type: 'airport' },
      { name: 'University of Lagos', area: 'Yaba', state: 'Lagos', type: 'university' },
      { name: 'Shoprite', area: 'Various Locations', state: 'Lagos', type: 'shopping' },
      { name: 'Palms Shopping Mall', area: 'Lekki', state: 'Lagos', type: 'shopping' },
    ];

    const query = input.toLowerCase();
    const matches = localPlaces.filter(place =>
      place.name.toLowerCase().includes(query) ||
      place.area.toLowerCase().includes(query)
    );

    return matches.map(place => ({
      placeId: `local_${place.name.replace(/\s+/g, '_').toLowerCase()}`,
      description: `${place.name}, ${place.area}, ${place.state}, Nigeria`,
      mainText: place.name,
      secondaryText: `${place.area}, ${place.state}`,
    }));
  }

  // Helper methods for formatting
  private extractMainText(displayName: string): string {
    const parts = displayName.split(',');
    return parts[0]?.trim() || displayName;
  }

  private extractSecondaryText(displayName: string, name?: string): string {
    const parts = displayName.split(',');
    if (name) {
      return parts.slice(1).join(',').trim();
    }
    return parts.slice(1, 3).join(',').trim();
  }

  private formatPhotonAddress(properties: any): string {
    const parts: string[] = [];
    if (properties.name) parts.push(properties.name);
    if (properties.street) parts.push(properties.street);
    if (properties.city) parts.push(properties.city);
    if (properties.state) parts.push(properties.state);
    parts.push('Nigeria');
    return parts.join(', ');
  }

  private formatPhotonSecondary(properties: any): string {
    const parts: string[] = [];
    if (properties.city && properties.city !== properties.name) parts.push(properties.city);
    if (properties.state) parts.push(properties.state);
    return parts.join(', ');
  }

  // Remove duplicate results
  private deduplicateResults(results: PlaceAutocompleteResult[]): PlaceAutocompleteResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.mainText.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Get autocomplete suggestions with caching and search history
  async getAutocompleteSuggestions(input: string, location?: { lat: number; lng: number }): Promise<PlaceAutocompleteResult[]> {
    // Save search query to history
    if (input.length > 2) {
      await locationStorageService.saveSearchQuery(input);
    }

    // Create cache key
    const locationKey = location ? `${location.lat.toFixed(4)},${location.lng.toFixed(4)}` : 'no-location';
    const cacheKey = `${input.toLowerCase()}_${locationKey}`;

    // Check cache first
    const cached = await locationStorageService.getCachedLocation(cacheKey, 'address');
    if (cached && Array.isArray(cached)) {
      return cached as any; // Type assertion for autocomplete results
    }

    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        // Fallback to free geocoding service
        this.fallbackAutocomplete(input).then(async (results) => {
          if (results.length > 0) {
            await locationStorageService.cacheLocationResult(cacheKey, results as any, 'address');
          }
          resolve(results);
        }).catch(() => resolve([]));
        return;
      }

      // Google Maps fallback disabled for build compatibility
      // Use free service fallback instead
      this.fallbackAutocomplete(input).then(async (results) => {
        if (results.length > 0) {
          await locationStorageService.cacheLocationResult(cacheKey, results as any, 'address');
        }
        resolve(results);
      }).catch(() => resolve([]));
    });
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string): Promise<LocationResult | null> {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        // Fallback: try to geocode using the placeId as address
        this.fallbackGeocode(placeId).then(resolve).catch(() => resolve(null));
        return;
      }

      const request = {
        placeId,
        fields: ['formatted_address', 'geometry', 'address_components'],
      };

      this.placesService.getDetails(request, (place: any, status: any) => {
        if (status === 'OK' && place) {
          const result = this.parsePlaceResult(place);
          resolve(result);
        } else {
          // Fallback
          this.fallbackGeocode(placeId).then(resolve).catch(() => resolve(null));
        }
      });
    });
  }

  // Reverse geocode coordinates to address with caching
  async reverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
    // Create cache key
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    // Check cache first
    const cached = await locationStorageService.getCachedLocation(cacheKey, 'coordinate');
    if (cached) {
      return cached;
    }

    return new Promise((resolve, reject) => {
      if (!this.googleMaps) {
        // Use fallback reverse geocoding
        this.fallbackReverseGeocode(lat, lng).then(async (result) => {
          if (result) {
            await locationStorageService.cacheLocationResult(cacheKey, result, 'coordinate');
          }
          resolve(result);
        }).catch(() => resolve(null));
        return;
      }

      const geocoder = new this.googleMaps.Geocoder();
      const latlng = new this.googleMaps.LatLng(lat, lng);

      geocoder.geocode({ location: latlng }, async (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const result = this.parseGeocodeResult(results[0]);
          // Cache the result
          await locationStorageService.cacheLocationResult(cacheKey, result, 'coordinate');
          resolve(result);
        } else {
          // Fallback
          this.fallbackReverseGeocode(lat, lng).then(async (result) => {
            if (result) {
              await locationStorageService.cacheLocationResult(cacheKey, result, 'coordinate');
            }
            resolve(result);
          }).catch(() => resolve(null));
        }
      });
    });
  }

  // Get current user location with improved reliability
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported');
        resolve(null);
        return;
      }

      const highAccuracyOptions = {
        enableHighAccuracy: true,
        timeout: 30000, // Increased timeout for better reliability
        maximumAge: 30000, // Allow cached position up to 30 seconds
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got high accuracy position:', position.coords.latitude, position.coords.longitude);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('High accuracy geolocation failed, trying low accuracy:', error.message);
          // Fallback to low accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Got low accuracy position:', position.coords.latitude, position.coords.longitude);
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error2) => {
              console.error('Geolocation failed completely:', error2.message);
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 30000,
              maximumAge: 120000 // Allow older cached position as last resort
            }
          );
        },
        highAccuracyOptions
      );
    });
  }

  // Parse Google Places result
  private parsePlaceResult(place: any): LocationResult {
    const addressComponents = this.parseAddressComponents(place.address_components || []);

    return {
      placeId: place.place_id || '',
      formattedAddress: place.formatted_address || '',
      coordinates: {
        lat: place.geometry?.location?.lat() || 0,
        lng: place.geometry?.location?.lng() || 0,
      },
      addressComponents,
    };
  }

  // Parse Google Geocoder result
  private parseGeocodeResult(result: any): LocationResult {
    const addressComponents = this.parseAddressComponents(result.address_components);

    return {
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
      },
      addressComponents,
    };
  }

  // Parse address components from Google result
  private parseAddressComponents(components: any[]): LocationResult['addressComponents'] {
    const result: LocationResult['addressComponents'] = {};

    components.forEach(component => {
      const types = component.types;

      if (types.includes('street_number')) {
        result.street = (result.street || '') + component.long_name + ' ';
      } else if (types.includes('route')) {
        result.street = (result.street || '') + component.long_name;
      } else if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.long_name;
      } else if (types.includes('country')) {
        result.country = component.long_name;
      } else if (types.includes('postal_code')) {
        result.postalCode = component.long_name;
      }
    });

    // Clean up street address
    if (result.street) {
      result.street = result.street.trim();
    }

    return result;
  }

  // Fallback geocoding using a free service (for development)
  async fallbackGeocode(address: string): Promise<LocationResult | null> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=ng`);
      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        return {
          placeId: result.place_id?.toString() || '',
          formattedAddress: result.display_name,
          coordinates: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lng),
          },
          addressComponents: {
            street: result.display_name.split(',')[0],
            city: result.address?.city || result.address?.town || 'Lagos',
            state: result.address?.state || 'Lagos State',
            country: result.address?.country || 'Nigeria',
            postalCode: result.address?.postcode || '',
          },
        };
      }
      return null;
    } catch (error) {
      console.error('Fallback geocoding failed:', error);
      return null;
    }
  }

  // Fallback reverse geocoding using a free service
  async fallbackReverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
      const data = await response.json();

      if (data && data.display_name) {
        return {
          placeId: data.place_id?.toString() || '',
          formattedAddress: data.display_name,
          coordinates: { lat, lng },
          addressComponents: {
            street: data.address?.road || data.address?.house_number ? `${data.address.house_number || ''} ${data.address.road || ''}`.trim() : data.display_name.split(',')[0],
            city: data.address?.city || data.address?.town || data.address?.village || 'Lagos',
            state: data.address?.state || 'Lagos State',
            country: data.address?.country || 'Nigeria',
            postalCode: data.address?.postcode || '',
          },
        };
      }
      return null;
    } catch (error) {
      console.error('Fallback reverse geocoding failed:', error);
      return null;
    }
  }
}

export const locationService = LocationService.getInstance();
