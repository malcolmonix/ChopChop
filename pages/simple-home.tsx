import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';

// Simple interfaces
interface Restaurant {
  _id: string;
  name: string;
  image?: string;
  address?: string;
  isActive?: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  restaurant_id: string;
}

// Simple queries
const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      _id
      name
      image
      address
      isActive
    }
  }
`;

const GET_MENU_ITEMS = gql`
  query GetMenuItems {
    menuItems {
      id
      name
      price
      restaurant_id
    }
  }
`;

export default function SimplifiedHome() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        const result = await client.query({
          query: GET_RESTAURANTS,
          fetchPolicy: 'network-only'
        });
        
        const activeRestaurants = ((result.data as any)?.restaurants || []).filter((r: Restaurant) => r.isActive !== false);
        setRestaurants(activeRestaurants);
      } catch (err: any) {
        console.error('Error loading restaurants:', err);
        setError(err.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>ChopChop - Food Delivery</title>
        <meta name="description" content="Order food from local restaurants" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-orange-600">ChopChop</h1>
            <nav className="flex items-center space-x-4">
              <Link href="/cart" className="text-gray-600 hover:text-gray-900">
                Cart
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Order Food from Local Restaurants
          </h1>
          <p className="text-xl text-gray-600">
            Fresh meals delivered to your door
          </p>
        </div>

        {/* Restaurant List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Available Restaurants
          </h2>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-600">Loading restaurants...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading restaurants</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm text-red-800 underline hover:no-underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && restaurants.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants available</h3>
              <p className="text-gray-600">Check back soon for new restaurants!</p>
            </div>
          )}

          {!loading && !error && restaurants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link 
                  key={restaurant._id} 
                  href={`/restaurant/${restaurant._id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    {/* Restaurant Image */}
                    <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative">
                      {restaurant.image ? (
                        <img 
                          src={restaurant.image} 
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Restaurant Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {restaurant.name}
                      </h3>
                      {restaurant.address && (
                        <p className="text-gray-600 text-sm mb-3">
                          📍 {restaurant.address}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-orange-600 font-medium">
                          View Menu →
                        </span>
                        <span className="text-xs text-gray-500">
                          Open now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-orange-50 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready to order?
            </h3>
            <p className="text-gray-600 mb-4">
              Browse restaurants, add items to cart, and place your order!
            </p>
            {restaurants.length > 0 && (
              <Link 
                href={`/restaurant/${restaurants[0]._id}`}
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Order Now
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ChopChop. Fresh food delivered.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}