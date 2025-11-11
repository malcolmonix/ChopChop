# MenuVerse Order Status Integration - Verification Checklist

> **Guide to verify and fix order status integration between MenuVerse and ChopChop API**

---

## 🎯 What to Check in MenuVerse

### 1. API Configuration

**Files to Check:**
- `src/config/api.js` or `config/api.config.js`
- `.env` or `environment.ts`

**What to Verify:**
```javascript
// Should have ChopChop API endpoint configured
const CHOPCHOP_API_URL = 'http://localhost:4000/graphql';
// or production: 'https://api.chopchop.com/graphql'
```

**Check `.env` file:**
```env
REACT_APP_CHOPCHOP_API_URL=http://localhost:4000/graphql
CHOPCHOP_API_URL=http://localhost:4000/graphql
```

---

## 2. Order Status Update Implementation

### A. Check for Update Status Function

**Location:** `src/services/orderService.js` or `src/api/orders.js`

**What to Look For:**

```javascript
// ❌ BAD: Direct Firebase write (bypasses ChopChop API)
async function updateOrderStatus(orderId, newStatus) {
  await firebase.firestore()
    .collection('orders')
    .doc(orderId)
    .update({ status: newStatus });
}

// ✅ GOOD: Uses ChopChop API webhook
async function updateOrderStatus(orderId, newStatus, riderInfo = null) {
  const mutation = `
    mutation UpdateOrder($orderId: ID!, $status: String!, $riderInfo: RiderInfoInput) {
      webhookMenuVerseOrderUpdate(
        orderId: $orderId
        status: $status
        riderInfo: $riderInfo
      ) {
        orderId
        orderStatus
        lastSyncedAt
      }
    }
  `;
  
  const response = await fetch(CHOPCHOP_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Note: Webhooks don't require authentication
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        orderId,
        status: newStatus, // "PROCESSING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"
        riderInfo
      }
    })
  });
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data.webhookMenuVerseOrderUpdate;
}
```

---

## 3. Order Status Mapping

**What to Check:**

MenuVerse and ChopChop might use different status names. Verify mapping:

```javascript
// Status mapping (if needed)
const STATUS_MAP = {
  // MenuVerse Status → ChopChop Status
  'PENDING': 'PENDING_PAYMENT',
  'ACCEPTED': 'CONFIRMED',
  'PREPARING': 'PROCESSING',
  'READY': 'READY',
  'PICKED_UP': 'OUT_FOR_DELIVERY',
  'DELIVERED': 'DELIVERED',
  'CANCELLED': 'CANCELLED'
};

function mapStatusToChopChop(menuVerseStatus) {
  return STATUS_MAP[menuVerseStatus] || menuVerseStatus;
}
```

