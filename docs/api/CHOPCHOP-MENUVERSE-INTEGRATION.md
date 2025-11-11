# ChopChop & MenuVerse Integration Guide

> **Complete guide for integrating the ChopChop API into your applications**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Integration Scenarios](#integration-scenarios)
3. [ChopChop App Integration](#chopchop-app-integration)
4. [MenuVerse Platform Integration](#menuverse-platform-integration)
5. [Authentication Setup](#authentication-setup)
6. [Common Use Cases](#common-use-cases)
7. [Webhook Configuration](#webhook-configuration)
8. [Testing Your Integration](#testing-your-integration)

---

## 🎯 Overview

The ChopChop API provides a unified interface for order management across the ChopChop customer app and MenuVerse vendor platform. It supports:

- **ChopChop → API**: Customers place orders, track status
- **MenuVerse → API**: Vendors receive orders, update status
- **API ← → MenuVerse Firebase**: Bidirectional order synchronization

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  ChopChop   │◄───────►│  ChopChop    │◄───────►│  MenuVerse  │
│  Customer   │         │     API      │         │   Vendor    │
│     App     │         │  (GraphQL)   │         │  Platform   │
└─────────────┘         └──────────────┘         └─────────────┘
                              ▲                          ▲
                              │                          │
                              ▼                          ▼
                        ┌──────────┐             ┌──────────┐
                        │ Firebase │             │ Firebase │
                        │ Primary  │◄───────────►│Secondary │
                        └──────────┘             └──────────┘
```

---

## 🔄 Integration Scenarios

### Scenario 1: ChopChop Customer App

**Use Case:** Customer orders food through mobile app

**Flow:**
1. Customer browses restaurants
2. Adds items to cart
3. Places order with payment method
4. Tracks order status in real-time
5. Receives order delivered

**Required Integration:**
- GraphQL mutations for order placement
- GraphQL subscriptions for real-time updates
- Firebase Authentication for user identity

### Scenario 2: MenuVerse Vendor Platform

**Use Case:** Vendor receives and manages orders

**Flow:**
1. Vendor receives order notification
2. Accepts and starts preparing
3. Updates order status (PROCESSING → READY)
4. Assigns delivery rider
5. Marks order as delivered

**Required Integration:**
- Webhook endpoint to receive orders
- GraphQL mutations to update status
- Firebase access to MenuVerse project

### Scenario 3: Dual-Platform Order

**Use Case:** Order spans both platforms with sync

**Flow:**
1. Customer places order on ChopChop
2. Order saved to ChopChop Firebase with `menuVerseVendorId`
3. Order synced to MenuVerse Firebase
4. Vendor updates status on MenuVerse
5. Webhook notifies ChopChop API
6. Customer sees updated status

---

## 📱 ChopChop App Integration

### Step 1: Setup Firebase Authentication

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Step 2: Create API Client

```javascript
// src/api/graphqlClient.js
import { auth } from '../config/firebase';

const API_URL = 'https://your-api-domain.com/graphql';
// or for development: 'http://localhost:4000/graphql'

export async function graphqlRequest(query, variables = {}) {
  // Get current user's ID token
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const idToken = await user.getIdToken();
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ query, variables })
  });
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}
```

### Step 3: Implement Order Placement

```javascript
// src/api/orders.js
import { graphqlRequest } from './graphqlClient';

export async function placeOrder(orderData) {
  const mutation = `
    mutation PlaceOrder(
      $restaurant: String!
      $orderInput: [OrderItemInput!]!
      $paymentMethod: String!
      $orderDate: String!
      $address: String
      $menuVerseVendorId: String
      $deliveryCharges: Float
      $tipping: Float
      $taxationAmount: Float
      $instructions: String
    ) {
      placeOrder(
        restaurant: $restaurant
        orderInput: $orderInput
        paymentMethod: $paymentMethod
        orderDate: $orderDate
        address: $address
        menuVerseVendorId: $menuVerseVendorId
        deliveryCharges: $deliveryCharges
        tipping: $tipping
        taxationAmount: $taxationAmount
        instructions: $instructions
      ) {
        id
        orderId
        orderStatus
        orderAmount
        paidAmount
        paymentMethod
        deliveryCharges
        orderDate
        address
        menuVerseVendorId
        statusHistory {
          status
          timestamp
          note
        }
      }
    }
  `;
  
  const variables = {
    restaurant: orderData.restaurantName,
    orderInput: orderData.items.map(item => ({
      title: item.name,
      food: item.category,
      description: item.description,
      quantity: item.quantity,
      variation: item.size || null,
      addons: item.addons || [],
      specialInstructions: item.instructions || null,
      price: item.price,
      total: item.price * item.quantity
    })),
    paymentMethod: orderData.paymentMethod, // "CASH", "CARD", "WALLET", "BANK"
    orderDate: new Date().toISOString(),
    address: orderData.deliveryAddress,
    menuVerseVendorId: orderData.vendorId || null, // Optional: for MenuVerse integration
    deliveryCharges: orderData.deliveryFee || 0,
    tipping: orderData.tip || 0,
    taxationAmount: orderData.tax || 0,
    instructions: orderData.notes || null
  };
  
  return await graphqlRequest(mutation, variables);
}
```

### Step 4: Track Order Status

```javascript
// src/api/orders.js
export async function getMyOrders() {
  const query = `
    query {
      orders {
        id
        orderId
        restaurant
        orderStatus
        orderAmount
        paidAmount
        paymentMethod
        orderDate
        address
        statusHistory {
          status
          timestamp
          note
        }
        riderInfo {
          name
          phone
        }
      }
    }
  `;
  
  return await graphqlRequest(query);
}

export async function getOrderDetails(orderId) {
  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        orderId
        restaurant
        orderItems {
          title
          food
          description
          quantity
          variation
          addons
          price
          total
        }
        orderStatus
        orderAmount
        paidAmount
        paymentMethod
        orderDate
        expectedTime
        address
        instructions
        deliveryCharges
        tipping
        taxationAmount
        statusHistory {
          status
          timestamp
          note
        }
        riderInfo {
          name
          phone
          vehicle
          plateNumber
        }
        menuVerseVendorId
        lastSyncedAt
        createdAt
        updatedAt
      }
    }
  `;
  
  return await graphqlRequest(query, { id: orderId });
}
```

### Step 5: Real-time Status Updates (Optional)

```javascript
// src/api/subscriptions.js
import { io } from 'socket.io-client';

export function subscribeToOrderUpdates(orderId, callback) {
  const socket = io('ws://your-api-domain.com', {
    auth: {
      token: await auth.currentUser.getIdToken()
    }
  });
  
  socket.emit('subscribe', { orderId });
  
  socket.on('orderStatusUpdated', (data) => {
    callback(data);
  });
  
  return () => socket.disconnect();
}

// Usage in React component
useEffect(() => {
  const unsubscribe = subscribeToOrderUpdates(orderId, (updatedOrder) => {
    setOrderStatus(updatedOrder.orderStatus);
    setStatusHistory(updatedOrder.statusHistory);
  });
  
  return unsubscribe;
}, [orderId]);
```

### Example: Complete Order Flow in React Native

```javascript
// src/screens/CheckoutScreen.js
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { placeOrder } from '../api/orders';

export default function CheckoutScreen({ route }) {
  const { cart, restaurant } = route.params;
  const [loading, setLoading] = useState(false);
  
  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const orderData = {
        restaurantName: restaurant.name,
        items: cart.items,
        paymentMethod: 'CASH',
        deliveryAddress: '123 Main Street, City',
        vendorId: restaurant.menuVerseId, // If restaurant is on MenuVerse
        deliveryFee: 5.00,
        tip: 2.00,
        tax: cart.total * 0.1,
        notes: 'Please ring doorbell'
      };
      
      const result = await placeOrder(orderData);
      
      Alert.alert(
        'Order Placed!',
        `Order ${result.orderId} confirmed. Status: ${result.orderStatus}`,
        [
          {
            text: 'Track Order',
            onPress: () => navigation.navigate('OrderTracking', { 
              orderId: result.id 
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <View>
      <Button 
        title="Place Order" 
        onPress={handlePlaceOrder}
        disabled={loading}
      />
    </View>
  );
}
```

---

## 🏪 MenuVerse Platform Integration

### Step 1: Receive Orders via Webhook

The ChopChop API can notify MenuVerse when new orders arrive.

**Setup Webhook Endpoint** (on MenuVerse backend):

```javascript
// menuverse-backend/routes/webhooks.js
const express = require('express');
const router = express.Router();

router.post('/chopchop/order-created', async (req, res) => {
  const { orderId, orderData } = req.body;
  
  try {
    // Save order to MenuVerse database
    await saveOrderToMenuVerse(orderData);
    
    // Notify vendor
    await notifyVendor(orderData.menuVerseVendorId, orderData);
    
    res.json({ success: true, orderId });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 2: Update Order Status from MenuVerse

When vendor updates order status on MenuVerse:

```javascript
// menuverse-backend/services/orderService.js
const fetch = require('node-fetch');

const CHOPCHOP_API = 'https://your-chopchop-api.com/graphql';

async function updateChopChopOrderStatus(orderId, status, riderInfo = null) {
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
  
  const variables = {
    orderId,
    status, // "PROCESSING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"
    riderInfo: riderInfo ? {
      name: riderInfo.name,
      phone: riderInfo.phone,
      vehicle: riderInfo.vehicle,
      plateNumber: riderInfo.plateNumber
    } : null
  };
  
  const response = await fetch(CHOPCHOP_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Note: Webhooks don't require authentication
    },
    body: JSON.stringify({ query: mutation, variables })
  });
  
  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data.webhookMenuVerseOrderUpdate;
}

