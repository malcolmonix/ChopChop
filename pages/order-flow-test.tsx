import React, { useState, useEffect } from 'react';
import { menuverseService } from '../lib/services/menuverse';

export default function OrderFlowTest() {
  const [status, setStatus] = useState('Testing...');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date() }]);
  };

  useEffect(() => {
    async function runTests() {
      addResult('Starting order flow tests...');
      
      try {
        // Test 1: Load restaurants
        addResult('Testing restaurant loading...');
        const restaurantData = await menuverseService.getAllEateries();
        setRestaurants(restaurantData);
        
        if (restaurantData.length === 0) {
          addResult('❌ No restaurants found in database', false);
          return;
        } else {
          addResult(`✅ Found ${restaurantData.length} restaurant(s)`);
        }

        // Test 2: Load menu items for first restaurant
        const firstRestaurant = restaurantData[0];
        setSelectedRestaurant(firstRestaurant);
        addResult(`Testing menu loading for "${firstRestaurant.name}"...`);
        
        const menuData = await menuverseService.getMenuItems(firstRestaurant.id);
        setMenuItems(menuData);
        
        if (menuData.length === 0) {
          addResult(`❌ No menu items found for "${firstRestaurant.name}"`, false);
          addResult('ℹ️ Restaurant exists but has no menu items. Add items in MenuVerse admin.', false);
        } else {
          addResult(`✅ Found ${menuData.length} menu item(s) for "${firstRestaurant.name}"`);
        }

        // Test 3: Test order placement (simulation)
        if (menuData.length > 0) {
          addResult('Testing order placement...');
          
          const testOrder = {
            eateryId: firstRestaurant.id,
            customer: {
              name: 'Test Customer',
              email: 'test@example.com',
              address: '123 Test Street'
            },
            items: [{
              id: menuData[0].id,
              name: menuData[0].name,
              quantity: 1,
              price: menuData[0].price
            }],
            totalAmount: menuData[0].price
          };

          try {
            const orderId = await menuverseService.placeOrder(firstRestaurant.id, testOrder);
            if (orderId) {
              addResult(`✅ Order placed successfully! Order ID: ${orderId}`);
              addResult(`🎉 Complete order flow is working!`);
            } else {
              addResult('❌ Order placement failed - no order ID returned', false);
            }
          } catch (orderError) {
            addResult(`❌ Order placement failed: ${orderError.message}`, false);
          }
        }

        setStatus('Tests completed');
      } catch (error) {
        addResult(`❌ Test failed: ${error.message}`, false);
        setStatus('Tests failed');
      }
    }

    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6">Order Flow Test Results</h1>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className={`w-4 h-4 rounded-full ${
                status === 'Testing...' ? 'bg-yellow-400 animate-pulse' : 
                status === 'Tests completed' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="font-semibold">{status}</span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <span className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </span>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedRestaurant && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Restaurant Details</h2>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedRestaurant.name}</p>
                  <p><strong>Description:</strong> {selectedRestaurant.description}</p>
                  <p><strong>ID:</strong> {selectedRestaurant.id}</p>
                  <p><strong>Email:</strong> {selectedRestaurant.contactEmail || 'Not set'}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Menu Items ({menuItems.length})</h2>
                {menuItems.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">No menu items found</p>
                    <p className="text-sm text-gray-500">
                      Visit <a href="http://localhost:9002/menu" target="_blank" className="text-blue-600 hover:underline">MenuVerse Admin</a> to add menu items
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {menuItems.map((item, index) => (
                      <div key={item.id} className="bg-white rounded p-3 border">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-gray-600 block">{item.category}</span>
                          </div>
                          <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Next Steps:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. If no restaurants: Sign in to MenuVerse and create restaurant profile</li>
              <li>2. If no menu items: Add menu items in MenuVerse admin</li>
              <li>3. If order placement fails: Check Firebase permissions and authentication</li>
              <li>4. Test complete flow in Order Flow Demo once all data is ready</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <a
              href="http://localhost:9002"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              Open MenuVerse Admin
            </a>
            <a
              href="/order-flow-demo"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Try Order Flow Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}