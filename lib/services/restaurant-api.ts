import { ApolloClient } from '@apollo/client';
import client from '../apolloClient';
import {
  GET_RESTAURANTS,
  GET_RESTAURANT,
  GET_MENU_ITEMS,
  GET_MENU_CATEGORIES,
  CREATE_RESTAURANT,
  UPDATE_RESTAURANT,
  CREATE_MENU_ITEM,
  UPDATE_MENU_ITEM,
  DELETE_MENU_ITEM,
  CREATE_MENU_CATEGORY,
} from '../graphql/queries';

// Type definitions (matching our GraphQL schema)
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  address?: string;
  phoneNumber?: string;
  priceRange?: string;
  openingHours?: Array<{
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }>;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

class RestaurantAPIService {
  private client: ApolloClient;

  constructor(clientInstance: ApolloClient = client) {
    this.client = clientInstance;
  }

  /**
   * Get all restaurants with optional filtering
   */
  async getRestaurants(
    options?: {
      search?: string;
      cuisine?: string;
      limit?: number;
    }
  ): Promise<Restaurant[]> {
    try {
      const { data } = await this.client.query({
        query: GET_RESTAURANTS,
        variables: {
          search: options?.search,
          cuisine: options?.cuisine,
          limit: options?.limit,
        },
      });

      return (data as any).restaurants || [];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw new Error(`Failed to fetch restaurants: ${(error as any).message}`);
    }
  }

  /**
   * Get a specific restaurant by ID
   */
  async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const { data } = await this.client.query({
        query: GET_RESTAURANT,
        variables: { id },
      });

      return (data as any).restaurant || null;
    } catch (error) {
      console.error(`Error fetching restaurant ${id}:`, error);
      throw new Error(`Failed to fetch restaurant: ${(error as any).message}`);
    }
  }

  /**
   * Get menu items for a specific restaurant
   */
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    try {
      const { data } = await this.client.query({
        query: GET_MENU_ITEMS,
        variables: { restaurantId },
      });

      return (data as any).menuItems || [];
    } catch (error) {
      console.error(`Error fetching menu items for restaurant ${restaurantId}:`, error);
      throw new Error(`Failed to fetch menu items: ${(error as any).message}`);
    }
  }

  /**
   * Get menu categories for a specific restaurant
   */
  async getMenuCategories(restaurantId: string): Promise<MenuCategory[]> {
    try {
      const { data } = await this.client.query({
        query: GET_MENU_CATEGORIES,
        variables: { restaurantId },
      });

      return (data as any).menuCategories || [];
    } catch (error) {
      console.error(`Error fetching menu categories for restaurant ${restaurantId}:`, error);
      throw new Error(`Failed to fetch menu categories: ${(error as any).message}`);
    }
  }

  /**
   * Create a new restaurant (for restaurant owners)
   */
  async createRestaurant(restaurantData: {
    name: string;
    description: string;
    contactEmail?: string;
    phoneNumber?: string;
    address?: string;
    cuisine?: string[];
    priceRange?: string;
    openingHours?: Array<{
      day: string;
      open: string;
      close: string;
      isClosed: boolean;
    }>;
  }): Promise<Restaurant> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_RESTAURANT,
        variables: restaurantData,
      });

      return (data as any).createRestaurant;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw new Error(`Failed to create restaurant: ${(error as any).message}`);
    }
  }

  /**
   * Update a restaurant (for restaurant owners)
   */
  async updateRestaurant(
    id: string,
    updates: {
      description?: string;
      phoneNumber?: string;
      isActive?: boolean;
    }
  ): Promise<Restaurant> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_RESTAURANT,
        variables: { id, ...updates },
      });

      return (data as any).updateRestaurant;
    } catch (error) {
      console.error(`Error updating restaurant ${id}:`, error);
      throw new Error(`Failed to update restaurant: ${(error as any).message}`);
    }
  }

  /**
   * Create a menu item (for restaurant owners)
   */
  async createMenuItem(menuItemData: {
    restaurantId: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    isVegetarian?: boolean;
    isVegan?: boolean;
    allergens?: string[];
  }): Promise<MenuItem> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_MENU_ITEM,
        variables: menuItemData,
      });

      return (data as any).createMenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new Error(`Failed to create menu item: ${(error as any).message}`);
    }
  }

  /**
   * Update a menu item (for restaurant owners)
   */
  async updateMenuItem(
    id: string,
    updates: {
      price?: number;
      isAvailable?: boolean;
      description?: string;
    }
  ): Promise<MenuItem> {
    try {
      const { data } = await this.client.mutate({
        mutation: UPDATE_MENU_ITEM,
        variables: { id, ...updates },
      });

      return (data as any).updateMenuItem;
    } catch (error) {
      console.error(`Error updating menu item ${id}:`, error);
      throw new Error(`Failed to update menu item: ${(error as any).message}`);
    }
  }

  /**
   * Delete a menu item (for restaurant owners)
   */
  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const { data } = await this.client.mutate({
        mutation: DELETE_MENU_ITEM,
        variables: { id },
      });

      return (data as any).deleteMenuItem;
    } catch (error) {
      console.error(`Error deleting menu item ${id}:`, error);
      throw new Error(`Failed to delete menu item: ${(error as any).message}`);
    }
  }

  /**
   * Create a menu category (for restaurant owners)
   */
  async createMenuCategory(categoryData: {
    restaurantId: string;
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<MenuCategory> {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_MENU_CATEGORY,
        variables: categoryData,
      });

      return (data as any).createMenuCategory;
    } catch (error) {
      console.error('Error creating menu category:', error);
      throw new Error(`Failed to create menu category: ${(error as any).message}`);
    }
  }
}

// Export singleton instance
export const restaurantAPI = new RestaurantAPIService();
export default restaurantAPI;