// Usage
async function vendorAcceptsOrder(orderId) {
  await updateChopChopOrderStatus(orderId, 'PROCESSING');
}

async function vendorMarksOrderReady(orderId) {
  await updateChopChopOrderStatus(orderId, 'READY');
}

async function assignRiderAndDispatch(orderId, rider) {
  await updateChopChopOrderStatus(orderId, 'OUT_FOR_DELIVERY', {
    name: rider.name,
    phone: rider.phone,
    vehicle: rider.vehicleType,
    plateNumber: rider.licensePlate
  });
}
```

### Step 3: Firebase Sync (Advanced)

For bidirectional Firebase synchronization:

```javascript
// menuverse-backend/services/firebaseSync.js
const admin = require('firebase-admin');

// Initialize both Firebase instances
const chopchopApp = admin.initializeApp({
  credential: admin.credential.cert(require('../chopchop-service-account.json')),
  databaseURL: 'https://chopchop-67750.firebaseio.com'
}, 'chopchop');

const menuverseApp = admin.initializeApp({
  credential: admin.credential.cert(require('../menuverse-service-account.json')),
  databaseURL: 'https://menuverse-xxxxx.firebaseio.com'
}, 'menuverse');

const chopchopDb = chopchopApp.firestore();
const menuverseDb = menuverseApp.firestore();

