# Quick Start: Testing Order Status Sync

## 1. Get Your Test IDs

### Find Vendor UID (MenuVerse)
1. Open MenuVerse app
2. Go to Dashboard
3. Open browser console (F12)
4. Look for log: `🆔 UID: ...`
5. Copy the UID

### Find Customer UID (ChopChop)
1. Open ChopChop app
2. Sign in as a customer
3. Open browser console (F12)
4. Run: `firebase.auth().currentUser.uid`
5. Copy the UID

## 2. Configure Test Script

Edit `test-order-status-sync.js`:

```javascript
const TEST_VENDOR_ID = 'paste-vendor-uid-here';
const TEST_CUSTOMER_ID = 'paste-customer-uid-here';
```

## 3. Set Up Firebase Admin (One-time)

### Option A: Service Account (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save file as `firebase-service-account.json` in project root
6. Add to `.gitignore` (already included)

### Option B: Use Default Credentials
If running in Firebase environment, skip service account setup.

## 4. Install Dependencies

```bash
npm install firebase-admin
```

## 5. Run Test

```bash
# Run test (keeps test data for inspection)
node test-order-status-sync.js

# Run test and auto-cleanup
node test-order-status-sync.js --cleanup
```

## 6. What to Expect

✅ **Success:** You'll see green checkmarks and status progression  
❌ **Failure:** Red X marks with error details  

### Success Output Example:
```
✅ Vendor order created: eateries/abc123/orders/test-order-1234
✅ Customer order created: customer-orders/xyz789
✅ Status sync verified! Vendor and customer orders match.
📋 Status History (4 entries):
   1. Pending - Order placed
   2. Confirmed - Updated by test script
   3. Preparing - Updated by test script
   4. Out for Delivery - Updated by test script
```

## 7. Verify in Firebase Console

After running test, check:

1. **Vendor Orders:**  
   `eateries/{vendorId}/orders/{testOrderId}`

2. **Customer Orders:**  
   `customer-orders` (find by orderId or customerId)

3. **Notifications:**  
   `users/{customerId}/notifications`

## 8. Integration with ChopChop

Once verified, ChopChop can display notifications:

```typescript
// Add to ChopChop app
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

function OrdersPage() {
  const { user } = useAuth();
  const notifications = useOrderNotifications(user.uid);
  
  return (
    <div>
      {notifications.map(notif => (
        <NotificationCard key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

## Troubleshooting

### "Service account not found"
→ Create `firebase-service-account.json` (see Option A above)

### "Vendor order not found"
→ Check TEST_VENDOR_ID is correct and user exists

### "No matching customer order found"
→ Verify customer order has correct `orderId` and `customerId` fields

### "Permission denied"
→ Check Firestore security rules allow writes

## Next Steps

✅ Test passes? Ready to use in production!  
❌ Test fails? Check [ORDER_STATUS_SYNC.md](./ORDER_STATUS_SYNC.md) for detailed troubleshooting

## Need Help?

- Check detailed logs in console
- Review `docs/ORDER_STATUS_SYNC.md` for architecture details
- Verify Firestore security rules
- Ensure Firebase Admin SDK is properly initialized
