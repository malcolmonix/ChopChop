import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getMenuverseFirestore, ensureMenuverseAuth } from '../lib/firebase/menuverse';
import { useRouter } from 'next/router';

// Extended Order interface with delivery tracking
interface OrderWithTracking {
  id: string;
  eateryId: string;
  eateryName: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Canceled';
  deliveryStatus: 'order_received' | 'packaging' | 'awaiting_dispatch' | 'dispatch_arrived' | 'dispatched' | 'dispatch_otw' | 'dispatch_arrived_location' | 'delivered';
  createdAt: any;
  estimatedDeliveryTime?: string;
  trackingUpdates: {
    status: string;
    timestamp: any;
    message: string;
  }[];
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
          onClick={() => router.push(`/order-details/${order.id}`)}
          className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 text-sm font-medium"
        >
          View Details
        </button>
        {order.status === 'Delivered' && (
          <button
            onClick={() => router.push(`/rate-order/${order.id}`)}
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
  const [orders, setOrders] = useState<OrderWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get customer info from localStorage or session
    const savedCustomer = localStorage.getItem('lastCustomerInfo');
    if (savedCustomer) {
      setCustomerInfo(JSON.parse(savedCustomer));
    } else {
      // Redirect to home if no customer info
      router.push('/');
      return;
    }

    // Subscribe to orders for this customer
    const fetchOrders = async () => {
      try {
        await ensureMenuverseAuth();
        const db = getMenuverseFirestore();
        
        if (!db) {
          console.error('Failed to initialize Firestore');
          return;
        }

        // Query orders across all eateries for this customer
        // Note: In a real app, you'd have a dedicated orders collection indexed by customer
        // For now, we'll simulate this with a customer-specific approach
        
        // Mock data for demonstration - replace with real query
        const mockOrders: OrderWithTracking[] = [
          {
            id: 'order_001',
            eateryId: 'eatery_1',
            eateryName: 'Mama Cass Kitchen',
            customer: JSON.parse(savedCustomer),
            items: [
              { id: '1', name: 'Jollof Rice & Chicken', quantity: 2, price: 2500 },
              { id: '2', name: 'Coca-Cola', quantity: 2, price: 300 }
            ],
            totalAmount: 5600,
            status: 'Out for Delivery',
            deliveryStatus: 'dispatch_otw',
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            estimatedDeliveryTime: '25-35 mins',
            trackingUpdates: []
          },
          {
            id: 'order_002',
            eateryId: 'eatery_2',
            eateryName: 'KFC Lagos',
            customer: JSON.parse(savedCustomer),
            items: [
              { id: '3', name: 'Family Feast', quantity: 1, price: 8500 }
            ],
            totalAmount: 8500,
            status: 'Delivered',
            deliveryStatus: 'delivered',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            trackingUpdates: []
          }
        ];

        setOrders(mockOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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

  if (loading) {
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
              <div className="text-sm text-gray-600">
                {customerInfo?.name}
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