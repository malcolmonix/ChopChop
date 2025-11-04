import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import OrderTrackingService, { OrderDetails } from '@/lib/services/order-tracking';
import OrderStatusTimeline from '@/lib/components/OrderStatusTimeline';
import TrackingInfo from '@/lib/components/TrackingInfo';

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

export default function OrderTrackingPage() {
  const router = useRouter();
  const { orderid } = router.query;
  const { user, loading: authLoading } = useFirebaseAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderid || typeof orderid !== 'string') return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time order updates
    const unsubscribeOrder = OrderTrackingService.subscribeToOrder(
      orderid,
      (updatedOrder) => {
        if (updatedOrder) {
          setOrder(updatedOrder);
          setLoading(false);
        } else {
          setError('Order not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Order subscription error:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    );

    // Subscribe to rider location updates
    const unsubscribeRider = OrderTrackingService.subscribeToRiderLocation(
      orderid,
      (location) => {
        setRiderLocation(location);
      }
    );

    return () => {
      unsubscribeOrder();
      unsubscribeRider();
    };
  }, [orderid]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find the order you're looking for."}
          </p>
          <button
            onClick={() => router.push('/orders')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const deliveryStatus = order.tracking?.deliveryStatus || order.deliveryStatus || 'order_received';
  const estimatedTime = order.tracking?.estimatedDeliveryTime || 
    OrderTrackingService.calculateEstimatedDelivery(order.orderStatus, deliveryStatus);
  const statusMessage = OrderTrackingService.getStatusMessage(order.orderStatus, deliveryStatus);
  const progressPercentage = OrderTrackingService.getProgressPercentage(deliveryStatus);

  return (
    <>
      <Head>
        <title>Track Order #{order.orderId.slice(-8)} - ChopChop</title>
        <meta name="description" content="Track your food delivery in real-time" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/orders')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
                <p className="text-sm text-gray-600">{order.restaurantName || 'Restaurant'}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Tracking Info Card */}
          <TrackingInfo
            orderId={order.orderId}
            status={deliveryStatus}
            statusMessage={statusMessage}
            orderDate={order.orderDate}
            estimatedTime={estimatedTime}
            rider={order.tracking?.rider}
            progressPercentage={progressPercentage}
          />

          {/* Timeline */}
          <OrderStatusTimeline
            currentStatus={deliveryStatus}
            steps={deliverySteps}
            estimatedTime={estimatedTime}
          />

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            
            {/* Items */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.quantity}x {item.name}
                    </p>
                    {item.variation && (
                      <p className="text-sm text-gray-600">Variation: {item.variation}</p>
                    )}
                    {item.addons && (
                      <p className="text-sm text-gray-600">Add-ons: {item.addons}</p>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 ml-4">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.orderAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.deliveryCharges)}</span>
              </div>
              {order.tipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tip</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.tipping)}</span>
                </div>
              )}
              {order.taxationAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">{formatCurrency(order.taxationAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-600">{formatCurrency(order.paidAmount)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery Address</h4>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-900">{order.deliveryAddress}</p>
                  <p className="text-xs text-gray-600 mt-1">{order.customer.name} • {order.customer.phone || order.customer.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Method</h4>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-sm text-gray-900">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Special Instructions */}
            {order.instructions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Special Instructions</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.instructions}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to contact support about this order?')) {
                    router.push(`/support?orderId=${order.orderId}`);
                  }
                }}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Contact Support
              </button>
            )}
            
            {order.orderStatus === 'DELIVERED' && (
              <button
                onClick={() => router.push(`/rate-order/${orderid}`)}
                className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Rate Your Order
              </button>
            )}

            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 font-medium transition-colors"
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface OrderDetails {
  id: string;
  eateryId: string;
  eateryName: string;
  eateryPhone?: string;
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
    imageUrl?: string;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Canceled';
  deliveryStatus: 'order_received' | 'packaging' | 'awaiting_dispatch' | 'dispatch_arrived' | 'dispatched' | 'dispatch_otw' | 'dispatch_arrived_location' | 'delivered';
  createdAt: any;
  estimatedDeliveryTime?: string;
  deliveryFee: number;
  riderInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
  };
  trackingUpdates: {
    status: string;
    timestamp: any;
    message: string;
    location?: string;
  }[];
}

const deliverySteps = [
  { id: 'order_received', label: 'Order Received', description: 'Restaurant has received your order', icon: '📋', color: 'text-blue-600' },
  { id: 'packaging', label: 'Packaging', description: 'Your food is being prepared and packaged', icon: '👨‍🍳', color: 'text-orange-600' },
  { id: 'awaiting_dispatch', label: 'Awaiting Dispatch', description: 'Order is ready and waiting for pickup', icon: '📦', color: 'text-purple-600' },
  { id: 'dispatch_arrived', label: 'Dispatch Arrived', description: 'Delivery rider has arrived at restaurant', icon: '🏍️', color: 'text-indigo-600' },
  { id: 'dispatched', label: 'Dispatched', description: 'Order has been picked up by delivery rider', icon: '🚚', color: 'text-pink-600' },
  { id: 'dispatch_otw', label: 'On The Way', description: 'Delivery rider is heading to your location', icon: '🛣️', color: 'text-yellow-600' },
  { id: 'dispatch_arrived_location', label: 'Arrived at Location', description: 'Delivery rider has arrived at your address', icon: '🏠', color: 'text-red-600' },
  { id: 'delivered', label: 'Delivered', description: 'Order has been successfully delivered', icon: '✅', color: 'text-green-600' }
];

export default function OrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, loading: authLoading } = useFirebaseAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRiderContact, setShowRiderContact] = useState(false);
  const { data, loading: queryLoading, refetch } = useQuery<any>(GET_ORDER, {
    skip: !orderId || authLoading || !user,
    variables: { id: orderId },
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000,
  });

  useEffect(() => {
    if (!authLoading && user && orderId) {
      refetch?.();
    }
  }, [authLoading, user, orderId, refetch]);

  useEffect(() => {
    if (!data?.order) return;
    const o = data.order;
    const apiToFriendly: Record<string, OrderDetails['status']> = {
      'PENDING_PAYMENT': 'Pending',
      'CONFIRMED': 'Confirmed',
      'PROCESSING': 'Preparing',
      'READY': 'Preparing',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Canceled',
    };
    const deliveryStatusMap: Record<OrderDetails['status'], OrderDetails['deliveryStatus']> = {
      'Pending': 'order_received',
      'Confirmed': 'awaiting_dispatch',
      'Preparing': 'packaging',
      'Out for Delivery': 'dispatch_otw',
      'Delivered': 'delivered',
      'Canceled': 'order_received',
    };
    const addr = o.address || '';
    const friendly = apiToFriendly[o.status] || 'Pending';
    const mapped: OrderDetails = {
      id: o.id,
      eateryId: '',
      eateryName: o.restaurant || 'Restaurant',
      eateryPhone: undefined,
      customer: {
        name: 'You',
        phone: '',
        email: '',
        address: addr,
      },
      items: (o.items || []).map((it: any) => ({ id: it.id, name: it.name, quantity: it.quantity, price: it.price })),
      totalAmount: Number(o.total || 0),
      status: friendly,
      deliveryStatus: deliveryStatusMap[friendly] || 'order_received',
      createdAt: o.createdAt,
      estimatedDeliveryTime: o.expectedTime || undefined,
      deliveryFee: 0,
      riderInfo: undefined,
      trackingUpdates: [
        {
          status: 'order_received',
          timestamp: o.createdAt,
          message: 'Order placed',
          location: o.restaurant || 'Restaurant',
        },
      ],
    };
    setOrder(mapped);
    setLoading(false);
  }, [data]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return deliverySteps.findIndex(step => step.id === order.deliveryStatus);
  };

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

  if (authLoading || loading || queryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <button
            onClick={() => router.push('/orders')}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <>
      <Head>
        <title>Order #{order.id.slice(-8)} - ChopChop</title>
        <meta name="description" content="Track your food delivery order" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/orders')}
                  className="mr-4 p-2 text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
                  <p className="text-sm text-gray-600">{order.eateryName}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Tracking */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Live Tracking</h2>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Order Placed</span>
                    <span>Delivered</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStepIndex + 1) / deliverySteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Delivery Steps */}
                <div className="space-y-4">
                  {deliverySteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const update = order.trackingUpdates.find(u => u.status === step.id);
                    
                    return (
                      <div key={step.id} className={`flex items-start ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium mr-4 ${
                          isCompleted ? `bg-green-100 ${step.color}` : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-green-300 animate-pulse' : ''}`}>
                          {isCompleted ? (step.id === order.deliveryStatus ? step.icon : '✓') : step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.label}
                              {isCurrent && <span className="ml-2 text-xs text-green-600 animate-pulse">● CURRENT</span>}
                            </p>
                            {update && (
                              <span className="text-xs text-gray-500">
                                {formatDate(update.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs ${isCompleted ? 'text-gray-700' : 'text-gray-400'} mt-1`}>
                            {update ? update.message : step.description}
                          </p>
                          {update?.location && (
                            <p className="text-xs text-blue-600 mt-1">📍 {update.location}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl || '/food-placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-sm text-gray-600">₦{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rider Information */}
              {order.riderInfo && ['dispatched', 'dispatch_otw', 'dispatch_arrived_location'].includes(order.deliveryStatus) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Delivery Rider</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-lg">🏍️</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.riderInfo.name}</p>
                        <p className="text-sm text-gray-600">{order.riderInfo.vehicle}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Plate Number: <span className="font-medium">{order.riderInfo.plateNumber}</span></p>
                    </div>
                    <button
                      onClick={() => setShowRiderContact(!showRiderContact)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      {showRiderContact ? 'Hide Contact' : 'Contact Rider'}
                    </button>
                    {showRiderContact && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          📞 <a href={`tel:${order.riderInfo.phone}`} className="font-medium underline">
                            {order.riderInfo.phone}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{(order.totalAmount - order.deliveryFee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₦{order.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₦{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Delivery Address:</strong><br />
                    {order.customer.address}
                  </p>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {order.customer.phone}
                  </p>
                </div>
              </div>

              {/* Restaurant Contact */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurant Info</h3>
                <div className="space-y-3">
                  <p className="font-medium text-gray-900">{order.eateryName}</p>
                  {order.eateryPhone && (
                    <button
                      onClick={() => window.open(`tel:${order.eateryPhone}`)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      📞 Call Restaurant
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}