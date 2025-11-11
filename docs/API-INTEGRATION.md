# API Integration Documentation

**ChopChop Multi-App Communication Architecture**

This document describes how ChopChop (Customer App), MenuVerse (Vendor Dashboard), and RiderApp communicate through API calls and webhooks.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [API Endpoints](#api-endpoints)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Integration Scenarios](#integration-scenarios)
6. [API Reference](#api-reference)
7. [Webhooks](#webhooks)
8. [Authentication](#authentication)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

---

## Architecture Overview

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   ChopChop      │         │   MenuVerse     │         │   RiderApp      │
│ (Customer App)  │◄───────►│ (Vendor Portal) │◄───────►│ (Delivery App)  │
│                 │         │                 │         │                 │
│  Next.js Web    │         │  Next.js Web    │         │  React Native   │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           │                           │
         └───────────────┬───────────┴───────────────┬───────────┘
                         │                           │
                         ▼                           ▼
                ┌─────────────────┐         ┌─────────────────┐
                │  Firebase       │         │  REST APIs      │
                │  Firestore DB   │         │  (GraphQL)      │
                │                 │         │                 │
                │  - Orders       │         │  - MenuVerse    │
                │  - Customers    │         │  - Moonify      │
                │  - Restaurants  │         │  - Rider API    │
                │  - Riders       │         │                 │
                └─────────────────┘         └─────────────────┘
```

### Communication Patterns

1. **Real-time Sync**: Firebase Firestore for instant data updates
2. **REST APIs**: HTTP endpoints for order placement, status updates
3. **Webhooks**: Event-driven notifications between systems
4. **GraphQL**: MenuVerse API for restaurant and menu data

---

## System Components

### 1. ChopChop (Customer App)

**Technology**: Next.js 14, TypeScript, Firebase  
**Role**: Customer-facing food ordering platform  
**Responsibilities**:
- Browse restaurants and menus
- Place orders with payment
- Track order status in real-time
- View order history

**Key Files**:
- `pages/checkout-enhanced.tsx` - Order placement
- `pages/orders.tsx` - Order tracking
- `lib/firebase/order-sync.ts` - Order synchronization
- `lib/services/moonify.service.ts` - Payment processing

### 2. MenuVerse (Vendor Dashboard)

**Technology**: Next.js, GraphQL, Firebase  
**Role**: Restaurant management and order processing  
**Responsibilities**:
- Manage restaurant profile and menu
- Receive and process customer orders
- Update order status
- Assign delivery riders
- Track sales and analytics

**Key Features**:
- Restaurant profile management
- Menu item CRUD operations
- Order queue management
- Rider assignment
- Real-time order notifications

### 3. RiderApp (Delivery App)

**Technology**: React Native, Firebase  
**Role**: Delivery rider mobile application  
**Responsibilities**:
- Accept delivery assignments
- Navigate to restaurant and customer
- Update delivery status
- Confirm deliveries
- Track earnings

**Key Features**:
- Order assignment notifications
- GPS navigation
- Delivery status updates
- Earnings tracker
- Chat with customer/restaurant

---

## API Endpoints

### ChopChop API Endpoints

Base URL: `https://chopchop.com/api`

#### Order Management

```
POST   /api/sync-orders              - Sync orders from MenuVerse
GET    /api/sync-orders?orderId=ID   - Sync specific order
GET    /api/sync-orders?userId=ID    - Sync user's orders
```

#### Webhooks

```
POST   /api/webhooks/menuverse-order-update    - Receive order status updates from MenuVerse
POST   /api/webhooks/rider-location-update     - Receive rider location updates
POST   /api/webhooks/payment-confirmation      - Receive payment confirmations from Moonify
```

#### Health Check

```
GET    /api/health                   - API health status
```

---

### MenuVerse GraphQL API

Base URL: `https://menuverse.com/graphql` (or configured URL)

#### Queries

```graphql
# Get all restaurants
query GetAllEateries {
  eateries {
    id
    name
    description
    logoUrl
    bannerUrl
    contactEmail
    isActive
  }
}

# Get single restaurant
query GetEatery($id: ID!) {
  eatery(id: $id) {
    id
    name
    description
    logoUrl
    bannerUrl
    contactEmail
    address
    phone
    cuisineTypes
    openingHours
  }
}

# Get menu items
query GetMenuItems($eateryId: ID!) {
  menuItems(eateryId: $eateryId) {
    id
    name
    description
    price
    category
    imageUrl
    isAvailable
  }
}

# Get order details
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    status
    totalAmount
    items {
      id
      name
      quantity
    price
    }
    customer {
      name
      email
      phone
      address
    }
    restaurant {
      id
      name
    }
    createdAt
    updatedAt
  }
}
```

#### Mutations

```graphql
# Place new order
mutation PlaceOrder($input: OrderInput!) {
  placeOrder(input: $input) {
    id
    status
    orderId
    message
  }
}

# Update order status
mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
  updateOrderStatus(orderId: $orderId, status: $status) {
    id
    status
    updatedAt
  }
}

# Assign rider to order
mutation AssignRider($orderId: ID!, $riderId: ID!) {
  assignRider(orderId: $orderId, riderId: $riderId) {
    id
    rider {
      id
      name
      phone
    }
  }
}
```

---

### RiderApp API Endpoints

Base URL: `https://riderapp.com/api` (or configured URL)

#### Rider Management

```
GET    /api/riders/:id                    - Get rider details
PATCH  /api/riders/:id/status             - Update rider online/offline status
GET    /api/riders/:id/orders             - Get assigned orders
```

#### Order Management

```
POST   /api/orders/:id/accept             - Accept delivery assignment
POST   /api/orders/:id/pickup             - Confirm pickup from restaurant
POST   /api/orders/:id/deliver            - Confirm delivery to customer
POST   /api/orders/:id/location           - Update current location
```

#### Location Tracking

```
POST   /api/location/update               - Send location update
GET    /api/location/:riderId             - Get rider's current location
```

---

## Data Flow Diagrams

### 1. Order Placement Flow

```
Customer (ChopChop)                    MenuVerse                    RiderApp
      │                                    │                           │
      │ 1. Browse Restaurants              │                           │
      ├──────────GraphQL Query────────────►│                           │
      │◄────────Restaurant Data────────────┤                           │
      │                                    │                           │
      │ 2. Add Items to Cart               │                           │
      │    (Local State)                   │                           │
      │                                    │                           │
      │ 3. Place Order                     │                           │
      ├──────GraphQL Mutation─────────────►│                           │
      │         (placeOrder)               │                           │
      │                                    │ 4. Create Order           │
      │                                    │    in Firebase            │
      │                                    │    Status: PENDING        │
      │◄─────Order Confirmation────────────┤                           │
      │     (Order ID, Status)             │                           │
      │                                    │                           │
      │ 5. Save to Firebase                │                           │
      │    customer-orders/                │                           │
      │                                    │                           │
      │ 6. Process Payment                 │                           │
      │    (Moonify API)                   │                           │
      │                                    │                           │
      │                                    │ 7. Vendor Reviews Order   │
      │                                    │    Status: CONFIRMED      │
      │                                    │                           │
      │                                    │ 8. Webhook to ChopChop    │
      │◄───────Status Update────────────────┤                           │
      │    (CONFIRMED)                     │                           │
      │                                    │                           │
      │                                    │ 9. Assign Rider           │
      │                                    ├──────Assignment──────────►│
      │                                    │                           │
      │                                    │                           │ 10. Rider Accepts
      │                                    │◄──────Acceptance──────────┤
      │                                    │                           │
      │◄───────Status Update────────────────┤                           │
      │    (Rider Assigned)                │                           │
```

### 2. Real-time Order Tracking Flow

```
Customer (ChopChop)                    MenuVerse                    RiderApp
      │                                    │                           │
      │ 1. View Order Details              │                           │
      │    Listen to Firebase              │                           │
      │    orders/{orderId}                │                           │
      │                                    │                           │
      │                                    │ 2. Vendor Updates Status  │
      │                                    │    Status: PREPARING      │
      │                                    │    Update Firebase        │
      │                                    │                           │
      │◄────Real-time Update───────────────┤                           │
      │    (Firebase Listener)             │                           │
      │                                    │                           │
      │                                    │                           │ 3. Rider Picks Up
      │                                    │◄────Status Update─────────┤
      │                                    │    (PICKED_UP)            │
      │                                    │                           │
      │                                    │ 4. Update Firebase        │
      │◄────Real-time Update───────────────┤                           │
      │    Status: OUT_FOR_DELIVERY        │                           │
      │                                    │                           │
      │                                    │                           │ 5. Rider Updates
      │◄─────────Location Updates──────────┴───────────────────────────┤    Location
      │         (Firebase updates)                                     │    Every 30s
      │                                                                │
      │                                                                │ 6. Delivered
      │◄────────Status Update──────────────────────────────────────────┤
      │         (DELIVERED)                                            │
```

### 3. Webhook Communication Flow

```
MenuVerse                           ChopChop                         RiderApp
    │                                   │                                │
    │ 1. Order Status Changed           │                                │
    │    (Vendor Action)                │                                │
    │                                   │                                │
    │ 2. Send Webhook                   │                                │
    ├────POST /api/webhooks/───────────►│                                │
    │    menuverse-order-update         │                                │
    │                                   │ 3. Validate API Key            │
    │                                   │                                │
    │                                   │ 4. Update Firebase             │
    │                                   │    orders/{orderId}            │
    │                                   │                                │
    │◄─────Webhook Response──────────────┤                                │
    │      (200 OK)                     │                                │
    │                                   │                                │
    │                                   │ 5. Firebase Listener           │
    │                                   │    Triggers Update             │
    │                                   │    to Customer UI              │
    │                                   │                                │
    │                                   │                                │
    │                                   │                                │ 6. Rider Updates
    │                                   │◄───────Location Update─────────┤    Location
    │                                   │    POST /api/webhooks/         │
    │                                   │    rider-location-update       │
    │                                   │                                │
    │                                   │ 7. Update Firebase             │
    │◄──────Query Order Details─────────┤    Update UI                   │
    │                                   │                                │
    ├────Order + Rider Location────────►│                                │
```

---

## Integration Scenarios

### Scenario 1: Customer Places Order

**Flow**:
1. Customer browses restaurants via MenuVerse GraphQL API
2. Customer adds items to cart (local state)
3. Customer proceeds to checkout
4. ChopChop calls Moonify API for payment processing
5. On payment success, ChopChop sends order to MenuVerse via GraphQL
6. MenuVerse creates order in Firebase with status `PENDING`
7. ChopChop saves order to `customer-orders` collection
8. Customer redirected to order confirmation page

**API Calls**:

```typescript
// 1. Get restaurants
const response = await fetch('https://menuverse.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `query { eateries { id name description } }`
  })
});

// 2. Place order
const orderResponse = await fetch('https://menuverse.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      mutation PlaceOrder($input: OrderInput!) {
        placeOrder(input: $input) {
          id
          status
          orderId
        }
      }
    `,
    variables: {
      input: {
        eateryId: restaurantId,
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          address: '123 Main St, Lagos'
        },
        items: cartItems,
        totalAmount: 5000,
        paymentMethod: 'card',
        paymentStatus: 'paid'
      }
    }
  })
});
```

---

### Scenario 2: Vendor Updates Order Status

**Flow**:
1. Vendor logs into MenuVerse dashboard
2. Vendor sees pending order notification
3. Vendor confirms order → Status changes to `CONFIRMED`
4. MenuVerse triggers webhook to ChopChop
5. ChopChop receives webhook, updates Firebase
6. Customer's UI auto-updates via Firebase listener

**API Calls**:

```typescript
// MenuVerse sends webhook to ChopChop
await fetch('https://chopchop.com/api/webhooks/menuverse-order-update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.MENUVERSE_WEBHOOK_API_KEY
  },
  body: JSON.stringify({
    orderId: 'ORD-123456',
    status: 'CONFIRMED',
    restaurantId: 'REST-001',
    restaurantName: 'Mama Cass Kitchen',
    timestamp: new Date().toISOString()
  })
});

