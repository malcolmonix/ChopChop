import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/components/protected-route';
import { useCart } from '@/lib/context/cart.context';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import { useToast } from '@/lib/context/toast.context';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';

// Types for our checkout flow
interface DeliveryAddress {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'wallet' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
}

type CheckoutStep = 'cart' | 'address' | 'payment' | 'payment-processing' | 'confirmation';

const PLACE_ORDER = gql`
  mutation PlaceOrder(
    $restaurant: String!
    $orderInput: [OrderInput!]!
    $paymentMethod: String!
    $couponCode: String
    $tipping: Float!
    $taxationAmount: Float!
    $address: AddressInput!
    $orderDate: String!
    $isPickedUp: Boolean!
    $deliveryCharges: Float!
    $instructions: String
  ) {
    placeOrder(
      restaurant: $restaurant
      orderInput: $orderInput
      paymentMethod: $paymentMethod
      couponCode: $couponCode
      tipping: $tipping
      taxationAmount: $taxationAmount
      address: $address
      orderDate: $orderDate
      isPickedUp: $isPickedUp
      deliveryCharges: $deliveryCharges
      instructions: $instructions
    ) {
      orderId
      orderStatus
      paidAmount
      orderAmount
      deliveryCharges
      tipping
      taxationAmount
      createdAt
    }
  }
`;