// Listen for order changes on MenuVerse and sync to ChopChop
menuverseDb.collection('eateries').doc(vendorId).collection('orders')
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === 'modified') {
        const order = change.doc.data();
        syncOrderToChopChop(order);
      }
    });
  });

async function syncOrderToChopChop(menuverseOrder) {
  const orderId = menuverseOrder.orderId;
  
  // Update order in ChopChop Firebase
  const orderRef = chopchopDb.collection('orders').where('orderId', '==', orderId);
  const snapshot = await orderRef.get();
  
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    await doc.ref.update({
      orderStatus: menuverseOrder.status,
      riderInfo: menuverseOrder.riderInfo || null,
      lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status: menuverseOrder.status,
        timestamp: new Date().toISOString(),
        note: 'Synced from MenuVerse'
      })
    });
  }
}
```

---

## 🔐 Authentication Setup

### For ChopChop App (Client-Side)

```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Sign up
async function signUp(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential.user;
}

// Sign in
async function signIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Get ID token for API calls
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return await user.getIdToken();
}
```

### For MenuVerse (Server-Side)

MenuVerse doesn't need Firebase Auth for webhooks, but for direct API calls:

```javascript
const admin = require('firebase-admin');

// Initialize with service account
admin.initializeApp({
  credential: admin.credential.cert(require('./service-account.json'))
});

