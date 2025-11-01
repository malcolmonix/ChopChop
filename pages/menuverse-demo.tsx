import React from 'react';
import { useEateries, useEaterySearch } from '../lib/hooks/use-menuverse';
import { Eatery, MenuItem, OrderItem } from '../lib/services/menuverse';
import { MenuverseService } from '../lib/services/menuverse';
import HeroBanner from '../components/HeroBanner';
import styles from '../styles/Home.module.css';
import gridStyles from '../styles/HomeGrid.module.css';

// MenuVerse Restaurant Card Component
interface MenuverseRestaurantCardProps {
  eatery: Eatery;
  onClick?: () => void;
  loading?: boolean;
  isSelected?: boolean;
}

const MenuverseRestaurantCard: React.FC<MenuverseRestaurantCardProps> = ({ eatery, onClick, loading = false, isSelected = false }) => {
  // Generate some mock data for demonstration (in real app, this would come from the eatery data)
  const rating = (4.0 + Math.random() * 1.0).toFixed(1);
  const deliveryTime = `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} mins`;
  const cuisineTypes = ['Nigerian', 'Fast Food', 'Continental', 'Chinese', 'Italian'];
  const cuisineType = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
  const deliveryFee = Math.floor(Math.random() * 3) === 0 ? 'Free' : `₦${(200 + Math.floor(Math.random() * 300)).toLocaleString()}`;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${loading ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <div className="relative h-48">
        <img
          src={eatery.bannerUrl || eatery.logoUrl || '/placeholder-restaurant.jpg'}
          alt={eatery.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-restaurant.jpg';
          }}
        />
        
        {/* Delivery Status Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
            Open Now
          </span>
        </div>

        {/* Delivery Fee Badge */}
        {deliveryFee === 'Free' && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              🚚 Free Delivery
            </span>
          </div>
        )}

        {/* Restaurant Logo */}
        {eatery.logoUrl && (
          <div className="absolute bottom-3 left-3 w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-lg bg-white">
            <img
              src={eatery.logoUrl}
              alt={`${eatery.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Restaurant Name & Cuisine */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{eatery.name}</h3>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
              {cuisineType} Cuisine
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{eatery.description}</p>
        
        {/* Rating & Reviews */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-3">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
            </svg>
            <span className="ml-1 text-sm font-semibold text-gray-900">{rating}</span>
            <span className="ml-1 text-sm text-gray-500">(100+)</span>
          </div>
          <span className="text-sm text-gray-500">• {deliveryTime}</span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {deliveryTime}
          </div>
          <div className="flex items-center">
            {deliveryFee !== 'Free' && (
              <span className="text-sm text-gray-500 mr-3">{deliveryFee} delivery</span>
            )}
            <span className="text-sm font-semibold text-blue-600 flex items-center">
              View Menu
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search Component
interface SearchBarProps {
  onSearch: (term: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search restaurants..."
          className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </form>
  );
};

export default function MenuverseHome() {
  const { eateries, loading: eateriesLoading, error: eateriesError } = useEateries(24);
  const { results: searchResults, loading: searchLoading, error: searchError, search } = useEaterySearch();
  const [isSearching, setIsSearching] = React.useState(false);
  
  // Order flow state
  const [step, setStep] = React.useState(1); // 1: Restaurants, 2: Menu, 3: Cart, 4: Checkout
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Eatery | null>(null);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [cart, setCart] = React.useState<OrderItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [customerInfo, setCustomerInfo] = React.useState({
    name: '',
    email: '',
    address: ''
  });

  const menuverseService = new MenuverseService();

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    await search(searchTerm);
  };

  const handleClearSearch = () => {
    setIsSearching(false);
  };

  const selectRestaurant = async (restaurant: Eatery) => {
    try {
      console.log('Selecting restaurant:', restaurant.name);
      setLoading(true);
      setSelectedRestaurant(restaurant);
      
      // Load menu items
      const items = await menuverseService.getMenuItems(restaurant.id);
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

  const addToCart = (item: MenuItem) => {
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
        eateryId: selectedRestaurant.id,
        customer: customerInfo,
        items: cart,
        totalAmount: calculateTotal(),
        status: 'pending' as const,
        timestamp: new Date()
      };

      const orderId = await menuverseService.placeOrder(selectedRestaurant.id, orderData);
      
      if (orderId) {
        alert('Order placed successfully! Order ID: ' + orderId);
        // Reset order flow
        setStep(1);
        setSelectedRestaurant(null);
        setMenuItems([]);
        setCart([]);
        setCustomerInfo({ name: '', email: '', address: '' });
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

  const handleRestaurantClick = selectRestaurant;

  const displayedEateries = isSearching ? searchResults : eateries;
  const dataLoading = isSearching ? searchLoading : eateriesLoading;
  const dataError = isSearching ? searchError : eateriesError;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <HeroBanner />

      {/* Main Content */}
      <main className={styles.main}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Search Section */}
          <div className="text-center mb-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Amazing Restaurants
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Fresh food from MenuVerse partner restaurants
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Fast Delivery
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified Restaurants
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Top Rated
                </div>
              </div>
            </div>
            
            <SearchBar onSearch={handleSearch} loading={dataLoading} />
            
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ← Back to all restaurants
              </button>
            )}
          </div>

          {/* Order Flow Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="ml-2 font-medium">Select Restaurant</span>
              </div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="ml-2 font-medium">Browse Menu</span>
              </div>
              <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 font-medium">Checkout</span>
              </div>
            </div>
          </div>

          {/* Step 1: Restaurant Selection */}
          {step === 1 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
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
                        {isSearching ? searchResults.length : eateries.length} restaurants
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
                        Highly rated
                      </span>
                    </div>
                  </div>
                  {dataLoading && (
                    <div className="flex items-center text-blue-600 bg-white px-4 py-2 rounded-full shadow-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
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
                      <p className="text-xs text-red-600 mt-2">
                        Make sure MenuVerse Firebase credentials are configured in .env.local
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Restaurant Grid */}
              <div className={gridStyles.grid}>
                {displayedEateries.map((eatery) => (
                  <MenuverseRestaurantCard
                    key={eatery.id}
                    eatery={eatery}
                    onClick={() => handleRestaurantClick(eatery)}
                    loading={loading && selectedRestaurant?.id === eatery.id}
                    isSelected={selectedRestaurant?.id === eatery.id}
                  />
                ))}
              </div>

              {!dataLoading && displayedEateries.length === 0 && !dataError && (
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
                  <h2 className="text-2xl font-semibold">{selectedRestaurant.name} Menu</h2>
                  <p className="text-gray-600">{selectedRestaurant.description}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  ← Back to restaurants
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Menu Items Available</h3>
                  <p className="text-gray-500 mb-4">
                    This restaurant hasn't added any menu items yet.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">Cart ({cart.length} items)</h3>
                      <p className="text-blue-600 font-bold">Total: ₦{calculateTotal().toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
                <h2 className="text-2xl font-semibold">Checkout</h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ← Back to menu
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Order Summary - {selectedRestaurant?.name}</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span>{item.name} x{item.quantity}</span>
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
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
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
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>₦{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your delivery address"
                    />
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={placeOrder}
                disabled={loading || !customerInfo.name || !customerInfo.email || !customerInfo.address || cart.length === 0}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Placing Order...' : `Place Order - ₦${calculateTotal().toLocaleString()}`}
              </button>
            </div>
          )}

          {/* Development Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">MenuVerse Integration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This page demonstrates integration with MenuVerse API. Configure your MenuVerse Firebase credentials 
                  in .env.local to see real restaurant data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}