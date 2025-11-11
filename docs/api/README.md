# ChopChop API - Firebase Backend

> **GraphQL API server enabling seamless order management and synchronization between ChopChop and MenuVerse platforms**

[![Tests Passing](https://img.shields.io/badge/tests-9%2F9%20passing-brightgreen)]()
[![API Status](https://img.shields.io/badge/status-production--ready-success)]()
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)]()
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)]()

## 🎯 Overview

This API serves as the central hub for the ChopChop food delivery platform, providing:

- **Unified Order Management**: Place, track, and update orders with full lifecycle management
- **MenuVerse Integration**: Bidirectional order synchronization with MenuVerse vendor platform
- **Real-time Status Updates**: WebSocket subscriptions for live order status changes
- **Webhook Support**: Receive status updates from external systems (MenuVerse)
- **Dual Firebase Support**: Primary (ChopChop) and secondary (MenuVerse) Firebase instances

## ✨ Key Features

### Core Functionality
- 🍽️ **Restaurant Management**: Query and manage restaurant data
- 📦 **Order Processing**: Complete order lifecycle with status tracking
- 💳 **Payment Methods**: CASH (immediate confirmation) and electronic payments
- 📊 **Order History**: Append-only audit trail for all status changes
- 🔔 **Real-time Subscriptions**: GraphQL subscriptions for order updates

### MenuVerse Integration
- 🔄 **Bidirectional Sync**: Sync orders between ChopChop and MenuVerse Firebase instances
- 🪝 **Webhook Endpoints**: Receive order updates from MenuVerse platform
- 🚴 **Rider Information**: Track delivery rider details from MenuVerse
- 🏪 **Vendor Mapping**: Associate orders with MenuVerse vendor IDs

### Developer Tools
- 🧪 **Test Dashboard**: Interactive browser-based testing interface
- 🎭 **Automated Tests**: Playwright end-to-end test suite
- 📝 **Comprehensive Docs**: API reference, integration guides, and examples
- 🔑 **Authentication**: Firebase ID token-based auth with test utilities

## Setup

### 1. Get Firebase Service Account Credentials

**⚠️ IMPORTANT**: You need Firebase Admin SDK credentials, NOT the client-side config!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chopchop-67750`
3. Click the gear icon → **Project Settings**
## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Firebase Admin SDK credentials

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd enatega/api

# 2. Install dependencies
npm install

# 3. Configure environment variables (see Configuration section)
cp .env.example .env

# 4. Start the API server
npm start

# API will be available at:
# - GraphQL Playground: http://localhost:4000/graphql
# - Test Dashboard: http://localhost:3000 (run: npm run test:dashboard)
```

### Verify Installation

```bash
# Run automated tests
npx playwright test --config=playwright-config.js

# Or use the interactive test dashboard
npm run test:dashboard
# Open http://localhost:3000 in your browser
```

## ⚙️ Configuration

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Primary Firebase (ChopChop)
FIREBASE_PROJECT_ID=chopchop-67750
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chopchop-67750.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# Optional: Secondary Firebase (MenuVerse)
# Required only for bidirectional sync with MenuVerse
SECONDARY_FIREBASE_PROJECT_ID=menuverse-xxxxx
SECONDARY_FIREBASE_PRIVATE_KEY_ID=your_secondary_private_key_id
SECONDARY_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SECONDARY_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@menuverse-xxxxx.iam.gserviceaccount.com

# Firebase Auth (for testing)
FIREBASE_API_KEY=your_firebase_api_key
```

### Getting Firebase Credentials

**Primary Firebase (ChopChop):**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `chopchop-67750`
3. Click gear icon → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file
7. Extract the values into your `.env` file

**Secondary Firebase (MenuVerse):**

Follow the same steps for the MenuVerse Firebase project (if available).

### API Keys for Testing

1. Go to Firebase Console → Project Settings → **General** tab
2. Scroll to "Your apps" section
3. Copy the **Web API Key**
4. Add to `.env` as `FIREBASE_API_KEY`

## 📚 Documentation

Comprehensive guides for developers:

- **[API Quick Reference](./API-QUICK-REFERENCE.md)** - All mutations and queries with examples
- **[API Endpoints](./API-ENDPOINTS.md)** - Detailed endpoint documentation
- **[Developer Integration Guide](./DEVELOPER-INTEGRATION-GUIDE.md)** - Step-by-step integration instructions
- **[Order Status Verification](./ORDER-STATUS-VERIFICATION.md)** - Test results and status flow documentation
- **[Environment Variables](./ENVIRONMENT-VARIABLES.md)** - Complete environment configuration guide
- **[Feature Roadmap](./FEATURE-ROADMAP.md)** - Upcoming features and enhancements
- **[Documentation Index](./DOCUMENTATION-INDEX.md)** - Complete documentation navigation

## 🎯 API Endpoints

### GraphQL

**Endpoint:** `http://localhost:4000/graphql`

