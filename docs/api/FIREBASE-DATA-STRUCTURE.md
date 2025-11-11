# Firebase Data Structure Documentation

**Date**: November 6, 2025  
**Project**: ChopChop Food Delivery Platform  
**Purpose**: Standardize order storage locations and prevent future confusion

---

## 🗂️ Current Firebase Collections Overview

### **Problem Identified**
Orders are currently stored in **multiple locations** with different structures, causing confusion and integration issues. MenuVerse couldn't display orders because:
- Orders were created in `eateries/{vendorId}/orders`
- But the GraphQL API query looks for orders in `orders` collection by `userId`
- This mismatch prevented MenuVerse from fetching and displaying orders

---

## 📊 Firebase Storage Tree (Current State)

```
chopchop-67750 (Firebase Project)
│
├── 📁 users/
│   └── {userId}/
│       ├── profile data
│       └── 📁 notifications/
│           └── {notificationId}
│               ├── type: "order_status_update"
│               ├── orderId
│               ├── message
│               ├── createdAt
│               └── read: boolean
│
├── 📁 orders/  ⚠️ PRIMARY FOR API QUERIES
│   └── {orderId}
│       ├── orderId: "ORD-..."
│       ├── userId: {customerId}  ← API filters by this
│       ├── restaurant: "Restaurant Name"
│       ├── orderItems: [{...}]
│       ├── orderAmount: number
│       ├── orderStatus: "CONFIRMED" | "PROCESSING" | ...
│       ├── paymentMethod: "CASH" | "CARD"
│       ├── orderDate: Timestamp
│       ├── statusHistory: [{status, timestamp, note}]
│       └── createdAt: Timestamp
│
├── 📁 customer-orders/  ⚠️ SECONDARY (Customer-facing)
│   └── {orderId}
│       ├── orderId: "ORD-..."
│       ├── customerId: {userId}  ← Customer reference
│       ├── restaurantId: {vendorId}
│       ├── restaurantName: string
│       ├── orderStatus: "Pending" | "Confirmed" | ...
│       ├── items: [{...}]
│       ├── orderItems: [{...}]  ← Duplicate field
│       ├── totalAmount: number
│       ├── orderAmount: number  ← Duplicate field
│       ├── statusHistory: [{status, timestamp, note}]
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
├── 📁 eateries/  ⚠️ VENDOR-SPECIFIC (MenuVerse orders)
│   └── {vendorId}/
│       ├── name: "Restaurant Name"
│       ├── email: "vendor@example.com"
│       ├── phone: string
│       ├── address: string
│       └── 📁 orders/  ← Vendor sees these in MenuVerse
│           └── {orderId}
│               ├── orderId: "ORD-..."
│               ├── customerId: {userId}
│               ├── customer: {uid, name, email, phone, address}
│               ├── restaurant: {id, name}
│               ├── items: [{id, name, quantity, price}]
│               ├── totalAmount: number
│               ├── total: number  ← Duplicate field
│               ├── status: "Pending" | "Confirmed" | ...
│               ├── platform: "ChopChop" | "MenuVerse"
│               ├── paymentMethod: "CASH" | "CARD"
│               ├── createdAt: Timestamp
│               └── updatedAt: Timestamp
│
└── 📁 restaurants/ (if exists - legacy?)
    └── ...
```

---

## 🎯 **STANDARDIZED ORDER FLOW (Recommended)**

### **1. Order Placement (ChopChop App → API)**

**Entry Point**: `placeOrder` mutation in GraphQL API

**What Happens**:
```javascript
1. Create order in `orders/` collection
   - orderId: ORD-{timestamp}-{random}
   - userId: {customerId}
   - restaurant: vendorId or name
   - orderItems: [{...}]
   - orderStatus: "CONFIRMED" or "PENDING_PAYMENT"
   - statusHistory: [initial entry]

2. Create vendor copy in `eateries/{vendorId}/orders/`
   - Same orderId
   - Full order details
   - status: matches orderStatus

3. Create customer-facing copy in `customer-orders/`
   - Same orderId
   - customerId reference
   - restaurantId, restaurantName
   - statusHistory
```

### **2. Status Update (MenuVerse → API → ChopChop)**

**Entry Point**: `webhookMenuVerseOrderUpdate` mutation

**What Happens**:
```javascript
1. API receives: { orderId, newStatus, riderInfo }

2. Find order by orderId field (NOT document ID):
   - Query: collection('orders').where('orderId', '==', orderId)

3. Update THREE locations atomically:
   a) orders/{docId}
      - orderStatus: newStatus
      - statusHistory: append entry
      - riderInfo: if provided

   b) eateries/{vendorId}/orders/{orderId}
      - status: newStatus
      - updatedAt: now

   c) customer-orders/{orderId}
      - orderStatus: newStatus
      - statusHistory: append entry
      - updatedAt: now

4. Create notification:
   - users/{customerId}/notifications/
```

---