// ChopChop webhook handler updates Firebase
const orderRef = doc(db, 'orders', orderId);
await updateDoc(orderRef, {
  status: 'CONFIRMED',
  deliveryStatus: 'packaging',
  updatedAt: serverTimestamp(),
  trackingUpdates: arrayUnion({
    status: 'packaging',
    timestamp: serverTimestamp(),
    message: 'Your food is being prepared'
  })
});
```

---

### Scenario 3: Rider Accepts and Delivers Order

**Flow**:
1. Vendor assigns order to rider in MenuVerse
2. MenuVerse sends notification to RiderApp
3. Rider accepts assignment via RiderApp
4. RiderApp updates status via API
5. RiderApp sends location updates every 30 seconds
6. ChopChop receives location updates via webhook
7. Customer sees real-time rider location on map
8. Rider marks order as delivered
9. All systems updated via webhooks

**API Calls**:

```typescript
// 1. Rider accepts order
await fetch('https://riderapp.com/api/orders/ORD-123456/accept', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${riderToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    riderId: 'RIDER-001',
    estimatedPickupTime: '2025-11-11T14:30:00Z'
  })
});

// 2. Rider updates location
await fetch('https://riderapp.com/api/location/update', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${riderToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    riderId: 'RIDER-001',
    orderId: 'ORD-123456',
    latitude: 6.5244,
    longitude: 3.3792,
    heading: 45,
    speed: 20
  })
});

