import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Your Firebase config (same as in .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "835361851966",
  appId: "1:835361851966:web:78810ea4389297a8679f6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample restaurant data
const sampleRestaurants = [
  {
    id: 'pizza-palace-001',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizzas made with fresh ingredients and traditional recipes. Family-owned since 1985.',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'contact@pizzapalace.com'
  },
  {
    id: 'burger-junction-002',
    name: 'Burger Junction',
    description: 'Gourmet burgers and crispy fries. Locally sourced beef and fresh vegetables.',
    logoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'hello@burgerjunction.com'
  },
  {
    id: 'sushi-zen-003',
    name: 'Sushi Zen',
    description: 'Fresh sushi and Japanese cuisine. Premium quality fish and traditional preparation methods.',
    logoUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'info@sushizen.com'
  },
  {
    id: 'taco-fiesta-004',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican tacos and burritos with house-made salsas and fresh tortillas.',
    logoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center',
    bannerUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop&crop=center',
    contactEmail: 'orders@tacofiesta.com'
  }
];

// Sample menu items for each restaurant
const sampleMenuItems = {
  'pizza-palace-001': [
    {
      id: 'margherita-pizza',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil',
      price: 16.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace-001'
    },
    {
      id: 'pepperoni-pizza',
      name: 'Pepperoni Pizza',
      description: 'Traditional pepperoni pizza with mozzarella cheese',
      price: 18.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop&crop=center',
      eateryId: 'pizza-palace-001'
    }
  ],
  'burger-junction-002': [
    {
      id: 'classic-burger',
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, onion, and special sauce',
      price: 14.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop&crop=center',
      eateryId: 'burger-junction-002'
    }
  ],
  'sushi-zen-003': [
    {
      id: 'salmon-roll',
      name: 'Salmon Roll',
      description: 'Fresh salmon with avocado and cucumber',
      price: 12.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop&crop=center',
      eateryId: 'sushi-zen-003'
    }
  ],
  'taco-fiesta-004': [
    {
      id: 'beef-tacos',
      name: 'Beef Tacos (3)',
      description: 'Three soft tacos with seasoned ground beef and fresh toppings',
      price: 11.99,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center',
      eateryId: 'taco-fiesta-004'
    }
  ]
};

async function seedFirestore() {
  console.log('🌱 Starting Firestore data seeding...');
  
  try {
    // Add restaurants to eateries collection
    for (const restaurant of sampleRestaurants) {
      const { id, ...restaurantData } = restaurant;
      
      console.log(`📝 Adding restaurant: ${restaurant.name}`);
      await setDoc(doc(db, 'eateries', id), restaurantData);
      
      // Add menu items for this restaurant
      const menuItems = sampleMenuItems[id] || [];
      for (const item of menuItems) {
        const { id: itemId, ...itemData } = item;
        console.log(`  🍽️ Adding menu item: ${item.name}`);
        await setDoc(doc(db, 'eateries', id, 'menu_items', itemId), itemData);
      }
    }
    
    console.log('✅ Firestore seeding completed successfully!');
    console.log('🎉 You can now visit /menuverse-demo to see the restaurants');
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  }
}

// Run the seeding function
seedFirestore();