// Create custom token for a vendor
async function createVendorToken(vendorId) {
  const customToken = await admin.auth().createCustomToken(vendorId);
  return customToken;
}

// Use custom token to get ID token (client-side)
async function exchangeCustomToken(customToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );
  const data = await response.json();
  return data.idToken;
}
```

---

## 💼 Common Use Cases

### Use Case 1: Customer Places CASH Order

```javascript
const order = await placeOrder({
  restaurantName: 'Pizza Palace',
  items: [
    {
      name: 'Margherita Pizza',
      category: 'pizza',
      description: 'Classic cheese pizza',
      quantity: 2,
      price: 12.99
    }
  ],
  paymentMethod: 'CASH', // ← Order immediately CONFIRMED
  deliveryAddress: '123 Main St',
  deliveryFee: 5.00,
  tip: 3.00,
  tax: 2.60
});

console.log(order.orderStatus); // "CONFIRMED"
```

### Use Case 2: Customer Places CARD Order

```javascript
const order = await placeOrder({
  // ... same as above
  paymentMethod: 'CARD' // ← Order starts as PENDING_PAYMENT
});

console.log(order.orderStatus); // "PENDING_PAYMENT"

// After payment processed (separate payment service):
await updateOrderStatus(order.id, 'CONFIRMED', 'Payment received');
```

### Use Case 3: Vendor Updates Order Progress

```javascript
// 1. Vendor accepts order
await updateChopChopOrderStatus('ORD-123-abc', 'PROCESSING');

// 2. Food is ready
await updateChopChopOrderStatus('ORD-123-abc', 'READY');

// 3. Rider assigned and dispatched
await updateChopChopOrderStatus('ORD-123-abc', 'OUT_FOR_DELIVERY', {
  name: 'John Rider',
  phone: '+1234567890',
  vehicle: 'Motorcycle',
  plateNumber: 'ABC-123'
});

// 4. Order delivered
await updateChopChopOrderStatus('ORD-123-abc', 'DELIVERED');
```

### Use Case 4: Customer Cancels Order

```javascript
const result = await graphqlRequest(`
  mutation {
    updateOrderStatus(
      orderId: "ORD-123-abc"
      status: "CANCELLED"
      note: "Customer requested cancellation"
    ) {
      orderId
      orderStatus
    }
  }
`);
```

### Use Case 5: Real-time Order Tracking

```javascript
// React Native component
import { useState, useEffect } from 'react';

