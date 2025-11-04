import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc, getDoc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase/client';

// Status mapping from MenuVerse to our delivery tracking system
const STATUS_MAP: Record<string, string> = {
  'PENDING': 'order_received',
  'PENDING_PAYMENT': 'order_received',
  'CONFIRMED': 'packaging',
  'PROCESSING': 'packaging',
  'READY': 'awaiting_dispatch',
  'OUT_FOR_DELIVERY': 'dispatched',
  'DELIVERED': 'delivered',
  'CANCELLED': 'order_received',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, userId } = req.query;

    console.log('🔄 Syncing orders from MenuVerse to Firebase...');

    const app = getFirebaseApp();
    const db = getFirestore(app);

    // If specific orderId provided, sync just that order
    if (orderId && typeof orderId === 'string') {
      await syncSingleOrder(db, orderId);
      return res.status(200).json({ success: true, message: 'Order synced', orderId });
    }

    // If userId provided, sync all orders for that user
    if (userId && typeof userId === 'string') {
      const syncedCount = await syncUserOrders(db, userId);
      return res.status(200).json({ success: true, message: 'Orders synced', count: syncedCount });
    }

    // Otherwise sync recent orders
    const syncedCount = await syncRecentOrders(db);
    return res.status(200).json({ success: true, message: 'Recent orders synced', count: syncedCount });

  } catch (error: any) {
    console.error('❌ Error syncing orders:', error);
    return res.status(500).json({ 
      error: 'Failed to sync orders',
      details: error.message,
    });
  }
}

async function syncSingleOrder(db: any, orderId: string) {
  try {
    // Fetch order from MenuVerse API
    const menuverseApiUrl = process.env.NEXT_PUBLIC_MENUVERSE_API_URL || 'http://localhost:4000';
    const response = await fetch(`${menuverseApiUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetOrder($id: ID!) {
            order(id: $id) {
              id
              status
              restaurant { id name }
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id: orderId },
      }),
    });

    const data = await response.json();
    if (data.data?.order) {
      await updateOrderInFirebase(db, data.data.order);
    }
  } catch (error) {
    console.error(`Failed to sync order ${orderId}:`, error);
  }
}

async function syncUserOrders(db: any, userId: string) {
  // Get all orders for this user from Firebase
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  let syncedCount = 0;
  for (const docSnap of snapshot.docs) {
    const orderData = docSnap.data();
    await syncSingleOrder(db, orderData.orderId);
    syncedCount++;
  }

  return syncedCount;
}

async function syncRecentOrders(db: any) {
  // Get orders from last 24 hours from Firebase
  const ordersRef = collection(db, 'orders');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const q = query(ordersRef, where('createdAt', '>=', Timestamp.fromDate(yesterday)));
  const snapshot = await getDocs(q);

  let syncedCount = 0;
  for (const docSnap of snapshot.docs) {
    const orderData = docSnap.data();
    await syncSingleOrder(db, orderData.orderId);
    syncedCount++;
  }

  return syncedCount;
}

async function updateOrderInFirebase(db: any, menuverseOrder: any) {
  const orderRef = doc(db, 'orders', menuverseOrder.id);
  const orderSnap = await getDoc(orderRef);

  const deliveryStatus = STATUS_MAP[menuverseOrder.status] || 'order_received';

  if (!orderSnap.exists()) {
    // Create new order
    await setDoc(orderRef, {
      orderId: menuverseOrder.id,
      status: menuverseOrder.status,
      deliveryStatus,
      eateryId: menuverseOrder.restaurant?.id || '',
      eateryName: menuverseOrder.restaurant?.name || '',
      createdAt: menuverseOrder.createdAt ? Timestamp.fromDate(new Date(menuverseOrder.createdAt)) : Timestamp.now(),
      updatedAt: Timestamp.now(),
      trackingUpdates: [
        {
          status: deliveryStatus,
          timestamp: Timestamp.now(),
          message: getStatusMessage(deliveryStatus),
        }
      ],
    });
  } else {
    // Update existing order if status changed
    const existingData = orderSnap.data();
    if (existingData.status !== menuverseOrder.status) {
      const trackingUpdates = existingData.trackingUpdates || [];
      trackingUpdates.push({
        status: deliveryStatus,
        timestamp: Timestamp.now(),
        message: getStatusMessage(deliveryStatus),
      });

      await updateDoc(orderRef, {
        status: menuverseOrder.status,
        deliveryStatus,
        updatedAt: Timestamp.now(),
        trackingUpdates,
      });

      console.log(`✅ Updated order ${menuverseOrder.id} status: ${menuverseOrder.status} -> ${deliveryStatus}`);
    }
  }
}

function getStatusMessage(deliveryStatus: string): string {
  const messages: Record<string, string> = {
    'order_received': 'Restaurant has received your order',
    'packaging': 'Your food is being prepared and packaged',
    'awaiting_dispatch': 'Order is ready and waiting for pickup',
    'dispatch_arrived': 'Delivery rider has arrived at restaurant',
    'dispatched': 'Order has been picked up by delivery rider',
    'dispatch_otw': 'Delivery rider is heading to your location',
    'dispatch_arrived_location': 'Delivery rider has arrived at your address',
    'delivered': 'Order has been successfully delivered',
  };

  return messages[deliveryStatus] || `Order status updated`;
}
