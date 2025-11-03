import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { getMenuverseFirestore, ensureMenuverseAuth } from '../firebase/menuverse';

// ChopChop Restaurant interfaces (consumer-facing)
export interface ChopChopRestaurant {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  rating?: number;
  deliveryTime?: string;
  cuisineType?: string;
  deliveryFee?: string;
  isOpen?: boolean;
}

export interface ChopChopMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl: string;
  restaurantId: string;
}

export interface ChopChopOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ChopChopOrder {
  restaurantId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: ChopChopOrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  timestamp: Date;
}

export class ChopChopRestaurantService {
  private db: any;

  constructor() {
    this.db = null;
  }

  private async ensureConnection() {
    if (!this.db) {
      console.log('ChopChopRestaurantService: Initializing connection...');
      
      // Try to authenticate, but don't fail if it doesn't work
      try {
        await ensureMenuverseAuth();
        console.log('ChopChopRestaurantService: Authentication completed');
      } catch (authError) {
        console.warn('ChopChopRestaurantService: Authentication failed, proceeding anyway:', authError);
      }
      
      this.db = getMenuverseFirestore();
      if (!this.db) {
        throw new Error('Failed to initialize Firestore connection');
      }
      console.log('ChopChopRestaurantService: Firestore connection established');
    }
  }

  /**
   * Get all available restaurants for ChopChop customers
   */
  async getRestaurants(searchTerm?: string): Promise<ChopChopRestaurant[]> {
    try {
      await this.ensureConnection();
      
      const eateriesToQuery = collection(this.db, 'eateries');
      const querySnapshot = await getDocs(eateriesToQuery);
      const restaurants: ChopChopRestaurant[] = [];
      
      // Restaurant names to use instead of "Demo Restaurant"
      const realRestaurantNames = [
        'Mama Cass Kitchen',
        'KFC Lagos',
        'Dominos Pizza', 
        'Mr. Biggs',
        'Sweet Sensation',
        'Chicken Republic',
        'Tantalizers'
      ];
      
      let index = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Use real restaurant name instead of "Demo Restaurant"
        const restaurantName = data.name === 'Demo Restaurant' ? 
          realRestaurantNames[index % realRestaurantNames.length] : 
          data.name;
        
        // Filter by search term if provided
        if (searchTerm && !restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) 
            && !data.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          index++;
          return;
        }
        
        // Generate mock data for demo (in real app, this would come from the restaurant data)
        const rating = Number((4.0 + Math.random() * 1.0).toFixed(1));
        const deliveryTime = `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} mins`;
        const cuisineTypes = ['Nigerian', 'Fast Food', 'Continental', 'Chinese', 'Italian'];
        const cuisineType = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
        const deliveryFee = Math.floor(Math.random() * 3) === 0 ? 'Free' : `₦${(200 + Math.floor(Math.random() * 300)).toLocaleString()}`;
        
        restaurants.push({
          id: doc.id,
          name: restaurantName, // Use the real restaurant name
          description: data.description,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          contactEmail: data.contactEmail,
          rating,
          deliveryTime,
          cuisineType,
          deliveryFee,
          isOpen: true
        });
        
        index++; // Increment index for restaurant name rotation
      });

      // Sort by rating (highest first)
      restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      return restaurants;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }

  /**
   * Search restaurants by name or cuisine
   */
  async searchRestaurants(searchTerm: string): Promise<ChopChopRestaurant[]> {
    return this.getRestaurants(searchTerm);
  }

  /**
   * Get menu items for a specific restaurant
   */
  async getRestaurantMenu(restaurantId: string): Promise<ChopChopMenuItem[]> {
    try {
      console.log('ChopChopRestaurantService: Fetching menu for restaurant:', restaurantId);
      await this.ensureConnection();
      
      if (!this.db) {
        throw new Error('Failed to establish database connection');
      }
      
      console.log('ChopChopRestaurantService: Database connection established');
      
      const menuItemsRef = collection(this.db, 'eateries', restaurantId, 'menu_items');
      console.log('ChopChopRestaurantService: Querying collection:', `eateries/${restaurantId}/menu_items`);
      
      const querySnapshot = await getDocs(menuItemsRef);
      console.log('ChopChopRestaurantService: Query executed, docs found:', querySnapshot.size);
      
      const menuItems: ChopChopMenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('ChopChopRestaurantService: Processing menu item:', doc.id, data);
        menuItems.push({ 
          id: doc.id, 
          ...data,
          restaurantId 
        } as ChopChopMenuItem);
      });

      console.log('ChopChopRestaurantService: Total menu items processed:', menuItems.length);

      // Sort client-side by category then by name
      menuItems.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      return menuItems;
    } catch (error) {
      console.error('ChopChopRestaurantService: Error fetching menu items:', error);
      console.error('ChopChopRestaurantService: Error details:', {
        restaurantId,
        errorMessage: error.message,
        errorCode: error.code,
        errorStack: error.stack
      });
      throw error;
    }
  }

  /**
   * Place an order at a restaurant
   */
  async placeOrder(restaurantId: string, orderData: ChopChopOrder): Promise<string | null> {
    try {
      await this.ensureConnection();
      
      const ordersRef = collection(this.db, 'eateries', restaurantId, 'orders');
      
      // Transform the order data to match MenuVerse format
      const menuverseOrderData = {
        eateryId: restaurantId,
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          address: orderData.customer.address,
          phone: orderData.customer.phone
        },
        items: orderData.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: orderData.totalAmount,
        status: 'Pending' as const, // Use MenuVerse status format (capitalized)
        createdAt: serverTimestamp() // Use MenuVerse field name
      };

      console.log('ChopChopRestaurantService: Placing order with MenuVerse format:', menuverseOrderData);
      
      const docRef = await addDoc(ordersRef, menuverseOrderData);

      console.log('ChopChopRestaurantService: Order placed successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('ChopChopRestaurantService: Error placing order:', error);
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurant(restaurantId: string): Promise<ChopChopRestaurant | null> {
    try {
      await this.ensureConnection();
      
      const restaurantDoc = await getDoc(doc(this.db, 'eateries', restaurantId));
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        
        // Generate mock data for demo
        const rating = Number((4.0 + Math.random() * 1.0).toFixed(1));
        const deliveryTime = `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} mins`;
        const cuisineTypes = ['Nigerian', 'Fast Food', 'Continental', 'Chinese', 'Italian'];
        const cuisineType = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
        const deliveryFee = Math.floor(Math.random() * 3) === 0 ? 'Free' : `₦${(200 + Math.floor(Math.random() * 300)).toLocaleString()}`;
        
        return {
          id: restaurantDoc.id,
          name: data.name,
          description: data.description,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          contactEmail: data.contactEmail,
          rating,
          deliveryTime,
          cuisineType,
          deliveryFee,
          isOpen: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  }
}

// Export a singleton instance for convenience
export const chopChopRestaurantService = new ChopChopRestaurantService();