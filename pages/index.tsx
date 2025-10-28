import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCart } from '../lib/context/cart.context';
import { useErrorTracker } from '../lib/utils/logger';
import { menuVerseAPI } from '../lib/services/menuverse-api';
import type { Eatery } from '../lib/types/menuverse';
import styles from '../styles/Home.module.css';

// Use MenuVerse Eatery type (compatible with our Restaurant interface)
type Restaurant = Eatery;

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { count, total } = useCart();
  const { trackError } = useErrorTracker();

  // Helper function to properly resolve image URLs
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    
    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a data URL (base64), return as is
    if (url.startsWith('data:')) {
      return url;
    }
    
    // If it's a relative path from admin panel uploads
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      // For development, try multiple approaches:
      // 1. Use API proxy (most reliable)
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      return `/api/images/${cleanPath}`;
    }
    
    // If it looks like a filename from uploads directory
    if (url.includes('_') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'))) {
      return `/api/images/uploads/restaurants/${url}`;
    }
    
    // Default: treat as relative to current domain
    return url;
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🍽️ Loading restaurants from MenuVerse...');
      
      const eateries = await menuVerseAPI.getRestaurants();
      console.log('✅ Restaurants loaded:', eateries);
      setRestaurants(eateries);
    } catch (err: any) {
      console.error('❌ Error loading restaurants:', err);
      trackError(err, 'MenuVerse restaurant loading failed');
      setError(err.message || 'Failed to load restaurants from MenuVerse');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Food Delivery - Order from Local Restaurants</title>
        <meta name="description" content="Order food from your favorite local restaurants" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-orange-600">FoodDelivery</h1>
              </div>
              
              {/* Cart */}
              <Link href="/cart" className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors">
                <span>🛒</span>
                <span>{count} items</span>
                <span className="font-semibold">₦{total.toLocaleString()}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-12">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Delicious Food Delivered Fast
              </h1>
              <p className="text-xl mb-8">
                Order from your favorite local restaurants
              </p>
              
              {/* Search */}
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          </div>

          {/* Restaurant List */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                All Restaurants ({filteredRestaurants.length})
              </h2>
              
              {/* Development helper buttons */}
              {process.env.NODE_ENV === 'development' && (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      console.log('🔧 Testing MenuVerse connection...');
                      try {
                        const restaurants = await menuVerseAPI.getRestaurants();
                        console.log('✅ MenuVerse connection successful:', restaurants);
                        alert(`Found ${restaurants.length} restaurants in MenuVerse database`);
                        if (restaurants.length === 0) {
                          alert('Database is empty. Use the "Seed Database" button to add sample data.');
                        }
                      } catch (error) {
                        console.error('❌ MenuVerse connection failed:', error);
                        alert(`MenuVerse connection failed: ${error.message}`);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    🔧 Test MenuVerse
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🌱 Seeding MenuVerse database...');
                      try {
                        const { seedMenuVerseDatabase } = await import('../lib/utils/seed-menuverse');
                        const count = await seedMenuVerseDatabase();
                        alert(`✅ Successfully seeded ${count} restaurants!`);
                        // Reload restaurants after seeding
                        loadRestaurants();
                      } catch (error) {
                        console.error('❌ Seeding failed:', error);
                        alert(`❌ Seeding failed: ${error.message}`);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    🌱 Seed Database
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('🔍 Debugging restaurant data...');
                      try {
                        const { debugRestaurantData } = await import('../lib/utils/debug-restaurants');
                        await debugRestaurantData();
                        alert('✅ Debug complete! Check console for details.');
                      } catch (error) {
                        console.error('❌ Debug failed:', error);
                        alert(`❌ Debug failed: ${error.message}`);
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    🔍 Debug Data
                  </button>
                  
                  <button
                    onClick={async () => {
                      console.log('📁 Checking file system...');
                      try {
                        const response = await fetch('/api/debug/check-directories');
                        const data = await response.json();
                        console.log('📁 File system check:', data);
                        alert('✅ File system check complete! Check console for details.');
                      } catch (error) {
                        console.error('❌ File system check failed:', error);
                        alert(`❌ File system check failed: ${error.message}`);
                      }
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                  >
                    📁 Check Files
                  </button>
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading restaurants...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">Error: {error}</p>
                <button 
                  onClick={loadRestaurants}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && filteredRestaurants.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No restaurants found</h3>
                <p className="text-gray-600">
                  {searchTerm ? `No restaurants match "${searchTerm}"` : 'No restaurants available right now'}
                </p>
              </div>
            )}

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Link
                  key={restaurant._id}
                  href={`/restaurant/${restaurant._id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {/* Debug: Show image data in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded z-10 max-w-xs">
                        <div>image: {restaurant.image || 'null'}</div>
                        <div>logoUrl: {restaurant.logoUrl || 'null'}</div>
                        <div>bannerUrl: {restaurant.bannerUrl || 'null'}</div>
                        <div className="text-yellow-300 mt-1">
                          resolved: {getImageUrl(restaurant.image || restaurant.logoUrl || restaurant.bannerUrl)}
                        </div>
                      </div>
                    )}
                    
                    {/* Try multiple image fields with fallbacks */}
                    {(restaurant.image || restaurant.logoUrl || restaurant.bannerUrl) ? (
                      <img
                        src={getImageUrl(restaurant.image || restaurant.logoUrl || restaurant.bannerUrl)}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onLoad={() => {
                          console.log('✅ Image loaded successfully for:', restaurant.name);
                        }}
                        onError={(e) => {
                          console.error('❌ Image load failed for restaurant:', restaurant.name, {
                            attempted: getImageUrl(restaurant.image || restaurant.logoUrl || restaurant.bannerUrl),
                            originalUrl: restaurant.image || restaurant.logoUrl || restaurant.bannerUrl,
                            restaurant: restaurant
                          });
                          // Hide broken image and show placeholder
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const placeholder = target.parentElement?.querySelector('.image-placeholder');
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder - always present but hidden when image loads */}
                    <div className="image-placeholder w-full h-full flex items-center justify-center text-6xl" 
                         style={{ 
                           display: (restaurant.image || restaurant.logoUrl || restaurant.bannerUrl) ? 'none' : 'flex' 
                         }}>
                      🍽️
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {restaurant.name}
                    </h3>
                    {restaurant.address && (
                      <p className="text-gray-600 text-sm mb-3">
                        📍 {restaurant.address}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>⭐ 4.5</span>
                      <span>🕒 20-30 mins</span>
                      <span>🚚 ₦300</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}