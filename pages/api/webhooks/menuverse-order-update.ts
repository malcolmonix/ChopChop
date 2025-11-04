import type { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore, doc, updateDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
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

type OrderStatusUpdate = {
  orderId: string;
  status: string;
  restaurantId?: string;
  restaurantName?: string;
  timestamp?: string;
  riderInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify API key for security
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    const validApiKey = process.env.MENUVERSE_WEBHOOK_API_KEY || process.env.NEXT_PUBLIC_MENUVERSE_API_KEY;
    
    if (!apiKey || apiKey !== validApiKey) {
      console.log('❌ Invalid API key for webhook');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const update: OrderStatusUpdate = req.body;

    if (!update.orderId || !update.status) {
      return res.status(400).json({ error: 'Missing required fields: orderId, status' });
    }

    console.log('📥 MenuVerse webhook received:', update);

    const app = getFirebaseApp();
    const db = getFirestore(app);
    const orderRef = doc(db, 'orders', update.orderId);

    // Get existing order
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      console.log('⚠️ Order not found in Firebase, creating new record');
      // Create new order record if it doesn't exist
      await setDoc(orderRef, {
        orderId: update.orderId,
        status: update.status,
        deliveryStatus: STATUS_MAP[update.status] || 'order_received',
        eateryId: update.restaurantId || '',
        eateryName: update.restaurantName || '',
        updatedAt: Timestamp.now(),
        trackingUpdates: [
          {
            status: STATUS_MAP[update.status] || 'order_received',
            timestamp: Timestamp.now(),
            message: `Order status: ${update.status}`,
          }
        ],
        ...(update.riderInfo && { riderInfo: update.riderInfo }),
      });
    } else {
      // Update existing order
      const orderData = orderSnap.data();
      const deliveryStatus = STATUS_MAP[update.status] || orderData.deliveryStatus || 'order_received';
      
      // Add new tracking update
      const trackingUpdates = orderData.trackingUpdates || [];
      trackingUpdates.push({
        status: deliveryStatus,
        timestamp: Timestamp.now(),
        message: getStatusMessage(update.status, deliveryStatus),
      });

      const updateData: any = {
        status: update.status,
        deliveryStatus,
        updatedAt: Timestamp.now(),
        trackingUpdates,
      };

      // Update rider info if provided
      if (update.riderInfo) {
        updateData.riderInfo = update.riderInfo;
      }

      // Update restaurant info if provided
      if (update.restaurantId) {
        updateData.eateryId = update.restaurantId;
      }
      if (update.restaurantName) {
        updateData.eateryName = update.restaurantName;
      }

      await updateDoc(orderRef, updateData);
    }

    console.log('✅ Order status updated in Firebase:', {
      orderId: update.orderId,
      status: update.status,
      deliveryStatus: STATUS_MAP[update.status],
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Order status updated',
      orderId: update.orderId,
      deliveryStatus: STATUS_MAP[update.status],
    });

  } catch (error: any) {
    console.error('❌ Error updating order status:', error);
    return res.status(500).json({ 
      error: 'Failed to update order status',
      details: error.message,
    });
  }
}

function getStatusMessage(status: string, deliveryStatus: string): string {
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

  return messages[deliveryStatus] || `Order status: ${status}`;
}