function CheckoutPage() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const { state, total, count, setQuantity, removeItem, clear } = useCart();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [orderInstructions, setOrderInstructions] = useState('');
  const [tip, setTip] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Sample addresses - in production, these would come from user's saved addresses
  const savedAddresses: DeliveryAddress[] = [
    {
      id: '1',
      name: 'Home',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      phone: '+234 801 234 5678',
      isDefault: true,
      latitude: 6.5244,
      longitude: 3.3792
    },
    {
      id: '2',
      name: 'Office',
      addressLine1: '456 Business District',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100271',
      phone: '+234 801 234 5678',
      isDefault: false,
      latitude: 6.4541,
      longitude: 3.3947
    }
  ];

  // Sample payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      type: 'cash',
      name: 'Cash on Delivery',
      details: 'Pay with cash when your order arrives',
      isDefault: true
    },
    {
      id: 'card1',
      type: 'card',
      name: 'Debit Card',
      details: '**** **** **** 1234',
      isDefault: false
    },
    {
      id: 'wallet1',
      type: 'wallet',
      name: 'Mobile Money',
      details: 'MTN MoMo - 0801234567',
      isDefault: false
    },
    {
      id: 'bank1',
      type: 'bank',
      name: 'Bank Transfer',
      details: 'Transfer to merchant account',
      isDefault: false
    }
  ];

  // Initialize default selections
  useEffect(() => {
    if (!selectedAddress) {
      const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
      setSelectedAddress(defaultAddress);
    }
    if (!selectedPayment) {
      const defaultPayment = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPayment(defaultPayment);
    }
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (count === 0 && currentStep !== 'confirmation') {
      router.push('/');
    }
  }, [count, currentStep, router]);

  const deliveryFee = selectedAddress ? 500 : 0; // ₦500 delivery fee
  const tax = Math.round(total * 0.075); // 7.5% VAT
  const finalTotal = total + deliveryFee + tax + tip;

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      showToast('error', 'Please select delivery address and payment method');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // For "Pay on Delivery" - process order immediately
      if (selectedPayment.type === 'cash') {
        await processOrderDirectly();
      } else {
        // For other payment methods - initiate payment flow
        await initiatePaymentFlow();
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      showToast('error', error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const processOrderDirectly = async () => {
    const variables = {
      restaurant: String(state.restaurantId),
      orderInput: state.items.map((item) => ({
        title: item.title || item.name,
        quantity: item.quantity,
        price: item.price
      })),
      paymentMethod: selectedPayment!.type.toUpperCase(),
      couponCode: null,
      tipping: tip,
      taxationAmount: tax,
      address: {
        deliveryAddress: `${selectedAddress!.addressLine1}, ${selectedAddress!.city}`,
        latitude: selectedAddress!.latitude,
        longitude: selectedAddress!.longitude
      },
      orderDate: new Date().toISOString(),
      isPickedUp: false,
      deliveryCharges: deliveryFee,
      instructions: orderInstructions || null
    };

    const response = await client.mutate({
      mutation: PLACE_ORDER,
      variables
    });

    // Save last customer info to localStorage so Orders page can match orders
    try {
      const customerInfo = {
        name: (user && (user.displayName || user.email)) || 'Guest',
        email: user?.email || null,
        address: `${selectedAddress?.addressLine1 || ''}${selectedAddress?.city ? ', ' + selectedAddress.city : ''}`
      };
      localStorage.setItem('lastCustomerInfo', JSON.stringify(customerInfo));
    } catch (err) {
      // ignore localStorage errors
    }

    setOrderResult(response.data.placeOrder);
    setCurrentStep('confirmation');
    clear();
    showToast('success', 'Order placed successfully!');
  };

  const initiatePaymentFlow = async () => {
    const totalAmount = finalTotal;
    
    switch (selectedPayment!.type) {
      case 'card':
        await processCardPayment(totalAmount);
        break;
      case 'wallet':
        await processMobileMoneyPayment(totalAmount);
        break;
      case 'bank':
        await processBankTransferPayment(totalAmount);
        break;
      default:
        throw new Error('Unsupported payment method');
    }
  };

  const processCardPayment = async (amount: number) => {
    showToast('info', 'Redirecting to card payment...');
    
    // TODO: Integrate with payment gateway (Paystack, Flutterwave, etc.)
    // For now, simulate payment flow
    setTimeout(async () => {
      try {
        // Simulate payment success
        const paymentSuccessful = confirm('Payment simulation: Click OK for success, Cancel for failure');
        
        if (paymentSuccessful) {
          await processOrderDirectly();
        } else {
          throw new Error('Payment was declined');
        }
      } catch (error) {
        showToast('error', 'Payment failed. Please try again.');
        setCurrentStep('payment');
      }
    }, 2000);
  };

  const processMobileMoneyPayment = async (amount: number) => {
    showToast('info', 'Initiating mobile money payment...');
    
    // TODO: Integrate with MTN MoMo, Airtel Money APIs
    setTimeout(async () => {
      try {
        const paymentSuccessful = confirm('Mobile Money simulation: Click OK for success, Cancel for failure');
        
        if (paymentSuccessful) {
          await processOrderDirectly();
        } else {
          throw new Error('Mobile money payment failed');
        }
      } catch (error) {
        showToast('error', 'Mobile money payment failed. Please try again.');
        setCurrentStep('payment');
      }
    }, 2000);
  };

  const processBankTransferPayment = async (amount: number) => {
    showToast('info', 'Generating bank transfer details...');
    
    // TODO: Generate bank transfer instructions
    setTimeout(async () => {
      try {
        const transferConfirmed = confirm(
          `Bank Transfer Details:\nAccount: 1234567890\nBank: ChopChop Bank\nAmount: ₦${amount.toLocaleString()}\n\nClick OK when transfer is complete`
        );
        
        if (transferConfirmed) {
          await processOrderDirectly();
        } else {
          throw new Error('Bank transfer not completed');
        }
      } catch (error) {
        showToast('error', 'Bank transfer verification failed. Please try again.');
        setCurrentStep('payment');
      }
    }, 2000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'cart', label: 'Cart Review', icon: '🛒' },
      { id: 'address', label: 'Delivery', icon: '📍' },
      { id: 'payment', label: 'Payment', icon: '💳' },
      { id: 'payment-processing', label: 'Processing', icon: '⏳' },
      { id: 'confirmation', label: 'Confirm', icon: '✅' }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-orange-500 text-white'
                    : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.icon}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-4 hidden sm:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (currentStep === 'payment-processing') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderStepIndicator()}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl animate-spin">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
            <p className="text-gray-600 mb-4">
              Please wait while we process your payment...
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">Payment Method</div>
              <div className="text-lg font-bold text-gray-900">{selectedPayment?.name}</div>
              <div className="text-sm text-gray-600 mt-2">Amount: ₦{finalTotal.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'confirmation' && orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. Your food is being prepared.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="text-lg font-bold text-gray-900">{orderResult.orderId}</div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">{orderResult.orderStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">₦{orderResult.orderAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-medium">30-45 minutes</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Track Order
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cart Review Step */}
            {currentStep === 'cart' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Order</h2>
                <div className="text-sm text-gray-600 mb-4">
                  From: {state.restaurantName || state.restaurantId}
                </div>

                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title || item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.title || item.name}</h3>
                        <p className="text-sm text-gray-600">₦{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setCurrentStep('address')}
                    className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Continue to Delivery
                  </button>
                </div>
              </div>
            )}

            {/* Address Selection Step */}
            {currentStep === 'address' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>

                <div className="space-y-4 mb-6">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{address.name}</div>
                          <div className="text-sm text-gray-600">
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.zipCode}
                          </div>
                          <div className="text-sm text-gray-600">{address.phone}</div>
                        </div>
                        <div className="ml-4">
                          {selectedAddress?.id === address.id && (
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors mb-4">
                  + Add New Address
                </button>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('cart')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    disabled={!selectedAddress}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method Step */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>

                <div className="space-y-4 mb-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPayment?.id === method.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {method.type === 'cash' && '💵'}
                            {method.type === 'card' && '💳'}
                            {method.type === 'wallet' && '📱'}
                            {method.type === 'bank' && '🏦'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{method.name}</div>
                            <div className="text-sm text-gray-600">{method.details}</div>
                          </div>
                        </div>
                        {selectedPayment?.id === method.id && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={orderInstructions}
                    onChange={(e) => setOrderInstructions(e.target.value)}
                    placeholder="Any special requests for your order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Tip Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Tip (Optional)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 100, 200, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTip(amount)}
                        className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                          tip === amount
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {amount === 0 ? 'No Tip' : `₦${amount}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep('address')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!selectedPayment || isPlacingOrder}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({count} items)</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>₦{tip.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedAddress && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Delivering to:</div>
                  <div className="text-sm font-medium">{selectedAddress.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedAddress.addressLine1}, {selectedAddress.city}
                  </div>
                </div>
              )}

              {selectedPayment && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Payment:</div>
                  <div className="text-sm font-medium">{selectedPayment.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage);