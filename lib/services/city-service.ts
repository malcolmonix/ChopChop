// City Management Service for Uyo and Calabar
export interface City {
  id: string;
  name: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  deliveryRadius: number; // in kilometers
  isActive: boolean;
  restaurantCount: number;
  coverageAreas: string[];
}

export interface CityRestaurant {
  id: string;
  name: string;
  description: string;
  cityId: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  cuisineType: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
  featured: boolean;
  imageUrl?: string;
  minimumOrder: number;
}

class CityService {
  private static instance: CityService;

  static getInstance(): CityService {
    if (!CityService.instance) {
      CityService.instance = new CityService();
    }
    return CityService.instance;
  }

  // Available cities
  private cities: City[] = [
    {
      id: 'uyo',
      name: 'Uyo',
      state: 'Akwa Ibom',
      coordinates: { lat: 5.0378, lng: 7.9072 },
      bounds: {
        north: 5.1,
        south: 4.9,
        east: 8.0,
        west: 7.8
      },
      deliveryRadius: 25,
      isActive: true,
      restaurantCount: 45,
      coverageAreas: [
        'Uyo Urban',
        'Ikot Ekpene Road',
        'Aka Road',
        'Wellington Bassey Way',
        'Abak Road',
        'Airport Road',
        'Nwaniba',
        'Use Offot'
      ]
    },
    {
      id: 'calabar',
      name: 'Calabar',
      state: 'Cross River',
      coordinates: { lat: 4.9517, lng: 8.3220 },
      bounds: {
        north: 5.1,
        south: 4.8,
        east: 8.5,
        west: 8.1
      },
      deliveryRadius: 30,
      isActive: true,
      restaurantCount: 38,
      coverageAreas: [
        'Calabar Municipal',
        'Calabar South',
        'Unical Area',
        'Mary Slessor Avenue',
        'Murtala Mohammed Highway',
        'Parliamentary Extension',
        'State Housing',
        'Satellite Town'
      ]
    }
  ];