**ChopChop Valid Statuses:**
- `PENDING_PAYMENT`
- `CONFIRMED`
- `PROCESSING`
- `READY`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`

---

## 4. UI Components to Check

### A. Order Status Buttons/Controls

**Files:** `src/components/OrderCard.js`, `src/screens/OrderDetails.js`

**What to Look For:**

```javascript
// Example: Status update button handler
const handleStatusChange = async (newStatus) => {
  try {
    setLoading(true);
    
    // ✅ Should call API
    await updateOrderStatus(order.orderId, newStatus);
    
    // Update local state
    setOrderStatus(newStatus);
    
    // Show success message
    showToast('Order status updated successfully');
  } catch (error) {
    showToast('Failed to update status: ' + error.message);
  } finally {
    setLoading(false);
  }
};
```

### B. Rider Assignment

**Files:** `src/screens/AssignRider.js` or similar

**What to Look For:**

```javascript
const handleAssignRider = async (rider) => {
  try {
    // ✅ Should send rider info to API
    await updateOrderStatus(order.orderId, 'OUT_FOR_DELIVERY', {
      name: rider.name,
      phone: rider.phone,
      vehicle: rider.vehicleType,
      plateNumber: rider.licensePlate
    });
    
    showToast('Rider assigned successfully');
  } catch (error) {
    showToast('Failed to assign rider: ' + error.message);
  }
};
```

---

## 5. Order Receiving from ChopChop

**Check:** Does MenuVerse receive new orders from ChopChop?

### Option 1: Webhook Endpoint (Recommended)

**File:** Backend service (Node.js/Express)

```javascript
// MenuVerse backend - receives new orders
app.post('/api/webhooks/chopchop/order-created', async (req, res) => {
  const { orderId, orderData } = req.body;
  
  try {
    // Save to MenuVerse Firebase
    await db.collection('eateries')
      .doc(orderData.menuVerseVendorId)
      .collection('orders')
      .doc(orderId)
      .set({
        ...orderData,
        receivedAt: new Date().toISOString(),
        status: 'PENDING' // MenuVerse initial status
      });
    
    // Notify vendor
    await sendPushNotification(orderData.menuVerseVendorId, {
      title: 'New Order',
      body: `Order ${orderId} received`
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Option 2: Firebase Listener (Alternative)

**File:** `src/services/orderListener.js`

```javascript
// Listen to ChopChop Firebase
import firebase from 'firebase/app';
import 'firebase/firestore';

// Initialize ChopChop Firebase
const chopchopApp = firebase.initializeApp({
  // ChopChop Firebase config
}, 'chopchop');

const chopchopDb = chopchopApp.firestore();

// Listen for new orders for this vendor
export function listenForNewOrders(vendorId, callback) {
  return chopchopDb.collection('orders')
    .where('menuVerseVendorId', '==', vendorId)
    .where('status', '==', 'CONFIRMED')
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const order = {
            id: change.doc.id,
            ...change.doc.data()
          };
          callback(order);
        }
      });
    });
}
```

---

## 6. Common Integration Issues

### Issue 1: Order Not Found Error

**Problem:** "Order not found" when updating status

**Cause:** Using Firestore document ID instead of `orderId` field

**Solution:** Ensure you're passing the `orderId` (e.g., `ORD-1762393846603-p8s61wsoc`), not the Firestore document ID

```javascript
// ❌ WRONG: Using document ID
await updateOrderStatus(order.id, 'PROCESSING');

// ✅ CORRECT: Using orderId field
await updateOrderStatus(order.orderId, 'PROCESSING');
```

### Issue 2: Authentication Error

**Problem:** "Authentication required" error

**Cause:** Trying to use authenticated mutations instead of webhook

**Solution:** Use `webhookMenuVerseOrderUpdate` mutation (no auth needed)

```javascript
// ❌ WRONG: Using authenticated mutation
mutation {
  updateOrderStatus(orderId: "...", status: "...") { ... }
}

// ✅ CORRECT: Using webhook mutation (no auth)
mutation {
  webhookMenuVerseOrderUpdate(orderId: "...", status: "...") { ... }
}
```

### Issue 3: Invalid Status Error

**Problem:** "Invalid status" error

**Cause:** Using MenuVerse-specific status names

**Solution:** Map to ChopChop status names

```javascript
const statusMap = {
  'ACCEPTED': 'CONFIRMED',
  'PREPARING': 'PROCESSING',
  'PICKED_UP': 'OUT_FOR_DELIVERY'
};

const chopchopStatus = statusMap[menuVerseStatus] || menuVerseStatus;
await updateOrderStatus(orderId, chopchopStatus);
```

---

## 7. Testing Checklist

### Manual Testing

- [ ] **Accept Order**: Vendor accepts order → Status becomes `PROCESSING`
- [ ] **Mark Ready**: Food ready → Status becomes `READY`
- [ ] **Assign Rider**: Rider assigned → Status becomes `OUT_FOR_DELIVERY` with rider info
- [ ] **Complete Delivery**: Order delivered → Status becomes `DELIVERED`
- [ ] **Cancel Order**: Order cancelled → Status becomes `CANCELLED`

### Test in ChopChop App

After updating status in MenuVerse:
- [ ] Customer sees updated status in ChopChop app
- [ ] Status history shows the update
- [ ] Timestamp is correct
- [ ] Rider information displays (if assigned)

### API Testing

```bash
# Test from MenuVerse backend/terminal
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { webhookMenuVerseOrderUpdate(orderId: \"ORD-123-abc\", status: \"PROCESSING\") { orderId orderStatus } }"
  }'
```

---

## 8. Implementation Steps (If Not Integrated)

If MenuVerse is NOT integrated with ChopChop API, follow these steps:

### Step 1: Add API Configuration

```javascript
// src/config/api.js
export const CHOPCHOP_API = {
  URL: process.env.REACT_APP_CHOPCHOP_API_URL || 'http://localhost:4000/graphql',
  TIMEOUT: 10000
};
```

### Step 2: Create API Client

```javascript
// src/api/chopchopClient.js
import { CHOPCHOP_API } from '../config/api';

export async function updateChopChopOrderStatus(orderId, status, riderInfo = null) {
  const mutation = `
    mutation UpdateOrder($orderId: ID!, $status: String!, $riderInfo: RiderInfoInput) {
      webhookMenuVerseOrderUpdate(
        orderId: $orderId
        status: $status
        riderInfo: $riderInfo
      ) {
        orderId
        orderStatus
        riderInfo {
          name
          phone
        }
        lastSyncedAt
      }
    }
  `;

  const response = await fetch(CHOPCHOP_API.URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: mutation,
      variables: { orderId, status, riderInfo }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  return data.data.webhookMenuVerseOrderUpdate;
}
```

### Step 3: Update Order Service

```javascript
// src/services/orderService.js
import { updateChopChopOrderStatus } from '../api/chopchopClient';

export async function updateOrderStatus(order, newStatus, riderInfo = null) {
  try {
    // 1. Update in ChopChop via API
    const result = await updateChopChopOrderStatus(
      order.orderId, // Use orderId field, not document ID
      newStatus,
      riderInfo
    );
    
    // 2. Update local MenuVerse Firebase (optional - for redundancy)
    await firebase.firestore()
      .collection('eateries')
      .doc(order.vendorId)
      .collection('orders')
      .doc(order.id)
      .update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        riderInfo: riderInfo || null,
        lastSyncedWithChopChop: new Date().toISOString()
      });
    
    return result;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
}
```

### Step 4: Update UI Components

```javascript
// src/screens/OrderManagement.js
import { updateOrderStatus } from '../services/orderService';

function OrderCard({ order }) {
  const [loading, setLoading] = useState(false);

  const handleAcceptOrder = async () => {
    setLoading(true);
    try {
      await updateOrderStatus(order, 'PROCESSING');
      Alert.alert('Success', 'Order accepted and customer notified');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async () => {
    setLoading(true);
    try {
      await updateOrderStatus(order, 'READY');
      Alert.alert('Success', 'Order marked as ready');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRider = async (rider) => {
    setLoading(true);
    try {
      await updateOrderStatus(order, 'OUT_FOR_DELIVERY', {
        name: rider.name,
        phone: rider.phone,
        vehicle: rider.vehicleType,
        plateNumber: rider.plate
      });
      Alert.alert('Success', 'Rider assigned and customer notified');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Order: {order.orderId}</Text>
      <Text>Status: {order.status}</Text>
      
      {order.status === 'CONFIRMED' && (
        <Button 
          title="Accept Order" 
          onPress={handleAcceptOrder}
          disabled={loading}
        />
      )}
      
      {order.status === 'PROCESSING' && (
        <Button 
          title="Mark Ready" 
          onPress={handleMarkReady}
          disabled={loading}
        />
      )}
      
      {order.status === 'READY' && (
        <Button 
          title="Assign Rider" 
          onPress={() => showRiderSelector(handleAssignRider)}
          disabled={loading}
        />
      )}
    </View>
  );
}
```

---

## 9. Verification Commands

### Check API Connectivity from MenuVerse

```javascript
// Add to MenuVerse app (temporary debug function)
async function testAPIConnection() {
  try {
    const response = await fetch('http://localhost:4000/.well-known/apollo/server-health');
    const data = await response.json();
    console.log('✅ ChopChop API is reachable:', data);
  } catch (error) {
    console.error('❌ Cannot reach ChopChop API:', error);
  }
}
```

### Test Order Update

```javascript
// Add to MenuVerse app (temporary test function)
async function testOrderUpdate() {
  const testOrderId = 'ORD-1762393846603-p8s61wsoc'; // Use a real order ID
  
  try {
    const result = await updateChopChopOrderStatus(testOrderId, 'PROCESSING');
    console.log('✅ Order update successful:', result);
  } catch (error) {
    console.error('❌ Order update failed:', error.message);
  }
}
```

---

## 10. Production Deployment

### Environment Variables

**Production `.env`:**
```env
REACT_APP_CHOPCHOP_API_URL=https://api.chopchop.com/graphql
CHOPCHOP_WEBHOOK_SECRET=your-secure-secret-key
```

### Security Considerations

1. **Webhook Signature Verification** (if implementing webhooks):
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

2. **Rate Limiting**: Implement rate limiting for API calls
3. **Error Retry**: Add retry logic for failed API calls
4. **Logging**: Log all status updates for debugging

---

## 📋 Quick Verification Script

Run this in your browser console (while on MenuVerse):

```javascript
// Quick verification script
(async function checkIntegration() {
  console.log('🔍 Checking MenuVerse → ChopChop Integration...\n');
  
  // 1. Check API URL
  console.log('1. API Configuration:');
  console.log('   URL:', process.env.REACT_APP_CHOPCHOP_API_URL || 'NOT SET');
  
  // 2. Check if update function exists
  console.log('\n2. Update Function:');
  console.log('   Exists:', typeof updateOrderStatus !== 'undefined');
  
  // 3. Try to reach API
  console.log('\n3. API Connectivity:');
  try {
    const response = await fetch('http://localhost:4000/.well-known/apollo/server-health');
    console.log('   Status:', response.ok ? '✅ Connected' : '❌ Error');
  } catch (error) {
    console.log('   Status: ❌ Cannot reach API');
  }
  
  console.log('\n✅ Verification complete');
})();
```

---

## 🎯 Expected Behavior

When working correctly:

1. **Vendor accepts order** → ChopChop customer sees "Processing"
2. **Vendor marks ready** → ChopChop customer sees "Ready for pickup/delivery"
3. **Rider assigned** → ChopChop customer sees rider name and phone
4. **Order delivered** → ChopChop customer sees "Delivered"

All within **< 2 seconds** of vendor action.

---

## 📞 Need Help?

If you find issues:

1. Check the browser console for errors
2. Check the ChopChop API logs
3. Verify the `orderId` format (must be `ORD-timestamp-random`)
4. Test with the ChopChop test dashboard: `npm run test:dashboard`
5. Run Playwright tests: `npx playwright test`

---

**Last Updated**: November 6, 2025  
**ChopChop API Version**: 1.0.0  
**Status**: Production Ready ✅