// 3. RiderApp sends webhook to ChopChop
await fetch('https://chopchop.com/api/webhooks/rider-location-update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.RIDER_WEBHOOK_API_KEY
  },
  body: JSON.stringify({
    orderId: 'ORD-123456',
    riderId: 'RIDER-001',
    latitude: 6.5244,
    longitude: 3.3792,
    timestamp: new Date().toISOString()
  })
});

// 4. Rider marks as delivered
await fetch('https://riderapp.com/api/orders/ORD-123456/deliver', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${riderToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    riderId: 'RIDER-001',
    deliveryPhoto: 'base64_image_string',
    customerSignature: 'base64_signature',
    notes: 'Delivered to customer'
  })
});
```

---

## API Reference

### ChopChop Webhook Handlers

#### MenuVerse Order Update Webhook

**Endpoint**: `POST /api/webhooks/menuverse-order-update`

**Headers**:
```
Content-Type: application/json
X-API-Key: your_webhook_api_key
```

**Request Body**:
```typescript
{
  orderId: string;           // ChopChop order ID
  status: string;            // MenuVerse order status
  restaurantId?: string;     // Restaurant ID
  restaurantName?: string;   // Restaurant name
  timestamp?: string;        // ISO 8601 timestamp
  riderInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
  };
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  orderId: string;
  deliveryStatus: string;
}
```

**Status Mapping**:
```typescript
const STATUS_MAP = {
  'PENDING': 'order_received',
  'PENDING_PAYMENT': 'order_received',
  'CONFIRMED': 'packaging',
  'PROCESSING': 'packaging',
  'READY': 'awaiting_dispatch',
  'OUT_FOR_DELIVERY': 'dispatched',
  'DELIVERED': 'delivered',
  'CANCELLED': 'order_received'
};
```

**Example**:
```bash
curl -X POST https://chopchop.com/api/webhooks/menuverse-order-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "orderId": "ORD-123456",
    "status": "CONFIRMED",
    "restaurantId": "REST-001",
    "restaurantName": "Mama Cass Kitchen",
    "timestamp": "2025-11-11T14:00:00Z"
  }'
