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

// Type definitions based on MenuVerse API documentation
export interface Eatery {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
  imageUrl: string;
  eateryId: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  eateryId: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status?: string;
  createdAt?: any;
}

export class MenuverseService {
  private static instance: MenuverseService;
  private db: any = null;

  private constructor() {
    this.initializeFirestore();
  }

  public static getInstance(): MenuverseService {
    if (!MenuverseService.instance) {
      MenuverseService.instance = new MenuverseService();
    }
    return MenuverseService.instance;
  }

  private async initializeFirestore() {
    try {
      this.db = getMenuverseFirestore();
      if (this.db) {
        // Try to ensure authentication (optional for read operations)
        const user = await ensureMenuverseAuth();
        if (user) {
          console.log('MenuVerse service initialized with authentication');
        } else {
          console.log('MenuVerse service initialized without authentication');
        }
      }
    } catch (error) {
      console.error('Failed to initialize MenuVerse service:', error);
    }
  }

  private async ensureConnection() {
    if (!this.db) {
      await this.initializeFirestore();
    }
    if (!this.db) {
      throw new Error('MenuVerse connection not available');
    }
  }

  /**
   * Get a single eatery profile by ID
   */
  async getEateryProfile(eateryId: string): Promise<Eatery | null> {
    try {
      await this.ensureConnection();
      
      const eateryRef = doc(this.db, 'eateries', eateryId);
      const docSnap = await getDoc(eateryRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Eatery;
      } else {
        console.warn(`No eatery found with ID: ${eateryId}`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching eatery profile:', error);
      throw error;
    }
  }

  /**
   * Get all available eateries
   */
  async getAllEateries(limitCount: number = 50): Promise<Eatery[]> {
    try {
      await this.ensureConnection();
      
      const eateriesRef = collection(this.db, 'eateries');
      const q = query(eateriesRef, limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const eateries: Eatery[] = [];
      
      querySnapshot.forEach((doc) => {
        eateries.push({ id: doc.id, ...doc.data() } as Eatery);
      });

      return eateries;
    } catch (error) {
      console.error('Error fetching eateries:', error);
      throw error;
    }
  }

  /**
   * Get menu items for a specific eatery
   */
  async getMenuItems(eateryId: string): Promise<MenuItem[]> {
    try {
      await this.ensureConnection();
      
      const menuItemsRef = collection(this.db, 'eateries', eateryId, 'menu_items');
      // Simplified query to avoid index requirement - we'll sort client-side
      const querySnapshot = await getDocs(menuItemsRef);
      const menuItems: MenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        menuItems.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      // Sort client-side by category then by name
      menuItems.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      return menuItems;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  /**
   * Get menu items by category
   */
  async getMenuItemsByCategory(eateryId: string, category: string): Promise<MenuItem[]> {
    try {
      await this.ensureConnection();
      
      const menuItemsRef = collection(this.db, 'eateries', eateryId, 'menu_items');
      const q = query(menuItemsRef, where('category', '==', category));
      
      const querySnapshot = await getDocs(q);
      const menuItems: MenuItem[] = [];
      
      querySnapshot.forEach((doc) => {
        menuItems.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      // Sort client-side by name
      menuItems.sort((a, b) => a.name.localeCompare(b.name));

      return menuItems;
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      throw error;
    }
  }

  /**
   * Place an order at an eatery
   */
  async placeOrder(eateryId: string, orderData: Order): Promise<string | null> {
    try {
      await this.ensureConnection();
      
      const ordersRef = collection(this.db, 'eateries', eateryId, 'orders');
      
      // Prepare order data with defaults and tracking
      const newOrder = {
        ...orderData,
        status: orderData.status || 'Pending',
        deliveryStatus: 'order_received',
        createdAt: serverTimestamp(),
        trackingUpdates: [
          {
            status: 'order_received',
            timestamp: serverTimestamp(),
            message: 'Order received and confirmed by restaurant',
            location: 'Restaurant'
          }
        ]
      };

      const docRef = await addDoc(ordersRef, newOrder);
      console.log('Order placed with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Search eateries by name
   */
  async searchEateries(searchTerm: string, limitCount: number = 20): Promise<Eatery[]> {
    try {
      await this.ensureConnection();
      
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const eateriesRef = collection(this.db, 'eateries');
      const q = query(eateriesRef, limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      const allEateries: Eatery[] = [];
      
      querySnapshot.forEach((doc) => {
        allEateries.push({ id: doc.id, ...doc.data() } as Eatery);
      });

      // Filter client-side (not ideal for large datasets)
      const filteredEateries = allEateries.filter(eatery => 
        eatery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eatery.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredEateries;
    } catch (error) {
      console.error('Error searching eateries:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const menuverseService = MenuverseService.getInstance();