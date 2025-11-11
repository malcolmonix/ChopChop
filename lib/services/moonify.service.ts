/**
 * Moonify Payment Service
 * Integration with Moonify API for card payments and bank transfers
 * 
 * Documentation: https://docs.moonify.com
 */

// Moonify API Configuration
const MOONIFY_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_MOONIFY_API_KEY || 'MK_TEST_GC3B8XG2XX',
  secretKey: process.env.MOONIFY_SECRET_KEY || 'A663NRZA544DDPEM7KDN7Z8HRV6YXD8S',
  contractCode: process.env.MOONIFY_CONTRACT_CODE || '5867418298',
  baseUrl: process.env.MOONIFY_BASE_URL || 'https://api.moonify.com/v1',
  isTestMode: process.env.NODE_ENV !== 'production'
};

export type PaymentChannel = 'card' | 'bank_transfer';

export interface MoonifyTransferAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  amount: number;
  reference: string;
  expiresAt: string;
}

export interface MoonifyPaymentRequest {
  amount: number;
  currency: string;
  email: string;
  orderId: string;
  customerName?: string;
  description?: string;
  channel: PaymentChannel;
  callbackUrl?: string;
}

export interface MoonifyCardPaymentResponse {
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  message?: string;
  error?: string;
}

export interface MoonifyBankTransferResponse {
  success: boolean;
  reference: string;
  transferAccount: MoonifyTransferAccount;
  message?: string;
  error?: string;
}

export type MoonifyPaymentResponse = MoonifyCardPaymentResponse | MoonifyBankTransferResponse;

export interface MoonifyVerificationResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  reference: string;
  amount: number;
  channel: PaymentChannel;
  paidAt?: string;
  message?: string;
}

/**
 * Initialize a Moonify payment (card or bank transfer)
 */
export async function initializeMoonifyPayment(
  request: MoonifyPaymentRequest
): Promise<MoonifyPaymentResponse> {
  try {
    // Generate unique reference
    const reference = `CHOP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // In test mode, return mock data based on channel
    if (MOONIFY_CONFIG.isTestMode) {
      if (request.channel === 'card') {
        // Mock card payment response
        return {
          success: true,
          reference,
          authorizationUrl: `https://checkout.moonify.com/pay/${reference}`,
          accessCode: `AC_${reference}`,
          message: 'Card payment initialized successfully'
        } as MoonifyCardPaymentResponse;
      } else {
        // Mock bank transfer response
        return {
          success: true,
          reference,
          transferAccount: {
            accountNumber: '1234567890',
            accountName: 'ChopChop Foods Limited',
            bankName: 'First Bank of Nigeria',
            bankCode: '011',
            amount: request.amount,
            reference,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
          },
          message: 'Bank transfer details generated successfully'
        } as MoonifyBankTransferResponse;
      }
    }

    // Make API call to Moonify
    const response = await fetch(`${MOONIFY_CONFIG.baseUrl}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MOONIFY_CONFIG.apiKey}`,
        'X-Secret-Key': MOONIFY_CONFIG.secretKey,
        'X-Contract-Code': MOONIFY_CONFIG.contractCode
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        email: request.email,
        reference,
        channel: request.channel,
        callback_url: request.callbackUrl,
        metadata: {
          orderId: request.orderId,
          customerName: request.customerName,
          description: request.description
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Moonify API error: ${response.status}`);
    }

    const data = await response.json();

    if (request.channel === 'card') {
      return {
        success: data.status === 'success',
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        message: data.message
      } as MoonifyCardPaymentResponse;
    } else {
      return {
        success: data.status === 'success',
        reference: data.data.reference,
        transferAccount: {
          accountNumber: data.data.account_number,
          accountName: data.data.account_name,
          bankName: data.data.bank_name,
          bankCode: data.data.bank_code,
          amount: data.data.amount,
          reference: data.data.reference,
          expiresAt: data.data.expires_at
        },
        message: data.message
      } as MoonifyBankTransferResponse;
    }
  } catch (error: any) {
    console.error('Moonify initialization error:', error);
    
    if (request.channel === 'card') {
      return {
        success: false,
        reference: '',
        authorizationUrl: '',
        accessCode: '',
        error: error.message || 'Failed to initialize card payment'
      } as MoonifyCardPaymentResponse;
    } else {
      return {
        success: false,
        reference: '',
        transferAccount: {
          accountNumber: '',
          accountName: '',
          bankName: '',
          bankCode: '',
          amount: 0,
          reference: '',
          expiresAt: ''
        },
        error: error.message || 'Failed to initialize bank transfer'
      } as MoonifyBankTransferResponse;
    }
  }
}

/**
 * Verify a Moonify payment status
 */
export async function verifyMoonifyPayment(
  reference: string
): Promise<MoonifyVerificationResponse> {
  try {
    // In test mode, simulate verification
    if (MOONIFY_CONFIG.isTestMode) {
      // Simulate a pending payment
      return {
        success: true,
        status: 'pending',
        reference,
        amount: 0,
        channel: 'bank_transfer',
        message: 'Payment is pending. Please complete the transfer.'
      };
    }

    const response = await fetch(
      `${MOONIFY_CONFIG.baseUrl}/payments/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MOONIFY_CONFIG.apiKey}`,
          'X-Secret-Key': MOONIFY_CONFIG.secretKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.status === 'success',
      status: data.data.status,
      reference: data.data.reference,
      amount: data.data.amount,
      channel: data.data.channel,
      paidAt: data.data.paid_at,
      message: data.message
    };
  } catch (error: any) {
    console.error('Moonify verification error:', error);
    return {
      success: false,
      status: 'failed',
      reference,
      amount: 0,
      channel: 'bank_transfer',
      message: error.message || 'Verification failed'
    };
  }
}

/**
 * Helper to check if response is card payment
 */
export function isCardPaymentResponse(
  response: MoonifyPaymentResponse
): response is MoonifyCardPaymentResponse {
  return 'authorizationUrl' in response;
}

/**
 * Helper to check if response is bank transfer
 */
export function isBankTransferResponse(
  response: MoonifyPaymentResponse
): response is MoonifyBankTransferResponse {
  return 'transferAccount' in response;
}

/**
 * Format currency amount for display
 */
export function formatMoonifyAmount(amount: number, currency: string = 'NGN'): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  });
  return formatter.format(amount);
}

/**
 * Calculate expiry time remaining
 */
export function getExpiryTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default {
  initializeMoonifyPayment,
  verifyMoonifyPayment,
  isCardPaymentResponse,
  isBankTransferResponse,
  formatMoonifyAmount,
  getExpiryTimeRemaining,
  config: MOONIFY_CONFIG
};