  // Sample restaurants for each city
  private restaurants: CityRestaurant[] = [
    // Uyo Restaurants
    {
      id: 'uyo-001',
      name: 'Akwa Palace Restaurant',
      description: 'Authentic Akwa Ibom cuisine and continental dishes',
      cityId: 'uyo',
      address: 'Wellington Bassey Way, Uyo',
      coordinates: { lat: 5.0401, lng: 7.9089 },
      cuisineType: ['Nigerian', 'Continental'],
      rating: 4.5,
      deliveryTime: '25-35 mins',
      deliveryFee: 500,
      isOpen: true,
      featured: true,
      minimumOrder: 2000,
      imageUrl: '/restaurants/akwa-palace.jpg'
    },
    {
      id: 'uyo-002',
      name: 'Capital Garden Restaurant',
      description: 'Fresh seafood and local delicacies',
      cityId: 'uyo',
      address: 'Aka Road, Uyo',
      coordinates: { lat: 5.0356, lng: 7.9045 },
      cuisineType: ['Seafood', 'Nigerian'],
      rating: 4.3,
      deliveryTime: '20-30 mins',
      deliveryFee: 400,
      isOpen: true,
      featured: false,
      minimumOrder: 1500,
      imageUrl: '/restaurants/capital-garden.jpg'
    },
    {
      id: 'uyo-003',
      name: 'Domino\'s Pizza Uyo',
      description: 'Hot, fresh pizza delivered to your door',
      cityId: 'uyo',
      address: 'Ikot Ekpene Road, Uyo',
      coordinates: { lat: 5.0423, lng: 7.9134 },
      cuisineType: ['Pizza', 'Fast Food'],
      rating: 4.2,
      deliveryTime: '15-25 mins',
      deliveryFee: 600,
      isOpen: true,
      featured: true,
      minimumOrder: 3000,
      imageUrl: '/restaurants/dominos-uyo.jpg'
    },
    {
      id: 'uyo-004',
      name: 'Silverbird Galleria Food Court',
      description: 'Multiple cuisine options in one location',
      cityId: 'uyo',
      address: 'Airport Road, Uyo',
      coordinates: { lat: 5.0467, lng: 7.9201 },
      cuisineType: ['International', 'Fast Food', 'Asian'],
      rating: 4.1,
      deliveryTime: '30-40 mins',
      deliveryFee: 700,
      isOpen: true,
      featured: false,
      minimumOrder: 2500,
      imageUrl: '/restaurants/silverbird-food-court.jpg'
    },
    {
      id: 'uyo-005',
      name: 'Afang Spot',
      description: 'Traditional Efik and Ibibio cuisine',
      cityId: 'uyo',
      address: 'Abak Road, Uyo',
      coordinates: { lat: 5.0234, lng: 7.8967 },
      cuisineType: ['Nigerian', 'Traditional'],
      rating: 4.4,
      deliveryTime: '20-30 mins',
      deliveryFee: 350,
      isOpen: true,
      featured: true,
      minimumOrder: 1200,
      imageUrl: '/restaurants/afang-spot.jpg'
    },

    // Calabar Restaurants
    {
      id: 'calabar-001',
      name: 'CrossRiver Restaurant',
      description: 'Premium dining with river views',
      cityId: 'calabar',
      address: 'Mary Slessor Avenue, Calabar',
      coordinates: { lat: 4.9587, lng: 8.3267 },
      cuisineType: ['Continental', 'Nigerian'],
      rating: 4.6,
      deliveryTime: '30-40 mins',
      deliveryFee: 600,
      isOpen: true,
      featured: true,
      minimumOrder: 2500,
      imageUrl: '/restaurants/crossriver-restaurant.jpg'
    },
    {
      id: 'calabar-002',
      name: 'Pepper Soup Kitchen',
      description: 'Best pepper soup and local dishes in Calabar',
      cityId: 'calabar',
      address: 'Parliamentary Extension, Calabar',
      coordinates: { lat: 4.9534, lng: 8.3198 },
      cuisineType: ['Nigerian', 'Soup'],
      rating: 4.5,
      deliveryTime: '20-30 mins',
      deliveryFee: 400,
      isOpen: true,
      featured: true,
      minimumOrder: 1500,
      imageUrl: '/restaurants/pepper-soup-kitchen.jpg'
    },
    {
      id: 'calabar-003',
      name: 'Calabar Kitchen',
      description: 'Authentic Cross River state cuisine',
      cityId: 'calabar',
      address: 'Murtala Mohammed Highway, Calabar',
      coordinates: { lat: 4.9456, lng: 8.3145 },
      cuisineType: ['Nigerian', 'Traditional'],
      rating: 4.3,
      deliveryTime: '25-35 mins',
      deliveryFee: 500,
      isOpen: true,
      featured: false,
      minimumOrder: 1800,
      imageUrl: '/restaurants/calabar-kitchen.jpg'
    },
    {
      id: 'calabar-004',
      name: 'Unical Cafeteria',
      description: 'Student-friendly meals and quick bites',
      cityId: 'calabar',
      address: 'University of Calabar, Calabar',
      coordinates: { lat: 4.9623, lng: 8.3334 },
      cuisineType: ['Fast Food', 'Nigerian'],
      rating: 3.9,
      deliveryTime: '15-25 mins',
      deliveryFee: 300,
      isOpen: true,
      featured: false,
      minimumOrder: 1000,
      imageUrl: '/restaurants/unical-cafeteria.jpg'
    },
    {
      id: 'calabar-005',
      name: 'Marina Resort Restaurant',
      description: 'Upscale dining with international cuisine',
      cityId: 'calabar',
      address: 'State Housing, Calabar',
      coordinates: { lat: 4.9501, lng: 8.3289 },
      cuisineType: ['International', 'Seafood'],
      rating: 4.7,
      deliveryTime: '35-45 mins',
      deliveryFee: 800,
      isOpen: true,
      featured: true,
      minimumOrder: 3500,
      imageUrl: '/restaurants/marina-resort.jpg'
    }
  ];