```

---

#### Rider Location Update Webhook

**Endpoint**: `POST /api/webhooks/rider-location-update`

**Headers**:
```
Content-Type: application/json
X-API-Key: your_webhook_api_key
```

**Request Body**:
```typescript
{
  orderId: string;
  riderId: string;
  latitude: number;
  longitude: number;
  heading?: number;          // Direction in degrees (0-360)
  speed?: number;            // km/h
  timestamp: string;         // ISO 8601
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;
  orderId: string;
}
```

**Example**:
```bash
curl -X POST https://chopchop.com/api/webhooks/rider-location-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "orderId": "ORD-123456",
    "riderId": "RIDER-001",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "heading": 45,
    "speed": 20,
    "timestamp": "2025-11-11T14:05:00Z"
  }'
```

---

### Order Sync API

**Endpoint**: `GET /api/sync-orders`

**Query Parameters**:
- `orderId` (optional): Sync specific order
- `userId` (optional): Sync all orders for user

**Response**:
```typescript
{
  success: boolean;
  message: string;
  count?: number;           // Number of orders synced
  orderId?: string;         // When syncing single order
}
```

**Examples**:
```bash
# Sync specific order
GET /api/sync-orders?orderId=ORD-123456

# Sync user's orders
GET /api/sync-orders?userId=user_abc123