**Playground:** Available in development mode for testing queries and mutations

### Key Mutations

```graphql
# Place an order
placeOrder(
  restaurant: String!
  orderInput: [OrderItemInput!]!
  paymentMethod: String!
  orderDate: String!
  menuVerseVendorId: String
  address: String
): Order!

# Update order status
updateOrderStatus(
  orderId: ID!
  status: String!
  note: String
): Order!

# Webhook from MenuVerse (no auth required)
webhookMenuVerseOrderUpdate(
  orderId: ID!
  status: String!
  riderInfo: RiderInfoInput
): Order!

# Sync from MenuVerse Firebase
syncOrderFromMenuVerse(
  orderId: ID!
  vendorId: String
): Order!
```

### Key Queries

```graphql
# Get all restaurants
restaurants: [Restaurant!]!

# Get user's orders (requires auth)
orders: [Order!]!

# Get specific order (requires auth)
order(id: ID!): Order

# Get current user
me: User
```

### Subscriptions

```graphql
# Subscribe to order status changes
orderStatusUpdated(orderId: ID!): Order!
```

## 🔐 Authentication

The API uses **Firebase ID tokens** for authentication.

### For Client Applications

```javascript
// 1. Sign in with Firebase Auth
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// 2. Get ID token
const idToken = await userCredential.user.getIdToken();

// 3. Use token in API requests
const response = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    query: '{ orders { orderId orderStatus } }'
  })
});
```

### For Testing

```bash
# Generate a test token
npm run get:auth-token

# Use the token in GraphQL Playground
# HTTP Headers:
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

## 🧪 Testing

### Interactive Test Dashboard

```bash
# Start the dashboard
npm run test:dashboard

# Open in browser
# http://localhost:3000
```

The dashboard provides:
- One-click testing for all API features
- Real-time test results
- Order creation and status updates
- Webhook simulation
- Authentication flow testing

### Automated Tests

```bash
# Run Playwright tests
npx playwright test --config=playwright-config.js

# Run with UI mode (recommended)
npx playwright test --ui

# View test report
npx playwright show-report
```

### Manual Testing Scripts

```bash
# Test order status flow
npm run test:status-flow

# Test MenuVerse sync
npm run test:sync

# Test without authentication
npm run test:no-auth
```

## 🏗️ Architecture

### Tech Stack

- **GraphQL Server:** Apollo Server Express
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth with ID tokens
- **Real-time:** GraphQL Subscriptions (PubSub)
- **Testing:** Playwright for E2E tests

### Database Structure

```
Firestore Collections:
├── users/           # User profiles
├── restaurants/     # Restaurant data
├── orders/          # Order documents
│   ├── orderId      # Human-readable ID (ORD-timestamp-random)
│   ├── userId       # Owner
│   ├── orderStatus  # Current status
│   ├── statusHistory[] # Audit trail
│   ├── menuVerseVendorId # MenuVerse integration
│   └── riderInfo    # Delivery rider details
└── ... (other collections)
```

### Order Status Flow

```
CASH Payment:
CONFIRMED → PROCESSING → READY → OUT_FOR_DELIVERY → DELIVERED

Electronic Payment:
PENDING_PAYMENT → CONFIRMED → PROCESSING → READY → OUT_FOR_DELIVERY → DELIVERED

