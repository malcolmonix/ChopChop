import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { menuVerseAPI } from '../../lib/services/menuverse-api';
import { useErrorTracker } from '../../lib/utils/logger';
import { useCart } from '../../lib/context/cart.context';
import { useToast } from '../../lib/context/toast.context';
import type { Eatery, MenuItem } from '../../lib/types/menuverse';

export default function RestaurantDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem, count, total } = useCart();
  const { showToast } = useToast();
  const { trackError } = useErrorTracker();
  
  const [restaurant, setRestaurant] = useState<Eatery | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadRestaurantAndMenu(id);
    }
  }, [id]);

  const loadRestaurantAndMenu = async (restaurantId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🍽️ Loading restaurant ${restaurantId} from MenuVerse...`);

      // Load restaurant details and menu in parallel
      const [restaurantData, menuData] = await Promise.all([
        menuVerseAPI.getRestaurant(restaurantId),
        menuVerseAPI.getRestaurantMenu(restaurantId)
      ]);

      console.log(`🔍 Restaurant data:`, restaurantData);
      console.log(`🔍 Menu data (${menuData?.length || 0} items):`, menuData);

      if (!restaurantData) {
        setError('Restaurant not found');
        return;
      }

      setRestaurant(restaurantData);
      setMenuItems(menuData || []);
      console.log(`✅ Loaded restaurant: ${restaurantData.name} with ${menuData?.length || 0} menu items`);
      
      // Additional debug info
      if (!menuData || menuData.length === 0) {
        console.log('❌ No menu items found - checking MenuVerse API...');
        const allRestaurants = await menuVerseAPI.getRestaurants();
        console.log(`📋 Total restaurants in database: ${allRestaurants.length}`);
      }
    } catch (err: any) {
      console.error('❌ Error loading restaurant:', err);
      trackError(err, `Restaurant detail loading failed for ID: ${restaurantId}`);
      setError(err.message || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (menuItem: MenuItem) => {
    try {
      setAddingToCart(menuItem.id);
      
      console.log('🛒 Adding to cart:', {
        menuItem: menuItem.name,
        restaurant: restaurant?.name,
        cartCount: count,
        cartTotal: total
      });
      
      // Add item to cart using new API format
      addItem({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        restaurantId: restaurant?.id || '',
        restaurantName: restaurant?.name || ''
      });

      // Show success toast notification
      showToast('success', `${menuItem.name} added to cart! 🛒`);

      console.log('✅ Added to cart successfully. New count:', count + 1);
    } catch (err: any) {
      console.error('❌ Error adding to cart:', err);
      trackError(err, `Add to cart failed for item: ${menuItem.name}`);
      showToast('error', 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => id && loadRestaurantAndMenu(id as string)}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 text-center"
            >
              Back to Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <Link
            href="/"
            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Object.keys(menuByCategory).sort();

  return (
    <>
      <Head>
        <title>{restaurant.name} - Menu & Ordering</title>
        <meta name="description" content={`Order from ${restaurant.name}. ${restaurant.description}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Link>
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
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

        {/* Restaurant Hero */}
        <div className="relative h-64 bg-gradient-to-r from-orange-400 to-red-500">
          {restaurant.bannerUrl ? (
            <img
              src={restaurant.bannerUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-6xl">🍽️</div>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end space-x-4">
                {restaurant.logoUrl && (
                  <img
                    src={restaurant.logoUrl}
                    alt={`${restaurant.name} logo`}
                    className="w-20 h-20 rounded-full border-4 border-white bg-white object-cover"
                  />
                )}
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                  <p className="text-lg opacity-90">{restaurant.description}</p>
                  {restaurant.address && (
                    <p className="text-sm opacity-75 mt-1">📍 {restaurant.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Menu Available</h3>
              <p className="text-gray-600 mb-6">
                This restaurant hasn't uploaded their menu yet.
              </p>
              
              {/* Development helper */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={async () => {
                    try {
                      const { seedMenuVerseDatabase } = await import('../../lib/utils/seed-menuverse');
                      await seedMenuVerseDatabase();
                      // Reload the page
                      window.location.reload();
                    } catch (error) {
                      console.error('Seeding failed:', error);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  🌱 Add Sample Menu Items
                </button>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Menu ({menuItems.length} items)
              </h2>

              {categories.map(category => (
                <div key={category} className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    {category}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuByCategory[category].map((item) => (
                      <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-4xl">
                            🍽️
                          </div>
                        )}
                        
                        <div className="p-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-orange-600">
                              ₦{item.price.toLocaleString()}
                            </span>
                            
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingToCart === item.id}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 font-medium"
                            >
                              {addingToCart === item.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Adding...
                                </div>
                              ) : (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add to Cart
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