  // Get all available cities
  getCities(): City[] {
    return this.cities.filter(city => city.isActive);
  }

  // Get city by ID
  getCityById(cityId: string): City | null {
    return this.cities.find(city => city.id === cityId) || null;
  }

  // Get restaurants for a specific city
  getRestaurantsByCity(cityId: string): CityRestaurant[] {
    return this.restaurants.filter(restaurant => 
      restaurant.cityId === cityId && restaurant.isOpen
    );
  }

  // Get featured restaurants for a city
  getFeaturedRestaurants(cityId: string): CityRestaurant[] {
    return this.restaurants.filter(restaurant => 
      restaurant.cityId === cityId && restaurant.featured && restaurant.isOpen
    );
  }

  // Search restaurants by name or cuisine
  searchRestaurants(cityId: string, query: string): CityRestaurant[] {
    const cityRestaurants = this.getRestaurantsByCity(cityId);
    const searchTerm = query.toLowerCase();

    return cityRestaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.description.toLowerCase().includes(searchTerm) ||
      restaurant.cuisineType.some(cuisine => cuisine.toLowerCase().includes(searchTerm))
    );
  }

  // Check if coordinates are within city bounds
  isWithinCityBounds(cityId: string, lat: number, lng: number): boolean {
    const city = this.getCityById(cityId);
    if (!city) return false;

    return (
      lat >= city.bounds.south &&
      lat <= city.bounds.north &&
      lng >= city.bounds.west &&
      lng <= city.bounds.east
    );
  }

  // Get delivery areas for a city
  getDeliveryAreas(cityId: string): string[] {
    const city = this.getCityById(cityId);
    return city ? city.coverageAreas : [];
  }

  // Calculate delivery feasibility
  canDeliverToLocation(cityId: string, lat: number, lng: number): boolean {
    const city = this.getCityById(cityId);
    if (!city) return false;

    // Calculate distance from city center
    const distance = this.calculateDistance(
      city.coordinates.lat,
      city.coordinates.lng,
      lat,
      lng
    );

    return distance <= city.deliveryRadius;
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get currently selected city from localStorage
  getCurrentCity(): City {
    try {
      const saved = localStorage.getItem('chopchop_selected_city');
      if (saved) {
        const cityId = JSON.parse(saved);
        const city = this.getCityById(cityId);
        if (city) return city;
      }
    } catch (error) {
      console.error('Error loading saved city:', error);
    }
    
    // Default to Uyo if no saved city
    return this.cities[0];
  }

  // Set current city
  setCurrentCity(cityId: string): boolean {
    const city = this.getCityById(cityId);
    if (!city) return false;

    try {
      localStorage.setItem('chopchop_selected_city', JSON.stringify(cityId));
      return true;
    } catch (error) {
      console.error('Error saving city selection:', error);
      return false;
    }
  }

  // Get restaurant statistics for a city
  getCityStats(cityId: string) {
    const restaurants = this.getRestaurantsByCity(cityId);
    const featured = this.getFeaturedRestaurants(cityId);
    
    const cuisineTypes = new Set<string>();
    let totalRating = 0;
    let minDeliveryFee = Infinity;
    let maxDeliveryFee = 0;

    restaurants.forEach(restaurant => {
      restaurant.cuisineType.forEach(cuisine => cuisineTypes.add(cuisine));
      totalRating += restaurant.rating;
      minDeliveryFee = Math.min(minDeliveryFee, restaurant.deliveryFee);
      maxDeliveryFee = Math.max(maxDeliveryFee, restaurant.deliveryFee);
    });

    return {
      totalRestaurants: restaurants.length,
      featuredRestaurants: featured.length,
      averageRating: restaurants.length > 0 ? (totalRating / restaurants.length).toFixed(1) : '0',
      cuisineTypes: Array.from(cuisineTypes),
      deliveryFeeRange: {
        min: minDeliveryFee === Infinity ? 0 : minDeliveryFee,
        max: maxDeliveryFee
      }
    };
  }
}

// Export singleton instance
export const cityService = CityService.getInstance();