Cancellation:
Any status → CANCELLED
```

## 🔄 MenuVerse Integration

### Setup Requirements

1. **MenuVerse Vendor Account**: Get vendor ID from MenuVerse
2. **Secondary Firebase Access**: Obtain MenuVerse Firebase credentials
3. **Environment Configuration**: Add `SECONDARY_FIREBASE_*` variables

### How It Works

#### 1. Order Placement (ChopChop → MenuVerse)

```graphql
mutation {
  placeOrder(
    restaurant: "Restaurant Name"
    orderInput: [{ title: "Burger", food: "burger", quantity: 1, price: 10.0, total: 10.0 }]
    paymentMethod: "CASH"
    orderDate: "2025-11-06T10:00:00Z"
    menuVerseVendorId: "vendor_id_here"  # ← Links to MenuVerse
    address: "123 Main St"
  ) {
    orderId
    orderStatus
  }
}
```

Orders with `menuVerseVendorId` are:
- Saved to ChopChop Firebase
- Optionally written to MenuVerse Firebase (if configured)

#### 2. Webhook Updates (MenuVerse → ChopChop)

MenuVerse can send status updates:

```graphql
mutation {
  webhookMenuVerseOrderUpdate(
    orderId: "ORD-1762393846603-p8s61wsoc"
    status: "OUT_FOR_DELIVERY"
    riderInfo: {
      name: "John Doe"
      phone: "+1234567890"
    }
  ) {
    orderId
    orderStatus
    riderInfo {
      name
      phone
    }
  }
}
```

**Note:** Webhooks don't require authentication (meant for server-to-server communication).

#### 3. Manual Sync (ChopChop ← MenuVerse)

Pull latest order data from MenuVerse:

```graphql
mutation {
  syncOrderFromMenuVerse(
    orderId: "ORD-1762393846603-p8s61wsoc"
  ) {
    orderId
    orderStatus
    lastSyncedAt
  }
}
```

Requires `SECONDARY_FIREBASE_*` environment variables.

```bash
# Start server
npm start                    # Production
npm run dev                  # Development (nodemon)

# Testing
npm run test:dashboard       # Interactive dashboard (port 3000)
npm run test:status-flow     # Test order lifecycle
npm run test:sync            # Test MenuVerse sync
npx playwright test          # Run automated E2E tests

# Authentication utilities
npm run get:auth-token       # Generate Firebase ID token
npm run create-user          # Create test user
```

## � Troubleshooting

### Common Issues

**1. "Authentication required" error**
```bash
# Generate a fresh token (expires after 1 hour)
npm run get:auth-token

# Use token in Authorization header
Authorization: Bearer <token>
```

**2. "Order not found" error**
- Ensure you're using the `orderId` field (e.g., `ORD-1762393846603-p8s61wsoc`)
- Not the Firestore document ID
- Order must belong to the authenticated user

**3. "MenuVerse integration not configured"**
```bash
# Add to .env file:
SECONDARY_FIREBASE_PROJECT_ID=menuverse-project
SECONDARY_FIREBASE_PRIVATE_KEY_ID=...
SECONDARY_FIREBASE_PRIVATE_KEY="..."
SECONDARY_FIREBASE_CLIENT_EMAIL=...
```

**4. Port already in use**
```powershell
# Windows: Find and kill process
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object Id
Stop-Process -Id <process_id> -Force

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

**5. Firebase credentials error**
- Verify `.env` file exists and is properly formatted
- Check that private key includes full PEM format with `\n` characters
- Ensure service account has Firestore permissions

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make changes and test**
```bash
npm run test:dashboard  # Manual testing
npx playwright test     # Automated tests
```

3. **Commit with conventional commits**
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
```

4. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

### Code Style

- Use ES6+ features
- Follow existing code patterns
- Add JSDoc comments for functions
- Test all changes before committing

## 📄 License

ISC

## 👥 Support

For questions or issues:
1. Check the [Documentation Index](./DOCUMENTATION-INDEX.md)
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

## 🎯 What's Next?

See [FEATURE-ROADMAP.md](./FEATURE-ROADMAP.md) for planned enhancements:

- Enhanced payment gateway integration
- Advanced order analytics
- Multi-restaurant order batching
- Real-time rider tracking
- Customer notification system
- Order scheduling and pre-orders

---

**Built with ❤️ for ChopChop Food Delivery Platform**

```bash
# Start server
npm start                    # Production
npm run dev                  # Development (nodemon)

## Payment Method Logic

- **CASH**: Order status set to `CONFIRMED` immediately
- **CARD/WALLET/BANK**: Order status set to `PENDING_PAYMENT` (requires payment processing)

## Environment Variables

```env
FIREBASE_PROJECT_ID=chopchop-67750
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chopchop-67750.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
PORT=4000
```

## Documentation

### **For Developers**
- **[Developer Integration Guide](DEVELOPER-INTEGRATION-GUIDE.md)** - Complete setup, integration, and API reference
- **[Environment Variables](ENVIRONMENT-VARIABLES.md)** - Firebase credentials and configuration
- **[API Quick Reference](API-QUICK-REFERENCE.md)** - Fast lookup for GraphQL operations

### **For Users**
- **README.md** (this file) - Overview and quick start