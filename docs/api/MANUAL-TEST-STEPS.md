# 🧪 Manual Testing Steps - MenuVerse Order Sync

**GraphQL Playground:** http://localhost:4000/graphql

---

## Step 1: Create Test User (If Needed)

**Mutation:**
```graphql
mutation CreateTestUser {
  signUp(
    email: "chopchop.test@example.com"
    password: "TestPass123!"
    name: "ChopChop Test User"
    phone: "+1234567890"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "signUp": {
      "token": "eyJhbGciOiJSUzI1NiIs...",
      "user": {
        "id": "USER_ID_HERE",
        "email": "chopchop.test@example.com",
        "name": "ChopChop Test User"
      }
    }
  }
}
```

**📋 Save:** Copy the `token` and `user.id`

---

## Step 2: Sign In (If User Already Exists)

**Mutation:**
```graphql
mutation SignIn {
  signIn(
    email: "chopchop.test@example.com"
    password: "TestPass123!"
  ) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**📋 Save:** Copy the `token` value

---

## Step 3: Set Authorization Header

In GraphQL Playground, click **HTTP HEADERS** at the bottom and add:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Replace `YOUR_TOKEN_HERE` with the token from Step 1 or 2.

---

## Step 4: Create Address (If Needed)

**Mutation:**
```graphql
mutation AddAddress {
  addAddress(
    label: "Home"
    deliveryAddress: "123 Main Street, City"
    details: "Apartment 4B"
    latitude: 40.7128
    longitude: -74.0060
  ) {
    id
    label
    deliveryAddress
  }
}
```

**📋 Save:** Copy the `id` as your `addressId`

---

## Step 5: Query Available Restaurants

**Query:**
```graphql
query GetRestaurants {
  restaurants {
    id
    name
    address
    phone
    menuCategories {
      id
      name
      items {
        id
        name
        price
        description
      }
    }
  }
}
```

**📋 Save:** 
- Copy a `restaurant.id`
- Copy some `menuItem.id` values

---

## Step 6: Place Order with MenuVerse Vendor ID

**Mutation:**
```graphql
mutation PlaceOrderWithMenuVerse {
  placeOrder(
    restaurantId: "YOUR_RESTAURANT_ID"
    items: [
      {
        menuItemId: "MENU_ITEM_ID_1"
        quantity: 2
      },
      {
        menuItemId: "MENU_ITEM_ID_2"
        quantity: 1
      }
    ]
    addressId: "YOUR_ADDRESS_ID"
    paymentMethod: "CASH"
    menuVerseVendorId: "0GI3MojVnLfvzSEqMc25oCzAm Cz2"
  ) {
    id
    status
    menuVerseVendorId
    menuVerseOrderId
    total
    createdAt
    items {
      name
      quantity
      price
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "placeOrder": {
      "id": "ORDER_ID_HERE",
      "status": "PENDING",
      "menuVerseVendorId": "0GI3MojVnLfvzSEqMc25oCzAm Cz2",
      "menuVerseOrderId": null,
      "total": 25.99,
      "createdAt": "2025-11-05T...",
      "items": [...]
    }
  }
}
```

**📋 Save:** Copy the `id` as your `orderId`

**✅ Verify:**
- Order created with status "PENDING"
- `menuVerseVendorId` is set
- `menuVerseOrderId` is null (will be set after sync)

---

## Step 7: Sync Order from MenuVerse

**Mutation:**
```graphql
mutation SyncFromMenuVerse {
  syncOrderFromMenuVerse(
    orderId: "YOUR_ORDER_ID"
    menuVerseVendorId: "0GI3MojVnLfvzSEqMc25oCzAm Cz2"
  ) {
    id
    status
    menuVerseOrderId
    lastSyncedAt
    riderInfo {
      name
      phone
      location
    }
    items {
      name
      quantity
      price
    }
    total
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "syncOrderFromMenuVerse": {
      "id": "YOUR_ORDER_ID",
      "status": "CONFIRMED",
      "menuVerseOrderId": "MV_ORDER_123",
      "lastSyncedAt": "2025-11-05T...",
      "riderInfo": {
        "name": "John Rider",
        "phone": "+1234567890",
        "location": "Near restaurant"
      },
      "items": [...],
      "total": 25.99
    }
  }
}
```

**✅ Verify:**
- Status updated from "PENDING" to "CONFIRMED" (or other status)
- `menuVerseOrderId` is now set
- `lastSyncedAt` timestamp is present
- `riderInfo` populated if available

---

## Step 8: Simulate MenuVerse Webhook

**Mutation:**
```graphql
mutation WebhookUpdate {
  webhookMenuVerseOrderUpdate(
    orderId: "YOUR_ORDER_ID"
    status: "OUT_FOR_DELIVERY"
    restaurantId: "YOUR_RESTAURANT_ID"
    restaurantName: "Test Restaurant"
    riderInfo: {
      name: "Jane Delivery"
      phone: "+9876543210"
      location: "5 minutes away from customer"
    }
  ) {
    id
    status
    riderInfo {
      name
      phone
      location
    }
    lastSyncedAt
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "webhookMenuVerseOrderUpdate": {
      "id": "YOUR_ORDER_ID",
      "status": "OUT_FOR_DELIVERY",
      "riderInfo": {
        "name": "Jane Delivery",
        "phone": "+9876543210",
        "location": "5 minutes away from customer"
      },
      "lastSyncedAt": "2025-11-05T..."
    }
  }
}
```

**✅ Verify:**
- Status updated to "OUT_FOR_DELIVERY"
- Rider info updated with new details
- `lastSyncedAt` updated

---

## Step 9: Query Order to Verify Changes

**Query:**
```graphql
query GetOrderDetails {
  order(id: "YOUR_ORDER_ID") {
    id
    status
    menuVerseVendorId
    menuVerseOrderId
    lastSyncedAt
    riderInfo {
      name
      phone
      location
    }
    restaurant {
      id
      name
      address
    }
    items {
      name
      quantity
      price
    }
    total
    createdAt
    updatedAt
  }
}
```

**✅ Verify:**
- All fields populated correctly
- MenuVerse fields present
- Rider info matches last update
- Order history preserved

---

## Step 10: Test Bulk Sync

**Mutation:**
```graphql
mutation SyncAllOrders {
  syncAllOrdersFromMenuVerse(
    userId: "YOUR_USER_ID"
    menuVerseVendorId: "0GI3MojVnLfvzSEqMc25oCzAm Cz2"
  ) {
    id
    status
    menuVerseOrderId
    lastSyncedAt
    riderInfo {
      name
      phone
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "syncAllOrdersFromMenuVerse": [
      {
        "id": "ORDER_1",
        "status": "DELIVERED",
        "menuVerseOrderId": "MV_123",
        "lastSyncedAt": "2025-11-05T...",
        "riderInfo": {...}
      },
      {
        "id": "ORDER_2",
        "status": "CONFIRMED",
        "menuVerseOrderId": "MV_124",
        "lastSyncedAt": "2025-11-05T...",
        "riderInfo": null
      }
    ]
  }
}
```

**✅ Verify:**
- All orders with matching `menuVerseVendorId` synced
- Each order has updated status and timestamp

---

## Step 11: Query User's Orders

**Query:**
```graphql
query GetMyOrders {
  orders {
    id
    status
    menuVerseVendorId
    menuVerseOrderId
    lastSyncedAt
    restaurant {
      name
    }
    total
    createdAt
  }
}
```

**✅ Verify:**
- All user orders returned
- MenuVerse orders have vendor IDs
- Synced orders have lastSyncedAt timestamps

---

## 🎯 Testing Checklist

### Basic Functionality
- [ ] User can sign up/sign in
- [ ] Auth token works in headers
- [ ] Can query restaurants
- [ ] Can place order
- [ ] Order appears in user's orders

### MenuVerse Integration
- [ ] Order created with `menuVerseVendorId`
- [ ] Sync updates order from MenuVerse
- [ ] `menuVerseOrderId` gets populated
- [ ] Status mapping works correctly
- [ ] Rider info gets populated
- [ ] `lastSyncedAt` timestamp updates

### Webhook Testing
- [ ] Webhook updates order status
- [ ] Webhook updates rider info
- [ ] Webhook timestamp updates
- [ ] Changes visible in queries

### Bulk Operations
- [ ] Bulk sync finds all relevant orders
- [ ] All orders get synced
- [ ] No errors with multiple orders

### Error Handling
- [ ] Invalid order ID returns error
- [ ] Invalid vendor ID returns error
- [ ] Unauthorized requests rejected
- [ ] Missing required fields handled

---

## 🐛 Common Issues

### "Authentication required"
```json
{
  "errors": [{
    "message": "Authentication required"
  }]
}
```
**Fix:** Add Authorization header with valid token

### "Order not found"
```json
{
  "errors": [{
    "message": "Order not found"
  }]
}
```
**Fix:** Use correct order ID from your user's orders

### "Cannot read property 'uid' of undefined"
```json
{
  "errors": [{
    "message": "Cannot read property 'uid' of undefined"
  }]
}
```
**Fix:** Token expired, sign in again

---

## 📊 Expected Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED
                                                           ↘ CANCELLED
```

---

## 🎉 Success Criteria

✅ All mutations execute without errors
✅ Order status updates correctly
✅ MenuVerse fields populate
✅ Rider info displays
✅ Sync timestamps update
✅ Webhook integration works
✅ Bulk sync processes all orders

**If all above pass, the MenuVerse integration is working perfectly!** 🚀

---

*Last Updated: November 5, 2025*
*Feature Branch: feature/menuverse-order-sync-resolvers*
