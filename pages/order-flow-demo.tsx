import React, { useState, useEffect } from 'react';
import { menuverseService } from '../lib/services/menuverse';

export default function OrderFlowDemo() {
  const [step, setStep] = useState(1);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St, City, State'
  });
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Load restaurants
  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await menuverseService.getAllEateries();
        setRestaurants(data);
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
    }
    loadRestaurants();
  }, []);

  // Step 2: Load menu when restaurant is selected
  const selectRestaurant = async (restaurant) => {
    setLoading(true);
    setSelectedRestaurant(restaurant);
    try {
      console.log('Loading menu for restaurant:', restaurant.name, restaurant.id);
      const items = await menuverseService.getMenuItems(restaurant.id);
      console.log('Menu items loaded:', items);
      setMenuItems(items);
      setStep(2);
    } catch (error) {
      console.error('Error loading menu:', error);
      alert(`Failed to load menu for ${restaurant.name}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Add to cart
  const addToCart = (item, quantity = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  // Step 4: Place order
  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const orderData = {
        eateryId: selectedRestaurant.id,
        customer,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
      };

      const newOrderId = await menuverseService.placeOrder(selectedRestaurant.id, orderData);
      setOrderId(newOrderId);
      setStep(4);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setStep(1);
    setSelectedRestaurant(null);
    setMenuItems([]);
    setCart([]);
    setOrderId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🍽️ Complete Order Flow Demo
          </h1>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  step >= stepNum ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 ${step > stepNum ? 'bg-blue-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between text-sm text-gray-600 mb-8 max-w-md mx-auto">
            <span>Choose Restaurant</span>
            <span>Browse Menu</span>
            <span>Review Cart</span>
            <span>Order Placed</span>
          </div>

          {/* Step 1: Restaurant Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Choose a Restaurant</h2>
              {restaurants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading restaurants...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => selectRestaurant(restaurant)}
                      className={`border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all ${
                        loading && selectedRestaurant?.id === restaurant.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {loading && selectedRestaurant?.id === restaurant.id ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          ) : (
                            restaurant.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{restaurant.name}</h3>
                          <p className="text-gray-600">{restaurant.description}</p>
                          <p className="text-sm text-blue-600 mt-2">
                            {loading && selectedRestaurant?.id === restaurant.id 
                              ? 'Loading menu...' 
                              : 'Click to view menu →'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Menu Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">{selectedRestaurant.name} Menu</h2>
                <p className="text-gray-600">{selectedRestaurant.description}</p>
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
                <div className="grid gap-4">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">
                          {item.category}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold mb-2">Cart ({cart.length} items)</h3>
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-blue-300 pt-2 font-semibold">
                      Total: ${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors mt-4"
                  >
                    Review Order
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-center">Review Your Order</h2>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Restaurant: {selectedRestaurant.name}</h3>
                
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="flex-1">{item.name} x{item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold">Delivery Information</h4>
                  <div className="grid gap-4">
                    <input
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      placeholder="Your Name"
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <input
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      placeholder="Email"
                      className="border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <textarea
                      value={customer.address}
                      onChange={(e) => setCustomer({...customer, address: e.target.value})}
                      placeholder="Delivery Address"
                      className="border border-gray-300 rounded-lg px-4 py-2"
                      rows={3}
                    />
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={loading || !customer.name || !customer.email || !customer.address}
                  className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Placing Order...' : 'Place Order 🚀'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Order Success */}
          {step === 4 && orderId && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold text-green-600">Order Placed Successfully!</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold mb-2">Order Details</h3>
                <p className="text-sm text-gray-600 mb-2">Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId}</span></p>
                <p className="text-sm text-gray-600 mb-2">Restaurant: {selectedRestaurant.name}</p>
                <p className="text-sm text-gray-600 mb-2">Customer: {customer.name}</p>
                <p className="text-sm text-gray-600">Total: ${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  ✅ Order sent to restaurant database<br/>
                  📱 Restaurant will receive notification<br/>
                  🍳 Order status can be tracked in MenuVerse admin
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetDemo}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Place Another Order
                </button>
                <a
                  href="http://localhost:9002/orders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  View in Restaurant Admin
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}