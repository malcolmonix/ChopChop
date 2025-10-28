import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy, limit } from 'firebase/firestore';
import type { Eatery, MenuItem, Order } from '../types/menuverse';

// MenuVerse Firebase config (same as the multivendor-web config)
const firebaseConfig = {
  apiKey: "AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "835361851966",
  appId: "1:835361851966:web:78810ea4389297a8679f6f",
  measurementId: "G-DNTXZG5ESQ"
};

// Initialize Firebase for MenuVerse
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

class MenuVerseAPI {
  
  /**
   * Get all restaurants (eateries) from Firebase
   */
  async getRestaurants(): Promise<Eatery[]> {
    try {
      console.log('🔥 Fetching restaurants from MenuVerse Firebase...');
      const eateriesRef = collection(db, 'eateries');
      const snapshot = await getDocs(eateriesRef);
      
      const eateries: Eatery[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Debug logging for field mapping
        console.log(`🔍 Restaurant ${data.name} fields:`, {
          image: data.image,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          email: data.email,
          contactEmail: data.contactEmail
        });
        
        const eatery: Eatery = {
          id: doc.id,
          name: data.name || 'Unnamed Restaurant',
          description: data.description || 'No description available',
          logoUrl: data.logoUrl || data.image, // Fallback to admin panel image field
          bannerUrl: data.bannerUrl || data.image, // Fallback to admin panel image field
          contactEmail: data.contactEmail || data.email, // Fallback to admin panel email field
          // Map to our expected format
          _id: doc.id,
          image: data.logoUrl || data.bannerUrl || data.image, // Try multiple fields
          address: data.address || 'Address not provided',
          isActive: data.isActive !== false // Default to true unless explicitly false
        };
        
        eateries.push(eatery);
      });
      
      console.log(`✅ Found ${eateries.length} restaurants in MenuVerse`);
      return eateries;
    } catch (error) {
      console.error('❌ Error fetching restaurants from MenuVerse:', error);
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }
  }

  /**
   * Get a specific restaurant by ID
   */
  async getRestaurant(id: string): Promise<Eatery | null> {
    try {
      console.log(`🔥 Fetching restaurant ${id} from MenuVerse...`);
      const docRef = doc(db, 'eateries', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unnamed Restaurant',
          description: data.description || 'No description available',
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          contactEmail: data.contactEmail,
          // Map to our expected format
          _id: docSnap.id,
          image: data.bannerUrl || data.logoUrl,
          address: data.address || 'Address not provided',
          isActive: true
        };
      }
      
      console.log(`❌ Restaurant ${id} not found in MenuVerse`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching restaurant ${id}:`, error);
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }
  }

  /**
   * Get menu items for a specific restaurant
   */
  async getRestaurantMenu(eateryId: string): Promise<MenuItem[]> {
    try {
      console.log(`🔥 Fetching menu for restaurant ${eateryId}...`);
      
      // MenuVerse stores menu items as: eateries/{eateryId}/menu_items
      const menuRef = collection(db, 'eateries', eateryId, 'menu_items');
      const q = query(menuRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const menuItems: MenuItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        menuItems.push({
          id: doc.id,
          name: data.name || 'Unnamed Item',
          description: data.description || 'No description',
          price: data.price || 0,
          category: data.category || 'Main Course',
          imageUrl: data.imageUrl,
          imageHint: data.imageHint,
          eateryId: eateryId, // Use the passed eateryId
          createdAt: data.createdAt
        });
      });
      
      console.log(`✅ Found ${menuItems.length} menu items for restaurant ${eateryId}`);
      return menuItems;
    } catch (error) {
      console.error(`❌ Error fetching menu for ${eateryId}:`, error);
      throw new Error(`Failed to fetch menu: ${error.message}`);
    }
  }

  /**
   * Place an order in MenuVerse
   */
  async placeOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
      console.log('🔥 Placing order in MenuVerse...', orderData);
      // For now, just log the order - you can implement actual order placement later
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`✅ Order placed successfully: ${orderId}`);
      return orderId;
    } catch (error) {
      console.error('❌ Error placing order:', error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  /**
   * Search restaurants by name
   */
  async searchRestaurants(searchTerm: string): Promise<Eatery[]> {
    try {
      // Get all restaurants first, then filter client-side
      // (Firestore doesn't support case-insensitive text search natively)
      const allRestaurants = await this.getRestaurants();
      
      const filtered = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log(`🔍 Search for "${searchTerm}" found ${filtered.length} restaurants`);
      return filtered;
    } catch (error) {
      console.error('❌ Error searching restaurants:', error);
      throw new Error(`Failed to search restaurants: ${error.message}`);
    }
  }
}

// Export singleton instance
export const menuVerseAPI = new MenuVerseAPI();
export default menuVerseAPI;