## 🔧 **FIXING MENUVERSE ORDERS QUERY**

### Current Issue:
MenuVerse calls `GET_USER_ORDERS` → API's `orders` query → looks in `orders/` collection by `userId`

But vendors need to see orders from `eateries/{vendorId}/orders/`

### Solution Options:

#### **Option A: Update API to Support Vendor Queries** ✅ RECOMMENDED

Add vendor-specific query to API:

```javascript
// In schema.js
vendorOrders: async (_, __, { user }) => {
  if (!user) throw new Error('Authentication required');
  
  // Query vendor's orders from eateries collection
  const ordersSnap = await db
    .collection('eateries')
    .doc(user.uid)
    .collection('orders')
    .orderBy('createdAt', 'desc')
    .get();
  
  return ordersSnap.docs.map(doc => ({
    id: doc.id,
    orderId: doc.data().orderId,
    status: doc.data().status,
    total: doc.data().totalAmount || doc.data().total,
    createdAt: doc.data().createdAt,
    items: doc.data().items || [],
    customer: doc.data().customer,
    restaurant: doc.data().restaurant || { id: user.uid, name: 'My Restaurant' }
  }));
}
```

Then MenuVerse uses `GET_VENDOR_ORDERS` instead of `GET_USER_ORDERS`.

#### **Option B: Consolidate All Orders** ⚠️ COMPLEX

Move all vendor orders to `orders/` collection with `vendorId` field. Would require data migration.

---

## 📋 **FIELD NAMING STANDARDS**

### Status Field Names:
- `orders/` → `orderStatus` (string)
- `customer-orders/` → `orderStatus` (string)
- `eateries/{v}/orders/` → `status` (string)

### Amount Field Names:
- `orders/` → `orderAmount`, `paidAmount`
- `customer-orders/` → `totalAmount`, `orderAmount`
- `eateries/{v}/orders/` → `totalAmount`, `total`

### Items Field Names:
- `orders/` → `orderItems` (array)
- `customer-orders/` → `items`, `orderItems` (both!)
- `eateries/{v}/orders/` → `items` (array)

### Date Field Names:
- `orders/` → `orderDate`, `createdAt`, `updatedAt`
- `customer-orders/` → `createdAt`, `updatedAt`
- `eateries/{v}/orders/` → `createdAt`, `updatedAt`

---

## ✅ **ACTION ITEMS TO FIX MENUVERSE**

### Immediate (Quick Fix):

1. **Add `vendorOrders` query to API** (schema.js)
2. **Create `GET_VENDOR_ORDERS` GraphQL query** (MenuVerse)
3. **Update MenuVerse orders page** to use vendor query

### Long-term (Data Consistency):

1. **Standardize field names** across all collections
2. **Create migration script** to consolidate duplicate fields
3. **Update all mutations** to maintain consistency
4. **Add validation** to prevent schema drift

---

## 🧪 **TESTING CHECKLIST**

After fixing, verify:

- [ ] Place order from ChopChop app
- [ ] Order appears in `orders/` collection with `userId`
- [ ] Order appears in `eateries/{vendorId}/orders/` with same `orderId`
- [ ] Order appears in `customer-orders/` with same `orderId`
- [ ] MenuVerse displays the order
- [ ] Update status in MenuVerse
- [ ] All three locations update simultaneously
- [ ] ChopChop app shows updated status
- [ ] Customer receives notification

---

## 📖 **QUERY REFERENCE**

### For Customers (ChopChop App):
```graphql
query GetMyOrders {
  orders {
    # Queries orders/ collection where userId == currentUser.uid
    # OR customer-orders/ where customerId == currentUser.uid
  }
}
```

### For Vendors (MenuVerse):
```graphql
query GetVendorOrders {
  vendorOrders {
    # Queries eateries/{currentUser.uid}/orders/ collection
  }
}
```

### For Admin:
```javascript
// Direct Firestore query
db.collection('orders').get()
db.collection('customer-orders').get()
db.collectionGroup('orders').get() // All orders across all eateries
```

---

## 🔐 **SECURITY RULES IMPLICATIONS**

Current Firestore rules should enforce:

```javascript
// orders/ - customers can read their own
match /orders/{orderId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if false; // Only API service account
}

// customer-orders/ - customers can read their own
match /customer-orders/{orderId} {
  allow read: if request.auth.uid == resource.data.customerId;
  allow write: if false; // Only API service account
}

// eateries/{vendorId}/orders/ - vendors can read their own
match /eateries/{vendorId}/orders/{orderId} {
  allow read: if request.auth.uid == vendorId;
  allow write: if false; // Only API service account
}
```

---

## 📞 **NEXT STEPS**

1. Review this document
2. Decide on Option A or B for MenuVerse fix
3. Implement chosen solution
4. Test thoroughly
5. Update this document with final implementation

---

**Last Updated**: November 6, 2025  
**Status**: 🔴 Issue Identified - Awaiting Fix Implementation