# Sync recent orders (last 24 hours)
GET /api/sync-orders
```

---

## Webhooks

### Setting Up Webhooks

#### In MenuVerse

1. Configure ChopChop webhook URL:
```javascript
const CHOPCHOP_WEBHOOK_URL = process.env.CHOPCHOP_WEBHOOK_URL;
const WEBHOOK_API_KEY = process.env.CHOPCHOP_WEBHOOK_API_KEY;
```

2. Send webhook on order status change:
```typescript
async function sendOrderUpdateToChopChop(orderId: string, status: string) {
  try {
    const response = await fetch(
      `${CHOPCHOP_WEBHOOK_URL}/api/webhooks/menuverse-order-update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': WEBHOOK_API_KEY
        },
        body: JSON.stringify({
          orderId,
          status,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          timestamp: new Date().toISOString()
        })
      }
    );
    
    if (!response.ok) {
      console.error('Webhook failed:', await response.text());
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}
```

#### In RiderApp

1. Configure ChopChop webhook URL:
```javascript
const CHOPCHOP_WEBHOOK_URL = process.env.CHOPCHOP_WEBHOOK_URL;
const WEBHOOK_API_KEY = process.env.CHOPCHOP_WEBHOOK_API_KEY;
```

2. Send location updates:
```typescript
async function sendLocationUpdate(orderId: string, location: Location) {
  try {
    await fetch(
      `${CHOPCHOP_WEBHOOK_URL}/api/webhooks/rider-location-update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': WEBHOOK_API_KEY
        },
        body: JSON.stringify({
          orderId,
          riderId: currentRider.id,
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          timestamp: new Date().toISOString()
        })
      }
    );
  } catch (error) {
    console.error('Location update failed:', error);
  }
}
```

### Webhook Security

**API Key Authentication**:
```typescript
// Verify API key in webhook handler
const apiKey = req.headers['x-api-key'];
const validKey = process.env.MENUVERSE_WEBHOOK_API_KEY;

if (!apiKey || apiKey !== validKey) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Signature Verification** (Recommended for production):
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Authentication

### API Authentication Methods

#### 1. API Key (Current Implementation)

**Usage**: Webhook authentication

```typescript
headers: {
  'X-API-Key': process.env.WEBHOOK_API_KEY
}
```

**Security**: Store keys in environment variables, rotate regularly

#### 2. JWT Tokens (Recommended for user-facing APIs)

**Generation**:
```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Verification**:
```typescript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### 3. Firebase Authentication

**Used by**: ChopChop customer authentication

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

// Include ID token in API requests
const idToken = await user.getIdToken();
```

---

## Error Handling

### Standard Error Response Format

```typescript
{
  error: string;              // Error message
  details?: string;           // Additional details
  code?: string;              // Error code
  field?: string;             // Field that caused error
  timestamp: string;          // ISO 8601 timestamp
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

### Error Handling Examples

**API Call with Error Handling**:
```typescript
try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error);
  }
  
  const result = await response.json();
  return result;
  
} catch (error) {
  console.error('API call failed:', error);
  
  // Retry logic for transient errors
  if (error.code === 'ECONNRESET' || error.code === 503) {
    return retryWithBackoff(apiCall, maxRetries);
  }
  
  throw error;
}
```

**Webhook Error Handling**:
```typescript
export default async function handler(req, res) {
  try {
    // Validate request
    if (!req.body.orderId) {
      return res.status(400).json({
        error: 'Missing required field',
        field: 'orderId',
        timestamp: new Date().toISOString()
      });
    }
    
    // Process webhook
    await processWebhook(req.body);
    
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## Testing

### Testing Webhooks

#### Using cURL

```bash
# Test MenuVerse order update webhook
curl -X POST http://localhost:3000/api/webhooks/menuverse-order-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key" \
  -d '{
    "orderId": "ORD-TEST-001",
    "status": "CONFIRMED",
    "restaurantId": "REST-001",
    "restaurantName": "Test Restaurant"
  }'

# Test rider location update webhook
curl -X POST http://localhost:3000/api/webhooks/rider-location-update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_api_key" \
  -d '{
    "orderId": "ORD-TEST-001",
    "riderId": "RIDER-001",
    "latitude": 6.5244,
    "longitude": 3.3792
  }'
```

#### Using Postman

1. Create new POST request
2. Set URL: `http://localhost:3000/api/webhooks/menuverse-order-update`
3. Add headers:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `your_test_key`
4. Add JSON body
5. Send request
6. Verify response and Firebase updates

#### Webhook Testing Tool

```typescript
// scripts/test-webhook.ts
async function testWebhook() {
  const response = await fetch('http://localhost:3000/api/webhooks/menuverse-order-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.WEBHOOK_API_KEY || 'test_key'
    },
    body: JSON.stringify({
      orderId: `ORD-TEST-${Date.now()}`,
      status: 'CONFIRMED',
      restaurantId: 'REST-001',
      restaurantName: 'Test Restaurant',
      timestamp: new Date().toISOString()
    })
  });
  
  const result = await response.json();
  console.log('Webhook Response:', result);
  
  if (response.ok) {
    console.log('✅ Webhook test passed');
  } else {
    console.error('❌ Webhook test failed');
  }
}

testWebhook();
```

Run with: `npx ts-node scripts/test-webhook.ts`

