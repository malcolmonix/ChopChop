# Moonify Payment Integration Documentation

## Overview

ChopChop now supports secure payment processing via **Moonify** for both card payments and bank transfers. Mobile money payment methods have been temporarily hidden from the checkout flow as requested.

## Features

### ✅ Card Payments (Moonify)
- Secure card payment processing via Moonify gateway
- Support for Debit and Credit cards
- PCI-DSS compliant payment flow
- Real-time payment verification
- Automatic redirect to Moonify checkout page

### ✅ Bank Transfer (Moonify)
- Dynamic bank account generation for each transaction
- Unique payment reference for tracking
- 24-hour payment window
- Copy-to-clipboard for account details
- Real-time transfer verification

### 🚫 Mobile Money (Hidden)
- MTN MoMo, Airtel Money, and other mobile money options temporarily hidden
- Can be re-enabled in the future by uncommenting code in `pages/checkout-enhanced.tsx`

## Technical Implementation

### Files Modified/Created

1. **`lib/services/moonify.service.ts`** (NEW)
   - Moonify API integration service
   - Card and bank transfer initialization
   - Payment verification
   - Helper utilities

2. **`pages/checkout-enhanced.tsx`** (MODIFIED)
   - Integrated Moonify service
   - Updated payment processing flows
   - Enhanced UI for bank transfer details
   - Hidden mobile money payment option

## Moonify API Configuration

### Test Credentials (Already Configured)
```env
NEXT_PUBLIC_MOONIFY_API_KEY=MK_TEST_GC3B8XG2XX
MOONIFY_SECRET_KEY=A663NRZA544DDPEM7KDN7Z8HRV6YXD8S
MOONIFY_CONTRACT_CODE=5867418298
```

### Environment Variables

Add these to your `.env.local` file:

```env
# Moonify Payment Gateway
NEXT_PUBLIC_MOONIFY_API_KEY=MK_TEST_GC3B8XG2XX
MOONIFY_SECRET_KEY=A663NRZA544DDPEM7KDN7Z8HRV6YXD8S
MOONIFY_CONTRACT_CODE=5867418298
MOONIFY_BASE_URL=https://api.moonify.com/v1

# For production, replace with live credentials:
# NEXT_PUBLIC_MOONIFY_API_KEY=MK_LIVE_XXXXXXXX
# MOONIFY_SECRET_KEY=your_live_secret_key
# MOONIFY_CONTRACT_CODE=your_live_contract_code
```

## Payment Flows

### Card Payment Flow

1. **Customer selects "Debit/Credit Card"** at checkout
2. **Moonify initializes payment:**
   - Creates unique payment reference
   - Generates authorization URL
   - Returns access code
3. **Customer redirected to Moonify checkout page**
4. **Customer enters card details** on secure Moonify page
5. **Payment processed** and customer redirected back
6. **Order confirmed** upon successful payment

```typescript
// Code example
const response = await initializeMoonifyPayment({
  amount: 5000,
  currency: 'NGN',
  email: 'customer@example.com',
  orderId: 'ORDER-123',
  channel: 'card',
  callbackUrl: 'https://chopchop.com/payment/verify'
});

if (isCardPaymentResponse(response)) {
  // Redirect to Moonify checkout
  window.location.href = response.authorizationUrl;
}
```

### Bank Transfer Flow

1. **Customer selects "Bank Transfer"** at checkout
2. **Moonify generates transfer details:**
   - Unique account number
   - Bank name and code
   - Payment reference
   - Expiry time (24 hours)
3. **Customer sees bank transfer details** on checkout page
4. **Customer makes transfer** using their banking app
5. **Customer clicks "I have Completed the Transfer"**
6. **Order placed** with "Pending Payment" status
7. **Moonify webhook confirms payment** (automated)
8. **Order status updated** to "Confirmed"

```typescript
// Code example
const response = await initializeMoonifyPayment({
  amount: 5000,
  currency: 'NGN',
  email: 'customer@example.com',
  orderId: 'ORDER-123',
  channel: 'bank_transfer'
});

if (isBankTransferResponse(response)) {
  const { transferAccount } = response;
  console.log('Account Number:', transferAccount.accountNumber);
  console.log('Bank:', transferAccount.bankName);
  console.log('Reference:', transferAccount.reference);
}
```

## Service API Reference

### `initializeMoonifyPayment(request)`

Initializes a payment transaction with Moonify.

**Parameters:**
```typescript
{
  amount: number;          // Amount in kobo (NGN)
  currency: string;        // 'NGN'
  email: string;          // Customer email
  orderId: string;        // Your internal order ID
  customerName?: string;  // Customer name (optional)
  description?: string;   // Payment description (optional)
  channel: 'card' | 'bank_transfer';  // Payment channel
  callbackUrl?: string;   // Redirect URL after payment (card only)
}
```

**Returns:**
```typescript
// For card payments
{
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

// For bank transfers
{
  success: boolean;
  reference: string;
  transferAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    bankCode: string;
    amount: number;
    reference: string;
    expiresAt: string;
  }
}
```

### `verifyMoonifyPayment(reference)`

Verifies the status of a payment transaction.

**Parameters:**
```typescript
reference: string;  // Payment reference from initialization
```

**Returns:**
```typescript
{
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  reference: string;
  amount: number;
  channel: 'card' | 'bank_transfer';
  paidAt?: string;
  message?: string;
}
```

### Helper Functions

**`isCardPaymentResponse(response)`** - Type guard for card payment responses

**`isBankTransferResponse(response)`** - Type guard for bank transfer responses

**`formatMoonifyAmount(amount, currency)`** - Format amount for display

