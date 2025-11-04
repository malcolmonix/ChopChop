import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client/react';
import { GET_USER_ORDERS } from '@/lib/graphql/queries';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase/client';

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
  const { user, loading: authLoading } = useFirebaseAuth();
  const [orders, setOrders] = useState<OrderWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const router = useRouter();
  const { data, loading: queryLoading, refetch } = useQuery<any>(GET_USER_ORDERS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000,
    skip: authLoading || !user,
  });

  useEffect(() => {
    if (!authLoading && user) {
      refetch?.();
    }
  }, [authLoading, user, refetch]);

  useEffect(() => {
    // Get customer info from localStorage or session (optional)
    const savedCustomer = localStorage.getItem('lastCustomerInfo');
    if (savedCustomer) {
      setCustomerInfo(JSON.parse(savedCustomer));
    }
  }, []);

  // Fallback: If GraphQL returns no orders, try fetching from Firebase directly
  useEffect(() => {
    const fetchFromFirebase = async () => {
      if ((data && data.orders && data.orders.length > 0) || !customerInfo) return;
      try {
        const app = getFirebaseApp();
        const db = getFirestore(app);
        const snapshot = await getDocs(collection(db, 'orders'));
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Simple client-side filter: match deliveryAddress or orderAmount if available
        const matched = docs.filter((d: any) => {
          if (!customerInfo) return false;
          const addr = (d.deliveryAddress || '').toLowerCase();
          const customerAddr = (customerInfo.address || '').toLowerCase();
          const emailMatch = customerInfo.email && d.customer && d.customer.email && d.customer.email === customerInfo.email;
          return (customerAddr && addr.includes(customerAddr)) || emailMatch;
        }).map((d: any) => ({
          id: d.id,
          orderId: d.orderId || d.id,
          status: d.orderStatus || d.status || 'PENDING',
          total: d.paidAmount || d.orderAmount || d.totalAmount || 0,
          createdAt: d.createdAt || d.orderDate || new Date().toISOString(),
          items: (d.items || []).map((it: any, idx: number) => ({ id: it.id || `${d.id}-item-${idx}`, name: it.title || it.name, quantity: it.quantity || 1, price: it.price || 0 })),
          restaurant: d.restaurantId || d.restaurant || 'Restaurant'
        }));

        if (matched.length > 0) {
          // Transform to the shape expected by the rest of this page
          const mapped = matched.map((o: any) => ({
            id: o.id,
            orderId: o.orderId,
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            items: o.items,
            restaurant: o.restaurant
          }));

          // Build the same structure the page expects via the "data" variable
          (window as any).__FALLBACK_ORDERS = mapped; // debug hook
          // Set local state by faking the GraphQL data mapping
          const apiToFriendly: Record<string, OrderWithTracking['status']> = {
            'PENDING_PAYMENT': 'Pending',
            'CONFIRMED': 'Confirmed',
            'PROCESSING': 'Preparing',
            'READY': 'Preparing',
            'OUT_FOR_DELIVERY': 'Out for Delivery',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Canceled',
          };
          const deliveryStatusMap: Record<OrderWithTracking['status'], OrderWithTracking['deliveryStatus']> = {
            'Pending': 'order_received',
            'Confirmed': 'awaiting_dispatch',
            'Preparing': 'packaging',
            'Out for Delivery': 'dispatch_otw',
            'Delivered': 'delivered',
            'Canceled': 'order_received',
          };

          const mappedOrders: OrderWithTracking[] = mapped.map((o: any) => {
            const friendly = apiToFriendly[o.status] || 'Pending';
            return {
              id: o.id,
              eateryId: '',
              eateryName: o.restaurant || 'Restaurant',
              customer: customerInfo || { name: '', phone: '', email: '', address: '' },
              items: o.items.map((it: any) => ({ id: it.id, name: it.name, quantity: it.quantity, price: it.price })),
              totalAmount: Number(o.total || 0),
              status: friendly,
              deliveryStatus: deliveryStatusMap[friendly] || 'order_received',
              createdAt: o.createdAt,
              estimatedDeliveryTime: undefined,
              trackingUpdates: [],
            };
          });

          setOrders(mappedOrders);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Firebase fallback orders fetch failed', err);
      }
    };

    fetchFromFirebase();
  }, [data, customerInfo]);

  // Map GraphQL orders to UI model
  useEffect(() => {
    if (!data) return;
    const apiToFriendly: Record<string, OrderWithTracking['status']> = {
      'PENDING_PAYMENT': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Preparing',
      'READY': 'Preparing',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Canceled',
    };
    const deliveryStatusMap: Record<OrderWithTracking['status'], OrderWithTracking['deliveryStatus']> = {
      'Pending': 'order_received',
      'Confirmed': 'awaiting_dispatch',
      'Preparing': 'packaging',
      'Out for Delivery': 'dispatch_otw',
      'Delivered': 'delivered',
      'Canceled': 'order_received',
    };

    const mapped: OrderWithTracking[] = (data.orders || []).map((o: any) => {
      const friendly = apiToFriendly[o.status] || 'Pending';
      return {
        id: o.id,
        eateryId: '',
        eateryName: o.restaurant || 'Restaurant',
        customer: customerInfo || { name: '', phone: '', email: '', address: '' },
        items: (o.items || []).map((it: any) => ({ id: it.id, name: it.name, quantity: it.quantity, price: it.price })),
        totalAmount: Number(o.total || 0),
        status: friendly,
        deliveryStatus: deliveryStatusMap[friendly] || 'order_received',
        createdAt: o.createdAt,
        estimatedDeliveryTime: undefined,
        trackingUpdates: [],
      };
    });
    setOrders(mapped);
    setLoading(false);
  }, [data, customerInfo]);

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

  if (authLoading || loading || queryLoading) {
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