import { useState, useEffect } from 'react';
import { ChopChopRestaurantService, ChopChopRestaurant, ChopChopMenuItem } from '../services/chopchop-restaurants';

const service = new ChopChopRestaurantService();

/**
 * Hook to fetch and manage restaurants
 */
export function useChopChopRestaurants() {
  const [restaurants, setRestaurants] = useState<ChopChopRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const restaurantsData = await service.getRestaurants();
      setRestaurants(restaurantsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
}

/**
 * Hook to search restaurants
 */
export function useChopChopRestaurantSearch() {
  const [results, setResults] = useState<ChopChopRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await service.searchRestaurants(searchTerm);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    clearSearch
  };
}

/**
 * Hook to fetch restaurant menu
 */
export function useChopChopRestaurantMenu(restaurantId: string | null) {
  const [menuItems, setMenuItems] = useState<ChopChopMenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const menu = await service.getRestaurantMenu(id);
      setMenuItems(menu);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenu(restaurantId);
    } else {
      setMenuItems([]);
      setError(null);
    }
  }, [restaurantId]);

  return {
    menuItems,
    loading,
    error,
    refetch: restaurantId ? () => fetchMenu(restaurantId) : () => {}
  };
}

/**
 * Hook to get a single restaurant
 */
export function useChopChopRestaurant(restaurantId: string | null) {
  const [restaurant, setRestaurant] = useState<ChopChopRestaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurant = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const restaurantData = await service.getRestaurant(id);
      setRestaurant(restaurantData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurant');
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant(restaurantId);
    } else {
      setRestaurant(null);
      setError(null);
    }
  }, [restaurantId]);

  return {
    restaurant,
    loading,
    error,
    refetch: restaurantId ? () => fetchRestaurant(restaurantId) : () => {}
  };
}

export { service as chopChopRestaurantService };