---

### Integration Testing

#### Test Order Flow

```typescript
// tests/integration/order-flow.test.ts
describe('Complete Order Flow', () => {
  it('should handle order from placement to delivery', async () => {
    // 1. Place order via ChopChop
    const order = await placeOrder({
      restaurantId: 'REST-001',
      items: [{ id: 'ITEM-001', quantity: 2 }]
    });
    
    expect(order.id).toBeDefined();
    expect(order.status).toBe('PENDING');
    
    // 2. Simulate MenuVerse confirmation
    await sendWebhook({
      orderId: order.id,
      status: 'CONFIRMED'
    });
    
    // Wait for Firebase update
    await delay(1000);
    
    // 3. Verify order status updated
    const updatedOrder = await getOrder(order.id);
    expect(updatedOrder.status).toBe('CONFIRMED');
    expect(updatedOrder.deliveryStatus).toBe('packaging');
    
    // 4. Simulate rider assignment
    await sendWebhook({
      orderId: order.id,
      status: 'OUT_FOR_DELIVERY',
      riderInfo: {
        name: 'Test Rider',
        phone: '+2348012345678'
      }
    });
    
    // 5. Verify delivery status
    await delay(1000);
    const deliveryOrder = await getOrder(order.id);
    expect(deliveryOrder.deliveryStatus).toBe('dispatched');
    expect(deliveryOrder.riderInfo).toBeDefined();
  });
});
```

---

## Environment Variables

### ChopChop

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=

# MenuVerse
NEXT_PUBLIC_MENUVERSE_API_URL=https://menuverse.com/graphql
NEXT_PUBLIC_MENUVERSE_API_KEY=
MENUVERSE_WEBHOOK_API_KEY=

# RiderApp
RIDER_WEBHOOK_API_KEY=

# Moonify Payment
NEXT_PUBLIC_MOONIFY_API_KEY=
MOONIFY_SECRET_KEY=
MOONIFY_CONTRACT_CODE=
```

### MenuVerse

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# ChopChop Webhook
CHOPCHOP_WEBHOOK_URL=https://chopchop.com
CHOPCHOP_WEBHOOK_API_KEY=

# RiderApp
RIDERAPP_API_URL=https://riderapp.com/api
RIDERAPP_API_KEY=
```

### RiderApp

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_API_KEY=

# ChopChop Webhook
CHOPCHOP_WEBHOOK_URL=https://chopchop.com
CHOPCHOP_WEBHOOK_API_KEY=

# MenuVerse
MENUVERSE_API_URL=https://menuverse.com/graphql
MENUVERSE_API_KEY=
```

---

## Best Practices

### 1. API Versioning

```
/api/v1/orders
/api/v2/orders
```

### 2. Rate Limiting

```typescript
// Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Request Logging

```typescript
console.log({
  timestamp: new Date().toISOString(),
  method: req.method,
  url: req.url,
  body: req.body,
  headers: req.headers
});
```

### 4. Idempotency

```typescript
// Use idempotency keys for webhooks
const idempotencyKey = `${orderId}-${status}-${timestamp}`;

// Check if already processed
if (await isProcessed(idempotencyKey)) {
  return res.status(200).json({ message: 'Already processed' });
}

// Process and mark as processed
await processWebhook(data);
await markAsProcessed(idempotencyKey);
```

### 5. Monitoring

```typescript
// Track webhook success/failure rates
import { captureException } from '@sentry/node';

try {
  await processWebhook(data);
  metrics.increment('webhook.success');
} catch (error) {
  metrics.increment('webhook.failure');
  captureException(error);
  throw error;
}
```

---

## Troubleshooting

### Common Issues

**1. Webhook not receiving updates**
- Verify webhook URL is accessible
- Check API key is correct
- Verify Content-Type header
- Check firewall/security groups

**2. Order status not syncing**
- Check Firebase permissions
- Verify order ID matches across systems
- Check webhook logs for errors
- Ensure Firebase listeners are active

**3. Location updates not showing**
- Verify GPS permissions in RiderApp
- Check location update frequency
- Verify webhook API key
- Check Firebase update logs

**4. Payment not processing**
- Verify Moonify API credentials
- Check payment webhook configuration
- Review payment logs
- Test with small amounts first

---

## Support

For integration support:
- **Email**: dev@chopchop.com
- **Slack**: #api-integration
- **Documentation**: https://chopchop.com/docs
- **Status Page**: https://status.chopchop.com

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Maintained by**: ChopChop Development Team
