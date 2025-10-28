// Script to seed MenuVerse database with sample restaurants
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "835361851966",
  appId: "1:835361851966:web:78810ea4389297a8679f6f",
  measurementId: "G-DNTXZG5ESQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const sampleRestaurants = [
  {
    name: "Mama's Kitchen",
    description: "Authentic Nigerian cuisine with a homely touch. Fresh ingredients and traditional recipes.",
    address: "123 Lagos Street, Victoria Island",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    contactEmail: "orders@mamaskitchen.ng"
  },
  {
    name: "ChopChop Express",
    description: "Fast food done right. Burgers, fries, and Nigerian favorites delivered quickly.",
    address: "45 Admiralty Way, Lekki Phase 1",
    logoUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800",
    contactEmail: "hello@chopchopexpress.ng"
  },
  {
    name: "Suya Palace",
    description: "Premium suya and grilled meat specialist. The best beef suya in town.",
    address: "78 Allen Avenue, Ikeja",
    logoUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
    contactEmail: "contact@suyapalace.ng"
  },
  {
    name: "Ocean View Restaurant",
    description: "Fresh seafood and continental dishes with a beautiful ocean view.",
    address: "12 Ozumba Mbadiwe, Victoria Island",
    logoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800",
    contactEmail: "reservations@oceanview.ng"
  },
  {
    name: "Jollof Junction",
    description: "The ultimate jollof rice experience. Party jollof, seafood jollof, and more.",
    address: "23 Ogunlana Drive, Surulere",
    logoUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
    bannerUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    contactEmail: "orders@jollofjunction.ng"
  }
];

const sampleMenuItems = [
  // Mama's Kitchen menu
  {
    name: "Jollof Rice & Chicken",
    description: "Classic Nigerian jollof rice with tender grilled chicken",
    price: 2500,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
  },
  {
    name: "Pounded Yam & Egusi",
    description: "Traditional pounded yam served with rich egusi soup",
    price: 3000,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400"
  },
  {
    name: "Pepper Soup",
    description: "Spicy fish pepper soup with yam",
    price: 1800,
    category: "Appetizer",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
  },
  // ChopChop Express menu
  {
    name: "ChopChop Burger",
    description: "Juicy beef burger with fries and drink",
    price: 2200,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
  },
  {
    name: "Chicken & Chips",
    description: "Crispy fried chicken with seasoned chips",
    price: 2800,
    category: "Main Course",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400"
  }
];

export async function seedMenuVerseDatabase() {
  try {
    console.log('🌱 Checking MenuVerse database...');
    
    // Check if restaurants already exist
    const eateriesRef = collection(db, 'eateries');
    const existingSnapshot = await getDocs(eateriesRef);
    
    if (existingSnapshot.size > 0) {
      console.log(`✅ Database already has ${existingSnapshot.size} restaurants. Skipping seed.`);
      return existingSnapshot.size;
    }
    
    console.log('🌱 Seeding MenuVerse with sample restaurants...');
    
    // Add sample restaurants
    const addedRestaurants: Array<{id: string} & typeof sampleRestaurants[0]> = [];
    for (const restaurant of sampleRestaurants) {
      const docRef = await addDoc(eateriesRef, restaurant);
      addedRestaurants.push({ id: docRef.id, ...restaurant });
      console.log(`✅ Added restaurant: ${restaurant.name}`);
    }
    
    // Add sample menu items for each restaurant
    if (addedRestaurants.length > 0) {
      // Add menu items for Mama's Kitchen (first restaurant)
      const mamasKitchenId = addedRestaurants[0].id;
      const menuItemsRef1 = collection(db, 'eateries', mamasKitchenId, 'menu_items');
      
      for (const menuItem of sampleMenuItems.slice(0, 3)) { // First 3 items for Mama's Kitchen
        await addDoc(menuItemsRef1, {
          ...menuItem,
          eateryId: mamasKitchenId,
          createdAt: new Date()
        });
        console.log(`✅ Added menu item to ${addedRestaurants[0].name}: ${menuItem.name}`);
      }
      
      // Add items for ChopChop Express (second restaurant)
      if (addedRestaurants.length > 1) {
        const chopChopId = addedRestaurants[1].id;
        const menuItemsRef2 = collection(db, 'eateries', chopChopId, 'menu_items');
        
        for (const menuItem of sampleMenuItems.slice(3, 5)) { // Items 3-4 for ChopChop Express
          await addDoc(menuItemsRef2, {
            ...menuItem,
            eateryId: chopChopId,
            createdAt: new Date()
          });
          console.log(`✅ Added menu item to ${addedRestaurants[1].name}: ${menuItem.name}`);
        }
      }
    }
    
    console.log(`🎉 Successfully seeded MenuVerse with ${addedRestaurants.length} restaurants!`);
    return addedRestaurants.length;
    
  } catch (error) {
    console.error('❌ Error seeding MenuVerse database:', error);
    throw error;
  }
}

// For testing in browser console
if (typeof window !== 'undefined') {
  (window as any).seedMenuVerseDatabase = seedMenuVerseDatabase;
}