import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import { orderService, Order, SortOption } from '@/lib/services/order.service';

// Extended Order interface with delivery tracking
interface OrderWithTracking extends Order {
  // All properties inherited from Order service
}

const deliverySteps = [
  { id: 'order_received', label: 'Order Received', description: 'Restaurant has received your order', icon: '📋' },
  { id: 'packaging', label: 'Packaging', description: 'Your food is being prepared and packaged', icon: '👨‍🍳' },
  { id: 'awaiting_dispatch', label: 'Awaiting Dispatch', description: 'Order is ready and waiting for pickup', icon: '📦' },
  { id: 'dispatch_arrived', label: 'Dispatch Arrived', description: 'Delivery rider has arrived at restaurant', icon: '🏍️' },
  { id: 'dispatched', label: 'Dispatched', description: 'Order has been picked up by delivery rider', icon: '🚚' },
  { id: 'dispatch_otw', label: 'On The Way', description: 'Delivery rider is heading to your location', icon: '🛣️' },
  { id: 'dispatch_arrived_location', label: 'Arrived at Location', description: 'Delivery rider has arrived at your address', icon: '🏠' },
  { id: 'delivered', label: 'Delivered', description: 'Order has been successfully delivered', icon: '✅' }
];

const OrderTrackingCard: React.FC<{ order: OrderWithTracking }> = ({ order }) => {
  const currentStepIndex = deliverySteps.findIndex(step => step.id === order.deliveryStatus);
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Preparing': return 'bg-orange-100 text-orange-800';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Order #{order.id.slice(-8)}</h3>
          <p className="text-gray-600">{order.eateryName}</p>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          <p className="text-lg font-bold text-gray-900 mt-1">₦{order.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Items Ordered</h4>
        <div className="space-y-1">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Tracking */}
      {order.status !== 'Canceled' && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-3">Delivery Progress</h4>
          <div className="space-y-3">
            {deliverySteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className={`flex items-center ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  } ${isCurrent ? 'ring-2 ring-green-300' : ''}`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-green-900' : 'text-gray-500'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                      {step.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <div className="flex-shrink-0">
                      <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => router.push(`/order-details/${order.orderId}`)}
          className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm font-medium"
        >
          View Details
        </button>
        {order.status === 'Delivered' && (
          <button
            onClick={() => router.push(`/rate-order/${order.orderId}`)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Rate Order
          </button>
        )}
        {order.status !== 'Delivered' && order.status !== 'Canceled' && (
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            Order Again
          </button>
        )}
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState<OrderWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Get customer info from localStorage or session
    const savedCustomer = localStorage.getItem('lastCustomerInfo');
    if (savedCustomer) {
      setCustomerInfo(JSON.parse(savedCustomer));
    }
  }, []);

  // Fetch orders using the new OrderService
  const fetchOrders = async () => {
    if (authLoading) return;
    
    console.log('🔄 Fetching orders using OrderService...');
    setLoading(true);
    
    try {
      let fetchedOrders: Order[];
      
      // If we have customer info, use it for filtering
      if (customerInfo?.email) {
        console.log(`📧 Fetching orders for customer: ${customerInfo.email}`);
        
        // Use the appropriate filter method
        if (filter === 'active') {
          fetchedOrders = await orderService.getActiveOrders(customerInfo.email);
        } else if (filter === 'completed') {
          fetchedOrders = await orderService.getCompletedOrders(customerInfo.email);
        } else {
          fetchedOrders = await orderService.getOrders(
            { customerEmail: customerInfo.email },
            sortBy,
            false // Don't use cache for fresh data
          );
        }
      } else {
        console.log('ℹ️ No customer info available, fetching all recent orders');
        // Fetch recent orders without filter
        fetchedOrders = await orderService.getOrders(
          { limit: 50 },
          sortBy,
          false
        );
      }
      
      console.log(`✅ Successfully loaded ${fetchedOrders.length} orders`);
      setOrders(fetchedOrders as OrderWithTracking[]);
      
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync orders from MenuVerse to Firebase
  const syncOrders = async () => {
    try {
      setSyncing(true);
      console.log('🔄 Syncing orders from MenuVerse...');
      
      const response = await fetch('/api/sync-orders', {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Orders synced:', result);
        
        // Clear cache and refresh orders
        orderService.clearCache();
        await fetchOrders();
      } else {
        console.error('❌ Failed to sync orders:', await response.text());
      }
    } catch (error) {
      console.error('❌ Error syncing orders:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Auto-sync orders every 30 seconds for active orders
  useEffect(() => {
    const hasActiveOrders = orders.some(order => 
      order.status !== 'Delivered' && order.status !== 'Canceled'
    );

    if (hasActiveOrders && user) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-syncing orders...');
        syncOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [orders, user]);

  // Fetch orders on mount and when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [authLoading, customerInfo, filter, sortBy]);

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'active':
        return !['Delivered', 'Canceled'].includes(order.status);
      case 'completed':
        return ['Delivered', 'Canceled'].includes(order.status);
      default:
        return true;
    }
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - ChopChop</title>
        <meta name="description" content="Track your food delivery orders" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/')}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={syncOrders}
                  disabled={syncing}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  title="Sync latest order status from restaurant"
                >
                  {syncing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sync Orders</span>
                    </>
                  )}
                </button>
                <div className="text-sm text-gray-600">
                  {customerInfo?.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'active', label: 'Active', count: orders.filter(o => !['Delivered', 'Canceled'].includes(o.status)).length },
              { id: 'completed', label: 'Completed', count: orders.filter(o => ['Delivered', 'Canceled'].includes(o.status)).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't placed any orders yet."
                  : `No ${filter} orders at the moment.`
                }
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderTrackingCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}