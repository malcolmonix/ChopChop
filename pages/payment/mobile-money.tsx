import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/components/protected-route';
import { useToast } from '@/lib/context/toast.context';
import { OrderService } from '@/lib/firebase/orders';

interface MobileMoneyProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
}

function MobileMoneyPaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { amount, method } = router.query;

  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [step, setStep] = useState<'provider' | 'phone' | 'confirmation'>('provider');

  const providers: MobileMoneyProvider[] = [
    {
      id: 'mtn',
      name: 'MTN MoMo',
      logo: '📱',
      color: 'bg-yellow-500'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      logo: '💰',
      color: 'bg-red-500'
    },
    {
      id: 'glo',
      name: 'Glo Mobile Money',
      logo: '🌟',
      color: 'bg-green-500'
    },
    {
      id: '9mobile',
      name: '9mobile Money',
      logo: '📞',
      color: 'bg-green-600'
    }
  ];

  useEffect(() => {
    // Retrieve pending order data from session storage
    const pendingOrderData = sessionStorage.getItem('pendingOrder');
    if (pendingOrderData) {
      setOrderData(JSON.parse(pendingOrderData));
    } else {
      // Redirect back to checkout if no pending order
      router.push('/checkout');
    }
  }, [router]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as Nigerian phone number
    if (digits.length <= 11) {
      if (digits.startsWith('0')) {
        return digits.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (digits.startsWith('234')) {
        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
      }
    }
    return digits;
  };

  const validatePhoneNumber = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length === 11 && digits.startsWith('0')) {
      return true;
    } else if (digits.length === 13 && digits.startsWith('234')) {
      return true;
    }
    
    return false;
  };

  const handlePhoneNumberChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
  };

  const handleProviderSelect = (provider: MobileMoneyProvider) => {
    setSelectedProvider(provider);
    setStep('phone');
  };

  const handlePhoneSubmit = () => {
    if (!validatePhoneNumber()) {
      showToast('error', 'Please enter a valid phone number');
      return;
    }
    setStep('confirmation');
  };

  const processPayment = async () => {
    try {
      setIsProcessing(true);

      // Simulate payment processing with mobile money provider
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment success (85% success rate for demo)
      const paymentSuccess = Math.random() > 0.15;
      
      if (!paymentSuccess) {
        throw new Error('Payment was declined. Please check your mobile money balance and try again.');
      }

      // If payment successful, place the order using Firebase
      const response = await OrderService.placeOrder({
        restaurant: Number(orderData.restaurant),
        orderInput: orderData.orderInput,
        paymentMethod: 'WALLET',
        address: orderData.address,
        deliveryCharges: orderData.deliveryCharges,
        tipping: orderData.tipping,
        taxationAmount: orderData.taxationAmount,
        instructions: orderData.instructions
      });

      // Clear pending order data
      sessionStorage.removeItem('pendingOrder');

      showToast('success', 'Payment successful! Your order has been placed.');
      
      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${response.orderId}`);

    } catch (error: any) {
      console.error('Payment error:', error);
      showToast('error', error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.push('/checkout');
  };

  const handleBack = () => {
    if (step === 'phone') {
      setStep('provider');
    } else if (step === 'confirmation') {
      setStep('phone');
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mobile Money Payment</h1>
          <p className="text-gray-600">
            {step === 'provider' && 'Select your mobile money provider'}
            {step === 'phone' && 'Enter your phone number'}
            {step === 'confirmation' && 'Confirm your payment'}
          </p>
        </div>

        {/* Payment Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">₦{Number(amount).toLocaleString()}</div>
          </div>
        </div>

        {/* Provider Selection */}
        {step === 'provider' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Provider</h3>
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${provider.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                      {provider.logo}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-sm text-gray-600">Pay with {provider.name}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phone Number Entry */}
        {step === 'phone' && selectedProvider && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 ${selectedProvider.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                {selectedProvider.logo}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedProvider.name}</h3>
                <p className="text-sm text-gray-600">Enter your registered phone number</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder="0801 234 5678"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the phone number registered with your {selectedProvider.name} account
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handlePhoneSubmit}
                disabled={!validatePhoneNumber()}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 'confirmation' && selectedProvider && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Payment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Provider</span>
                <div className="flex items-center">
                  <div className={`w-6 h-6 ${selectedProvider.color} rounded flex items-center justify-center text-white text-xs mr-2`}>
                    {selectedProvider.logo}
                  </div>
                  <span className="font-medium">{selectedProvider.name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Phone Number</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg">₦{Number(amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
              <div className="flex items-start">
                <div className="text-blue-500 mr-3">📱</div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Payment Instructions</p>
                  <p>You will receive a prompt on your phone to authorize this payment. Please follow the instructions on your device.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={processPayment}
                disabled={isProcessing}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ₦${Number(amount).toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {step === 'provider' && (
          <button
            onClick={handleCancel}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default withAuth(MobileMoneyPaymentPage);