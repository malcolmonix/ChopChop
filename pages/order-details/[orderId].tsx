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
  const { orderId } = router.query;
  const { user, loading: authLoading } = useFirebaseAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || typeof orderId !== 'string') return;

    setLoading(true);
    setError(null);

    // Subscribe to real-time order updates
    const unsubscribeOrder = OrderTrackingService.subscribeToOrder(
      orderId,
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
      orderId,
      (location) => {
        setRiderLocation(location);
      }
    );

    return () => {
      unsubscribeOrder();
      unsubscribeRider();
    };
  }, [orderId]);

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
                onClick={() => router.push(`/rate-order/${orderId}`)}
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