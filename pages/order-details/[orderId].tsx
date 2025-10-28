import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getMenuverseFirestore, ensureMenuverseAuth } from '../../lib/firebase/menuverse';

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
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRiderContact, setShowRiderContact] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    // Mock order data - replace with real Firestore query
    const mockOrder: OrderDetails = {
      id: orderId as string,
      eateryId: 'eatery_1',
      eateryName: 'Mama Cass Kitchen',
      eateryPhone: '+234 803 123 4567',
      customer: {
        name: 'John Doe',
        phone: '+234 801 234 5678',
        email: 'john@example.com',
        address: '123 Victoria Island, Lagos, Nigeria'
      },
      items: [
        { 
          id: '1', 
          name: 'Jollof Rice & Chicken', 
          quantity: 2, 
          price: 2500,
          imageUrl: '/food-placeholder.jpg'
        },
        { 
          id: '2', 
          name: 'Coca-Cola', 
          quantity: 2, 
          price: 300 
        }
      ],
      totalAmount: 5600,
      deliveryFee: 500,
      status: 'Out for Delivery',
      deliveryStatus: 'dispatch_otw',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      estimatedDeliveryTime: '25-35 mins',
      riderInfo: {
        name: 'Ahmed Bello',
        phone: '+234 809 876 5432',
        vehicle: 'Honda CG125',
        plateNumber: 'ABC-123-DE'
      },
      trackingUpdates: [
        {
          status: 'order_received',
          timestamp: new Date(Date.now() - 3600000),
          message: 'Order received and confirmed by restaurant',
          location: 'Mama Cass Kitchen'
        },
        {
          status: 'packaging',
          timestamp: new Date(Date.now() - 3000000),
          message: 'Food is being prepared by the kitchen team',
          location: 'Kitchen'
        },
        {
          status: 'dispatched',
          timestamp: new Date(Date.now() - 1800000),
          message: 'Order picked up by delivery rider Ahmed',
          location: 'Mama Cass Kitchen'
        },
        {
          status: 'dispatch_otw',
          timestamp: new Date(Date.now() - 600000),
          message: 'Delivery rider is on the way to your location',
          location: 'En route to Victoria Island'
        }
      ]
    };

    setOrder(mockOrder);
    setLoading(false);
  }, [orderId]);

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

  if (loading) {
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