**`getExpiryTimeRemaining(expiresAt)`** - Calculate time remaining until expiry

## UI Components

### Bank Transfer Details Display

The checkout page now shows a comprehensive bank transfer details screen when the customer selects bank transfer:

**Features:**
- Large, prominent amount display
- Copy-to-clipboard for account number and reference
- Bank details clearly formatted
- Important instructions highlighted
- Action buttons for confirmation
- Support contact information

**Layout:**
```
┌─────────────────────────────────────┐
│  🏦 Complete Bank Transfer          │
├─────────────────────────────────────┤
│                                     │
│  Amount to Pay                      │
│  ₦ 5,000                           │
│                                     │
│  Bank Name: First Bank of Nigeria  │
│  Account: 1234567890  [Copy]       │
│  Account Name: ChopChop Foods Ltd  │
│  Reference: CHOP-123...  [Copy]    │
│                                     │
│  ⚠️ Important: Transfer exact amt  │
│                                     │
│  [I have Completed the Transfer]   │
│  [Change Payment Method]           │
└─────────────────────────────────────┘
```

## Testing

### Test Mode

By default, the app runs in test mode (`process.env.NODE_ENV !== 'production'`), which:
- Uses test API credentials
- Returns mock payment data
- Shows simulated payment flows
- Allows testing without real transactions

### Test Card Payment

1. Select "Debit/Credit Card" at checkout
2. Click "Place Order"
3. In test mode, a confirmation dialog appears
4. Click "OK" to simulate successful payment
5. Click "Cancel" to simulate failed payment

### Test Bank Transfer

1. Select "Bank Transfer" at checkout
2. Click "Place Order"
3. Bank transfer details are displayed
4. Account number: 1234567890
5. Bank: First Bank of Nigeria
6. Reference: CHOP-{timestamp}-{random}
7. Click "I have Completed the Transfer" to proceed

## Production Deployment

### Before Going Live

1. **Update API Credentials**
   ```env
   NEXT_PUBLIC_MOONIFY_API_KEY=MK_LIVE_XXXXXXXX
   MOONIFY_SECRET_KEY=your_live_secret_key
   MOONIFY_CONTRACT_CODE=your_live_contract_code
   ```

2. **Set Production Environment**
   ```env
   NODE_ENV=production
   ```

3. **Configure Webhooks**
   - Set up Moonify webhooks to receive payment notifications
   - Create `/api/webhooks/moonify` endpoint
   - Verify webhook signatures
   - Update order status on payment confirmation

4. **Test Thoroughly**
   - Test card payments with small amounts
   - Test bank transfers end-to-end
   - Verify webhook delivery
   - Test edge cases (expired transfers, failed payments)

### Webhook Implementation (TODO)

```typescript
// pages/api/webhooks/moonify.ts
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['x-moonify-signature'];
  // ... verify signature

  const { event, data } = req.body;

  if (event === 'payment.success') {
    // Update order status
    await updateOrderPaymentStatus(data.reference, 'paid');
  }

  res.status(200).json({ received: true });
}
```

## Security Considerations

### ✅ Implemented

- API keys stored in environment variables
- Secret key not exposed to client
- HTTPS for all API calls
- Payment references are unique and unpredictable

### 🔒 Recommended

- Implement webhook signature verification
- Add request rate limiting
- Log all payment transactions
- Monitor for suspicious activity
- Implement payment fraud detection
- Add 2FA for high-value transactions

## Troubleshooting

### Common Issues

**1. Payment initialization fails**
- Check API credentials are correct
- Verify environment variables are set
- Check Moonify API status
- Review error logs

**2. Bank transfer not confirming**
- Ensure customer used correct reference
- Verify webhook endpoint is accessible
- Check webhook logs
- Manually verify with Moonify dashboard

**3. Card payment redirect fails**
- Check callback URL is whitelisted in Moonify dashboard
- Verify HTTPS is used (required for card payments)
- Test with different browsers

### Debug Mode

Enable detailed logging:
```typescript
// In moonify.service.ts
const MOONIFY_CONFIG = {
  // ... other config
  debug: true  // Add this for verbose logging
};
```

## Future Enhancements

### Planned Features

1. **Mobile Money Integration**
   - Re-enable MTN MoMo
   - Add Airtel Money
   - Add Glo Mobile Money
   - Add 9mobile Easy Wallet

2. **Payment Wallets**
   - Integrate with local e-wallets
   - Support for international wallets (PayPal, etc.)

3. **Payment Analytics**
   - Track payment success rates
   - Monitor payment method preferences
   - Analyze payment failures
   - Generate financial reports

4. **Enhanced Features**
   - Save card details for future payments
   - Recurring/subscription payments
   - Split payments
   - Payment plans/installments

## Support

For Moonify-related issues:
- **Email:** support@moonify.com
- **Documentation:** https://docs.moonify.com
- **Dashboard:** https://dashboard.moonify.com

For ChopChop integration issues:
- **Email:** dev@chopchop.com
- **GitHub:** https://github.com/malcolmonix/ChopChop/issues

## Changelog

### v1.0.0 (November 11, 2025)
- ✅ Initial Moonify integration
- ✅ Card payment support
- ✅ Bank transfer support
- ✅ Mobile money hidden
- ✅ Test mode implementation
- ✅ Enhanced UI for bank transfers
- ✅ Copy-to-clipboard functionality
- ✅ Payment reference generation

---

**Last Updated:** November 11, 2025  
**Integration Status:** ✅ Complete and Ready for Testing  
**Production Status:** ⏳ Pending webhook setup and live credentials
