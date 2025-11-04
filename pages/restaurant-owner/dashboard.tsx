import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useFirebaseAuth } from '../../lib/context/firebase-auth.context';
import { restaurantAPI } from '../../lib/services/restaurant-api';
import type { Restaurant, MenuItem, MenuCategory } from '../../lib/services/restaurant-api';

export default function RestaurantOwnerDashboard() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's restaurants on mount
  useEffect(() => {
    if (user && !authLoading) {
      loadUserRestaurants();
    }
  }, [user, authLoading]);

  // Load menu data when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      loadMenuData(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  const loadUserRestaurants = async () => {
    try {
      setLoading(true);
      // Note: We'll need to add a query to get restaurants by owner
      // For now, we'll show a placeholder
      setRestaurants([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuData = async (restaurantId: string) => {
    try {
      setLoading(true);
      const [items, categories] = await Promise.all([
        restaurantAPI.getMenuItems(restaurantId),
        restaurantAPI.getMenuCategories(restaurantId),
      ]);
      setMenuItems(items);
      setMenuCategories(categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async () => {
    try {
      setLoading(true);
      const newRestaurant = await restaurantAPI.createRestaurant({
        name: 'My New Restaurant',
        description: 'A great place to eat!',
        contactEmail: user?.email || '',
      });
      setRestaurants(prev => [...prev, newRestaurant]);
      setSelectedRestaurant(newRestaurant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurant Owner Dashboard</h1>
          <p className="mb-4">Please sign in to access your restaurant dashboard.</p>
          <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Restaurant Owner Dashboard - ChopChop</title>
        <meta name="description" content="Manage your restaurant on ChopChop" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Owner Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your restaurants and menus</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Restaurants Section */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Your Restaurants</h2>
                <button
                  onClick={handleCreateRestaurant}
                  disabled={loading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Add Restaurant'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {restaurants.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any restaurants yet.</p>
                  <button
                    onClick={handleCreateRestaurant}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Your First Restaurant'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{restaurant.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-xs ${
                          restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {restaurant.cuisine?.join(', ') || 'No cuisine set'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Restaurant Details */}
          {selectedRestaurant && (
            <div className="bg-white shadow rounded-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{selectedRestaurant.name}</h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Restaurant Info</h3>
                    <p><strong>Description:</strong> {selectedRestaurant.description}</p>
                    <p><strong>Email:</strong> {selectedRestaurant.contactEmail}</p>
                    <p><strong>Phone:</strong> {selectedRestaurant.phoneNumber}</p>
                    <p><strong>Address:</strong> {selectedRestaurant.address}</p>
                    <p><strong>Cuisine:</strong> {selectedRestaurant.cuisine?.join(', ')}</p>
                    <p><strong>Status:</strong> {selectedRestaurant.isActive ? 'Active' : 'Inactive'}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <Link
                        href={`/restaurant-owner/menu/${selectedRestaurant.id}`}
                        className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                      >
                        Edit Menu
                      </Link>
                      <Link
                        href={`/restaurant-owner/settings/${selectedRestaurant.id}`}
                        className="block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-center"
                      >
                        Restaurant Settings
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Menu Overview */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Menu Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
                      <div className="text-blue-800">Menu Items</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                      <div className="text-2xl font-bold text-green-600">{menuCategories.length}</div>
                      <div className="text-green-800">Categories</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {menuItems.filter(item => item.isAvailable).length}
                      </div>
                      <div className="text-purple-800">Available Items</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}