# Order Status Sync Testing

## Overview

This document explains how to test the order status synchronization between MenuVerse (vendor app) and ChopChop (customer app).

## Features Implemented

### 1. ✅ Detailed Logging
- **Status update timing**: Tracks duration of each status update operation
- **Step-by-step logging**: Shows each phase of the sync process
- **Error context**: Provides detailed error information with context
- **Customer lookup**: Logs customer ID resolution and query results
- **Notification tracking**: Logs notification creation and delivery

**Example logs:**
```
🔄 Starting status update for order abc123 to "Confirmed"
🔥 Using Firestore to update order abc123
✅ Vendor order updated in Firestore: abc123
🔄 Syncing status to ChopChop customer orders...
🔍 Looking up vendor order: eateries/vendor-uid/orders/abc123
👤 Found customerId: customer-uid, searching customer-orders...
📦 Found 1 matching customer order(s)
✍️ Updating customer order xyz789 with status: Confirmed
✅ Successfully synced status "Confirmed" to 1 customer order(s)
🔔 Preparing notification for customer customer-uid
✅ Notification sent to customer customer-uid for order abc123
✅ Status update completed in 245ms
```

### 2. ✅ Push Notifications to ChopChop Users

When a vendor updates an order status, ChopChop customers automatically receive:

**Notification Document** (`users/{customerId}/notifications`)
```json
{
  "type": "order_status_update",
  "orderId": "abc123",
  "title": "Order Status: Confirmed",
  "message": "Your order has been confirmed!",
  "orderStatus": "Confirmed",
  "restaurantName": "Test Restaurant",
  "createdAt": "2025-11-04T10:30:00Z",
  "read": false,
  "priority": "high"
}
```

**Status Messages:**
- `Pending` → "Your order is pending confirmation"
- `Confirmed` → "Your order has been confirmed!"
- `Preparing` → "Your order is being prepared"
- `Out for Delivery` → "Your order is out for delivery!" (High priority)
- `Delivered` → "Your order has been delivered"
- `Canceled` → "Your order has been canceled"

**Priority Levels:**
- `high`: Out for Delivery (time-sensitive)
- `normal`: All other statuses

### 3. ✅ Test Utility

The test script (`test-order-status-sync.js`) verifies the complete sync flow.

## Running the Test

### Prerequisites

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Set up Firebase credentials:
   - Download service account key from Firebase Console
   - Save as `firebase-service-account.json` in project root
   - OR use default credentials if running in Firebase environment

### Configuration

Edit `test-order-status-sync.js` and update:

```javascript
const TEST_VENDOR_ID = 'your-vendor-uid';      // Replace with actual vendor UID
const TEST_CUSTOMER_ID = 'your-customer-uid';  // Replace with actual customer UID
```

### Run Test

```bash
# Run test and keep test data for inspection
node test-order-status-sync.js

# Run test and cleanup test data afterward
node test-order-status-sync.js --cleanup
```

### Test Flow

The script will:

1. **Create Test Orders**
   - Creates a vendor order in `eateries/{vendorId}/orders`
   - Creates a matching customer order in `customer-orders`

2. **Verify Initial State**
   - Confirms both orders exist
   - Verifies initial status is "Pending"

3. **Simulate Status Updates**
   - Updates status through the progression:
     - Pending → Confirmed
     - Confirmed → Preparing
     - Preparing → Out for Delivery
     - Out for Delivery → Delivered
   - Verifies sync after each update
   - Checks status history is maintained

4. **Display Results**
   - Shows status history with timestamps
   - Confirms vendor and customer orders match
   - Reports success or failure

### Expected Output

```
🧪 Starting Order Status Sync Test

============================================================
📝 Creating test vendor order...
✅ Vendor order created: eateries/test-vendor-uid/orders/test-order-1699084800000

📝 Creating test customer order...
✅ Customer order created: customer-orders/abc123xyz

📊 Initial State:
🔍 Verifying sync...
📦 Vendor order status: Pending
📦 Customer order status: Pending
✅ Status sync verified! Vendor and customer orders match.

🔄 Simulating status update to "Confirmed"...
✅ Vendor order status updated to "Confirmed"
✅ Customer order status synced to "Confirmed"
🔍 Verifying sync...
✅ Status sync verified! Vendor and customer orders match.

[... continues for each status ...]

============================================================
✅ All tests passed! Status sync is working correctly.

💡 Tip: Run with --cleanup flag to remove test data
   Test Order ID: test-order-1699084800000
```

