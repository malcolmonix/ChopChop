import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/components/protected-route';

function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId, pending } = router.query;
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, you would fetch order details from your API
    // For demo purposes, we'll use mock data
    if (orderId) {
      setOrderDetails({
        orderId: orderId,
        status: pending === 'true' ? 'PAYMENT_PENDING' : 'CONFIRMED',
        estimatedDelivery: '30-45 minutes',
        total: 0 // This would come from the actual order
      });
    }
  }, [orderId, pending]);

  const getStatusInfo = () => {
    if (pending === 'true') {
      return {
        icon: '⏳',
        title: 'Payment Pending',
        subtitle: 'We\'re verifying your payment',
        description: 'Your order has been received! We\'re currently verifying your payment. You\'ll receive a confirmation once the payment is verified.',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        buttonText: 'Track Order Status'
      };
    } else {
      return {
        icon: '🎉',
        title: 'Order Confirmed!',
        subtitle: 'Your order is being prepared',
        description: 'Thank you for your order! Your food is being prepared and will be delivered soon.',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        buttonText: 'Track Order'
      };
    }
  };

  const statusInfo = getStatusInfo();

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          {/* Status Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
            <span className="text-3xl">{statusInfo.icon}</span>
          </div>

          {/* Status Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.title}</h1>
          <p className="text-gray-600 mb-4">{statusInfo.subtitle}</p>
          
          {/* Order ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">Order ID</div>
            <div className="text-lg font-bold text-gray-900">{orderDetails.orderId}</div>
          </div>

          {/* Status Description */}
          <div className={`${statusInfo.bgColor} border border-opacity-20 rounded-lg p-4 mb-6`}>
            <p className={`text-sm ${statusInfo.textColor}`}>
              {statusInfo.description}
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${pending === 'true' ? 'text-yellow-600' : 'text-green-600'}`}>
                {orderDetails.status}
              </span>
            </div>
            {pending !== 'true' && (
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-medium">{orderDetails.estimatedDelivery}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/orders')}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {statusInfo.buttonText}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>

            {pending === 'true' && (
              <div className="pt-4">
                <p className="text-xs text-gray-500">
                  Need help? Contact support at support@chopchop.com or call +234 800 CHOPCHOP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        {pending === 'true' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Verification</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="text-orange-500 mr-3 mt-0.5">🔍</div>
                <div>
                  <p className="font-medium text-gray-900">Verification in Progress</p>
                  <p className="text-gray-600">We're currently verifying your payment with your bank/payment provider.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-0.5">⏱️</div>
                <div>
                  <p className="font-medium text-gray-900">Expected Time</p>
                  <p className="text-gray-600">Verification typically takes 15-30 minutes, but may take up to 2 hours during peak times.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5">📱</div>
                <div>
                  <p className="font-medium text-gray-900">You'll Be Notified</p>
                  <p className="text-gray-600">We'll send you an SMS and email confirmation once payment is verified and your order is confirmed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {pending !== 'true' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="text-orange-500 mr-3 mt-0.5">👨‍🍳</div>
                <div>
                  <p className="font-medium text-gray-900">Order Preparation</p>
                  <p className="text-gray-600">The restaurant is now preparing your order with fresh ingredients.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-0.5">🚚</div>
                <div>
                  <p className="font-medium text-gray-900">Delivery Assignment</p>
                  <p className="text-gray-600">A delivery rider will be assigned and you'll receive tracking information.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-green-500 mr-3 mt-0.5">🍽️</div>
                <div>
                  <p className="font-medium text-gray-900">Enjoy Your Meal</p>
                  <p className="text-gray-600">Your delicious food will arrive within the estimated delivery time.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(OrderConfirmationPage);