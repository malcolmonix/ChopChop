import React, { useState } from 'react';
import Head from 'next/head';
import { useChopChopRestaurants, useChopChopRestaurantSearch, useChopChopRestaurantMenu } from '../lib/hooks/use-chopchop-restaurants';
import { ChopChopRestaurant, ChopChopMenuItem, ChopChopOrderItem, chopChopRestaurantService } from '../lib/services/chopchop-restaurants';
import ChopChopRestaurantCard from '../components/ChopChopRestaurantCard';
import ChopChopSearchBar from '../components/ChopChopSearchBar';
import HeroBanner from '../components/HeroBanner';
import styles from '../styles/Home.module.css';
import gridStyles from '../styles/HomeGrid.module.css';

export default function ChopChopHome() {
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useChopChopRestaurants();
  const { results: searchResults, loading: searchLoading, error: searchError, search, clearSearch } = useChopChopRestaurantSearch();
  const [isSearching, setIsSearching] = useState(false);
  
  // Order flow state
  const [step, setStep] = useState(1); // 1: Restaurants, 2: Menu, 3: Cart, 4: Checkout
  const [selectedRestaurant, setSelectedRestaurant] = useState<ChopChopRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ChopChopMenuItem[]>([]);
  const [cart, setCart] = useState<ChopChopOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      clearSearch();
      return;
    }

    setIsSearching(true);
    try {
      await search(searchTerm);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    clearSearch();
  };

  const selectRestaurant = async (restaurant: ChopChopRestaurant) => {
    try {
      console.log('Selecting restaurant:', restaurant.name);
      setLoading(true);
      setSelectedRestaurant(restaurant);
      
      // Load menu items
      const items = await chopChopRestaurantService.getRestaurantMenu(restaurant.id);
      console.log('Menu items loaded:', items.length);
      setMenuItems(items);
      
      // Advance to menu step
      setStep(2);
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('Failed to load restaurant menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: ChopChopMenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: 1 
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (!selectedRestaurant || cart.length === 0) return;

    try {
      setLoading(true);
      
      const orderData = {
        restaurantId: selectedRestaurant.id,
        customer: customerInfo,
        items: cart,
        totalAmount: calculateTotal(),
        status: 'pending' as const,
        timestamp: new Date()
      };

      const orderId = await chopChopRestaurantService.placeOrder(selectedRestaurant.id, orderData);
      
      if (orderId) {
        alert('🎉 Order placed successfully! Order ID: ' + orderId);
        // Reset order flow
        setStep(1);
        setSelectedRestaurant(null);
        setMenuItems([]);
        setCart([]);
        setCustomerInfo({ name: '', phone: '', email: '', address: '' });
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayedRestaurants = isSearching ? searchResults : restaurants;
  const dataLoading = isSearching ? searchLoading : restaurantsLoading;
  const dataError = isSearching ? searchError : restaurantsError;

  return (
    <>
      <Head>
        <title>ChopChop - Fresh Food Delivery</title>
        <meta name="description" content="Order fresh food from your favorite restaurants with ChopChop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <HeroBanner />

        {/* Main Content */}
        <main className={styles.main}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  <span className="text-orange-600">ChopChop</span> - Fresh Food Delivered
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  Discover amazing restaurants and get your favorite meals delivered fast
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-8">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Lightning Fast Delivery
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified Quality Restaurants
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    Customer Favorite
                  </div>
                </div>
              </div>
              
              <ChopChopSearchBar onSearch={handleSearch} loading={dataLoading} />
              
              {isSearching && (
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center mx-auto"
                >
                  ← Back to all restaurants
                </button>
              )}
            </div>

            {/* Order Flow Progress */}
            {step > 1 && (
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className={`flex items-center ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 1 ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300'}`}>
                      1
                    </div>
                    <span className="ml-2 font-medium">Select Restaurant</span>
                  </div>
                  <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 2 ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300'}`}>
                      2
                    </div>
                    <span className="ml-2 font-medium">Browse Menu</span>
                  </div>
                  <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-orange-600' : 'bg-gray-300'}`}></div>
                  <div className={`flex items-center ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 3 ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300'}`}>
                      3
                    </div>
                    <span className="ml-2 font-medium">Checkout</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Restaurant Selection */}
            {step === 1 && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSearching 
                          ? `Search Results` 
                          : `Available Restaurants`
                        }
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {displayedRestaurants.length} restaurants
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          All open now
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2L13.09 8.26L20 9.27L15 14.14L16.18 21.02L10 17.77L3.82 21.02L5 14.14L0 9.27L6.91 8.26L10 2Z" clipRule="evenodd" />
                          </svg>
                          Top rated
                        </span>
                      </div>
                    </div>
                    {dataLoading && (
                      <div className="flex items-center text-orange-600 bg-white px-4 py-2 rounded-full shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                        Loading...
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">20-45</div>
                      <div className="text-xs text-gray-600">mins delivery</div>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">₦200-500</div>
                      <div className="text-xs text-gray-600">delivery fee</div>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">4.2+</div>
                      <div className="text-xs text-gray-600">avg rating</div>
                    </div>
                  </div>
                </div>

                {dataError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading restaurants</h3>
                        <p className="text-sm text-red-700 mt-1">{dataError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Restaurant Grid */}
                <div className={gridStyles.grid}>
                  {displayedRestaurants.map((restaurant) => (
                    <ChopChopRestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onClick={() => selectRestaurant(restaurant)}
                      loading={loading && selectedRestaurant?.id === restaurant.id}
                      isSelected={selectedRestaurant?.id === restaurant.id}
                    />
                  ))}
                </div>

                {!dataLoading && displayedRestaurants.length === 0 && !dataError && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {isSearching ? 'No restaurants found' : 'No restaurants available'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isSearching 
                        ? 'Try a different search term' 
                        : 'Check back later for new restaurants'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Menu Selection */}
            {step === 2 && selectedRestaurant && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedRestaurant.name}</h2>
                    <p className="text-gray-600 text-lg">{selectedRestaurant.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                        </svg>
                        <span className="ml-1 text-sm font-semibold text-gray-900">{selectedRestaurant.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">• {selectedRestaurant.deliveryTime}</span>
                      <span className="text-sm text-gray-500">• {selectedRestaurant.cuisineType}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-orange-600 hover:text-orange-800 flex items-center font-medium"
                  >
                    ← Back to restaurants
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading delicious menu...</p>
                  </div>
                ) : menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Menu Items Available</h3>
                    <p className="text-gray-500 mb-4">
                      This restaurant is currently updating their menu.
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                    >
                      Choose Another Restaurant
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {menuItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Menu Item Image */}
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={item.imageUrl || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-food.jpg';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <span className="inline-block px-2 py-1 bg-white bg-opacity-90 text-gray-700 text-xs rounded-full font-medium">
                              {item.category}
                            </span>
                          </div>
                        </div>
                        
                        {/* Menu Item Details */}
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-green-600 font-bold text-lg">₦{item.price.toLocaleString()}</p>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Cart ({cart.length} items)</h3>
                        <p className="text-orange-600 font-bold">Total: ₦{calculateTotal().toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setStep(3)}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Checkout */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
                  <button
                    onClick={() => setStep(2)}
                    className="text-orange-600 hover:text-orange-800 font-medium"
                  >
                    ← Back to menu
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-lg">Order Summary - {selectedRestaurant?.name}</h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{item.name} x{item.quantity}</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center font-bold text-xl">
                      <span>Total:</span>
                      <span className="text-green-600">₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 text-lg">Delivery Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address
                      </label>
                      <textarea
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter your delivery address"
                      />
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={placeOrder}
                  disabled={loading || !customerInfo.name || !customerInfo.phone || !customerInfo.email || !customerInfo.address || cart.length === 0}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold text-lg"
                >
                  {loading ? 'Placing Order...' : `Place Order - ₦${calculateTotal().toLocaleString()}`}
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}