## Integration with ChopChop

### Reading Notifications

ChopChop can listen to notifications in real-time:

```typescript
// In ChopChop app
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function useOrderNotifications(userId: string) {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const notificationsRef = collection(firestore, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      where('type', '==', 'order_status_update'),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
      
      // Show toast/alert for new notifications
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const notification = change.doc.data();
          showNotificationToast(notification.title, notification.message);
        }
      });
    });
    
    return unsubscribe;
  }, [userId]);
  
  return notifications;
}
```

### Marking Notifications as Read

```typescript
async function markNotificationAsRead(userId: string, notificationId: string) {
  const notificationRef = doc(firestore, 'users', userId, 'notifications', notificationId);
  await updateDoc(notificationRef, { read: true });
}
```

## Database Structure

### Vendor Orders
```
eateries/{vendorId}/orders/{orderId}
  - orderId: string
  - customerId: string
  - customer: object
  - status: string
  - items: array
  - totalAmount: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Customer Orders
```
customer-orders/{docId}
  - customerId: string
  - orderId: string (reference to vendor order)
  - restaurantId: string
  - restaurantName: string
  - orderStatus: string
  - items: array
  - totalAmount: number
  - createdAt: timestamp
  - updatedAt: timestamp
  - statusHistory: array
    - status: string
    - timestamp: timestamp
    - note: string
```

### Notifications
```
users/{customerId}/notifications/{notificationId}
  - type: "order_status_update"
  - orderId: string
  - title: string
  - message: string
  - orderStatus: string
  - restaurantName: string
  - createdAt: timestamp
  - read: boolean
  - priority: "high" | "normal"
```

## Troubleshooting

### Test Fails to Find Customer Order

**Symptom:** `⚠️ No matching customer order found`

**Solutions:**
1. Verify `customerId` is correctly set in vendor order
2. Check that `orderId` in customer-orders matches vendor order ID
3. Ensure Firestore indexes exist for the query

### Notifications Not Appearing

**Symptom:** Status updates work but no notifications created

**Solutions:**
1. Check console logs for notification errors
2. Verify `customerId` exists and is valid
3. Ensure user has a document in `users` collection
4. Check Firestore security rules allow writes to notifications

### Status History Not Updating

**Symptom:** Status updates but history doesn't grow

**Solutions:**
1. Verify batch commit is successful
2. Check that `statusHistory` field exists (will be created if missing)
3. Review console logs for batch write errors

## Future Enhancements

### FCM Push Notifications

To send actual mobile push notifications:

1. Set up Firebase Cloud Messaging (FCM) in Firebase Console
2. Store device tokens in user documents
3. Create a Cloud Function to send FCM messages:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const sendOrderStatusNotification = functions.firestore
  .document('users/{userId}/notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const userId = context.params.userId;
    
    // Get user's FCM token
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    const fcmToken = userDoc.data()?.fcmToken;
    
    if (!fcmToken) return;
    
    // Send FCM notification
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.message
      },
      data: {
        orderId: notification.orderId,
        status: notification.orderStatus,
        type: 'order_status_update'
      }
    };
    
    await admin.messaging().send(message);
  });
```

## Security Rules

Ensure Firestore security rules allow:

```javascript
// Vendors can update their orders
match /eateries/{vendorId}/orders/{orderId} {
  allow write: if request.auth.uid == vendorId;
}

// System can write customer orders (via Admin SDK)
match /customer-orders/{orderId} {
  allow write: if request.auth != null;
  allow read: if request.auth.uid == resource.data.customerId;
}

// System can write notifications (via Admin SDK)
match /users/{userId}/notifications/{notificationId} {
  allow read, update: if request.auth.uid == userId;
  allow write: if request.auth != null; // Allow system writes
}
```

## Summary

The order status sync system now includes:

✅ **Detailed logging** for debugging and monitoring  
✅ **Push notifications** to ChopChop users on status changes  
✅ **Comprehensive test utility** to verify the sync flow  
✅ **Status history tracking** for audit trail  
✅ **Priority-based notifications** for time-sensitive updates  

This ensures MenuVerse vendors can update order statuses, and ChopChop customers are immediately notified and can track their orders in real-time.