function OrderTracker({ orderId }) {
  const [status, setStatus] = useState('CONFIRMED');
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    // Poll for updates every 10 seconds
    const interval = setInterval(async () => {
      const order = await getOrderDetails(orderId);
      setStatus(order.orderStatus);
      setHistory(order.statusHistory);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [orderId]);
  
  return (
    <View>
      <Text>Current Status: {status}</Text>
      <Timeline>
        {history.map((h, i) => (
          <TimelineItem key={i} status={h.status} time={h.timestamp} />
        ))}
      </Timeline>
    </View>
  );
}
```

---

## 🪝 Webhook Configuration

### Setting Up Webhooks

**1. Configure webhook URL in ChopChop API:**

```javascript
// In schema.js or config file
const MENUVERSE_WEBHOOK_URL = process.env.MENUVERSE_WEBHOOK_URL;

// When order is placed with menuVerseVendorId:
async function notifyMenuVerse(order) {
  await fetch(MENUVERSE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'order.created',
      orderId: order.orderId,
      orderData: order
    })
  });
}
```

**2. Secure webhooks with signature verification:**

```javascript
const crypto = require('crypto');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifyWebhookSignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In webhook endpoint:
router.post('/webhook', (req, res) => {
  const signature = req.headers['x-chopchop-signature'];
  
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook...
});
```

---

## 🧪 Testing Your Integration

### 1. Use the Test Dashboard

```bash
npm run test:dashboard
# Open http://localhost:3000
```

- Authenticate with test credentials
- Place test orders
- Update status
- View order history

### 2. Run Automated Tests

```bash
npx playwright test --config=playwright-config.js
```

### 3. Manual API Testing

```bash
# Get test auth token
npm run get:auth-token

# Use in GraphQL Playground
# http://localhost:4000/graphql
```

### 4. Test Order Flow

```javascript
// test-integration.js
const { placeOrder, getOrderDetails, updateOrderStatus } = require('./api/orders');

async function testOrderFlow() {
  // 1. Place order
  const order = await placeOrder({
    restaurantName: 'Test Restaurant',
    items: [{ name: 'Test Item', price: 10, quantity: 1 }],
    paymentMethod: 'CASH',
    deliveryAddress: 'Test Address'
  });
  console.log('✅ Order placed:', order.orderId);
  
  // 2. Update to PROCESSING
  await updateOrderStatus(order.id, 'PROCESSING');
  console.log('✅ Status updated to PROCESSING');
  
  // 3. Get order details
  const details = await getOrderDetails(order.id);
  console.log('✅ Order details:', details);
  console.log('✅ Status history:', details.statusHistory);
}

testOrderFlow().catch(console.error);
```

### 5. Test Webhook Integration

```bash
# Simulate webhook from MenuVerse
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { webhookMenuVerseOrderUpdate(orderId: \"ORD-123-abc\", status: \"OUT_FOR_DELIVERY\", riderInfo: { name: \"Test Rider\", phone: \"+1234567890\" }) { orderId orderStatus } }"
  }'
```

---

## 🚀 Production Deployment

### Environment Variables for Production

```env
# Production Firebase
FIREBASE_PROJECT_ID=chopchop-67750
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...

# Secondary Firebase (MenuVerse)
SECONDARY_FIREBASE_PROJECT_ID=menuverse-xxxxx
SECONDARY_FIREBASE_PRIVATE_KEY_ID=...
SECONDARY_FIREBASE_PRIVATE_KEY="..."
SECONDARY_FIREBASE_CLIENT_EMAIL=...

# Production URLs
API_URL=https://api.chopchop.com/graphql
MENUVERSE_WEBHOOK_URL=https://menuverse.com/webhooks/chopchop

# Security
WEBHOOK_SECRET=your-secure-random-string
NODE_ENV=production
```

### Deployment Checklist

- [ ] Update Firebase security rules
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Enable rate limiting
- [ ] Configure logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Test webhook endpoints
- [ ] Verify authentication flow
- [ ] Load test API endpoints
- [ ] Set up backup strategy

---

## 📞 Support & Resources

- **API Documentation**: [API-ENDPOINTS.md](./API-ENDPOINTS.md)
- **Quick Reference**: [API-QUICK-REFERENCE.md](./API-QUICK-REFERENCE.md)
- **Test Results**: [ORDER-STATUS-VERIFICATION.md](./ORDER-STATUS-VERIFICATION.md)
- **Feature Roadmap**: [FEATURE-ROADMAP.md](./FEATURE-ROADMAP.md)

For issues or questions, create an issue in the repository or contact the development team.

---

**Happy Coding! 🎉**
