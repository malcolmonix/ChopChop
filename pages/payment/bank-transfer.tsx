import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/components/protected-route';
import { useToast } from '@/lib/context/toast.context';
import { OrderService } from '@/lib/firebase/orders';

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  sortCode?: string;
}

function BankTransferPaymentPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { amount, method } = router.query;

  const [orderData, setOrderData] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [transferReference, setTransferReference] = useState('');
  const [step, setStep] = useState<'details' | 'confirmation'>('details');

  // Demo bank account details (in production, this would come from your payment processor)
  const bankAccount: BankAccount = {
    bankName: 'First Bank of Nigeria',
    accountNumber: '2034567890',
    accountName: 'ChopChop Limited',
    sortCode: '011'
  };

  const orderRef = `CC${Date.now()}`;

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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', `${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const handleTransferConfirmation = () => {
    if (!transferReference.trim()) {
      showToast('error', 'Please enter the transfer reference');
      return;
    }
    setStep('confirmation');
  };

  const confirmPayment = async () => {
    try {
      setIsConfirming(true);

      // In a real implementation, you would verify the bank transfer
      // For demo purposes, we'll simulate a pending payment state
      
      // Place the order with BANK payment method using Firebase
      const response = await OrderService.placeOrder({
        restaurant: Number(orderData.restaurant),
        orderInput: orderData.orderInput,
        paymentMethod: 'BANK',
        address: orderData.address,
        deliveryCharges: orderData.deliveryCharges,
        tipping: orderData.tipping,
        taxationAmount: orderData.taxationAmount,
        instructions: orderData.instructions
      });

      // Clear pending order data
      sessionStorage.removeItem('pendingOrder');

      showToast('success', 'Payment confirmation submitted! We will verify your transfer and update your order status.');
      
      // Redirect to order confirmation
      router.push(`/order-confirmation?orderId=${response.orderId}&pending=true`);

    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      showToast('error', error.message || 'Failed to confirm payment. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    router.push('/checkout');
  };

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('details');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer</h1>
          <p className="text-gray-600">
            {step === 'details' ? 'Transfer money to complete your order' : 'Confirm your payment'}
          </p>
        </div>

        {/* Payment Amount */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">₦{Number(amount).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Order Reference: {orderRef}</div>
          </div>
        </div>

        {/* Bank Transfer Details */}
        {step === 'details' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer to this account</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Bank Name</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{bankAccount.bankName}</span>
                    <button
                      onClick={() => copyToClipboard(bankAccount.bankName, 'Bank name')}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Account Number</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{bankAccount.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(bankAccount.accountNumber, 'Account number')}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Account Name</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{bankAccount.accountName}</span>
                    <button
                      onClick={() => copyToClipboard(bankAccount.accountName, 'Account name')}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                {bankAccount.sortCode && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Sort Code</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{bankAccount.sortCode}</span>
                      <button
                        onClick={() => copyToClipboard(bankAccount.sortCode!, 'Sort code')}
                        className="text-orange-500 hover:text-orange-600"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Amount</span>
                  <div className="flex items-center">
                    <span className="font-bold text-lg mr-2">₦{Number(amount).toLocaleString()}</span>
                    <button
                      onClick={() => copyToClipboard(Number(amount).toString(), 'Amount')}
                      className="text-orange-500 hover:text-orange-600"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-500 mr-3">⚠️</div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">Important Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use "{orderRef}" as your transfer reference/narration</li>
                    <li>Transfer the exact amount: ₦{Number(amount).toLocaleString()}</li>
                    <li>Keep your transfer receipt for verification</li>
                    <li>Payment verification may take 15-30 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Transfer Confirmation Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">After making the transfer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transfer Reference/Transaction ID
                  </label>
                  <input
                    type="text"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    placeholder="Enter your bank transfer reference"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us verify your payment faster
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferConfirmation}
                  disabled={!transferReference.trim()}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  I've Made the Transfer
                </button>
              </div>
            </div>
          </>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Payment</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Transfer Details</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium">{transferReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account:</span>
                    <span className="font-medium">{bankAccount.accountNumber}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-500 mr-3">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What happens next?</p>
                    <p>We'll verify your payment within 15-30 minutes and update your order status. You'll receive a confirmation once verified.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBack}
                disabled={isConfirming}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                onClick={confirmPayment}
                disabled={isConfirming}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </div>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(BankTransferPaymentPage);