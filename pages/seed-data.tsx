import React, { useState } from 'react';
import { getMenuverseFirestore } from '../lib/firebase/menuverse';
import { collection, doc, setDoc } from 'firebase/firestore';

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

// Sample menu items
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

export default function SeedData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const seedFirestore = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const db = getMenuverseFirestore();
      if (!db) {
        throw new Error('MenuVerse Firestore not available');
      }

      setMessage('🌱 Starting to add sample restaurant data...');

      // Add restaurants
      for (const restaurant of sampleRestaurants) {
        const { id, ...restaurantData } = restaurant;
        
        setMessage(prev => prev + `\n📝 Adding restaurant: ${restaurant.name}`);
        await setDoc(doc(db, 'eateries', id), restaurantData);
        
        // Add menu items for this restaurant
        const menuItems = sampleMenuItems[id] || [];
        for (const item of menuItems) {
          const { id: itemId, ...itemData } = item;
          setMessage(prev => prev + `\n  🍽️ Adding menu item: ${item.name}`);
          await setDoc(doc(db, 'eateries', id, 'menu_items', itemId), itemData);
        }
      }

      setMessage(prev => prev + '\n\n✅ All sample data added successfully!');
      setMessage(prev => prev + '\n🎉 You can now visit /menuverse-demo to see the restaurants');

    } catch (err) {
      console.error('Seeding error:', err);
      setError(`❌ Error adding data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Seed Sample Restaurant Data</h1>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This will add 4 sample restaurants with menu items to your Firebase Firestore database. 
              This data will then appear on the MenuVerse demo page.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">Sample Restaurants:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>🍕 Pizza Palace - Italian pizzas</li>
                <li>🍔 Burger Junction - Gourmet burgers</li>
                <li>🍣 Sushi Zen - Japanese cuisine</li>
                <li>🌮 Taco Fiesta - Mexican food</li>
              </ul>
            </div>
          </div>

          <button
            onClick={seedFirestore}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
          >
            {loading ? 'Adding Data...' : 'Add Sample Restaurant Data'}
          </button>

          {message && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{message}</pre>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">After seeding:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Click the button above to add sample data</li>
              <li>Visit <a href="/menuverse-demo" className="text-blue-600 hover:underline">/menuverse-demo</a> to see the restaurants</li>
              <li>Click on any restaurant to view its menu and test the cart system</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}