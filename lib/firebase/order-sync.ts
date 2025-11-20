// Customer Order Synchronization System
// Ensures vendor status updates are visible to customers

import { 
  getFirestore, 
  doc, 
  updateDoc, 
  setDoc, 
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { getFirebaseApp } from './client';

const db = getFirestore(getFirebaseApp());

export interface CustomerOrder {
  id: string;
  orderId: string; // ChopChop order ID
  customerId: string; // Customer identifier (email or uid)
  vendorId: string; // Vendor UID
  restaurantId: number; // Restaurant ID
  restaurantName: string;
  customer: {
    name: string;
    email: string;
    address: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Canceled';
  paymentMethod: string;
  createdAt: any;
  updatedAt: any;
  estimatedDeliveryTime?: string;
  trackingUpdates: Array<{
    status: string;
    timestamp: any;
    message: string;
    location?: string;
  }>;
}

export class OrderSyncService {
  /**
   * Save order to customer orders collection for tracking
   * Called when placing a new order
   */
  static async saveCustomerOrder(orderData: {
    orderId: string;
    customerId: string;
    vendorId: string;
    restaurantId: number;
    restaurantName: string;
    customer: CustomerOrder['customer'];
    items: CustomerOrder['items'];
    totalAmount: number;
    status: CustomerOrder['status'];
    paymentMethod: string;
  }): Promise<string | null> {
    try {
      const customerOrderData: Omit<CustomerOrder, 'id'> = {
        orderId: orderData.orderId,
        customerId: orderData.customerId,
        vendorId: orderData.vendorId,
        restaurantId: orderData.restaurantId,
        restaurantName: orderData.restaurantName,
        customer: orderData.customer,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        paymentMethod: orderData.paymentMethod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        trackingUpdates: [
          {
            status: orderData.status,
            timestamp: serverTimestamp(),
            message: `Order ${orderData.status.toLowerCase()} by restaurant`,
            location: orderData.restaurantName
          }
        ]
      };

      // Save to customer orders collection
      const customerOrderRef = await addDoc(
        collection(db, 'customer-orders'), 
        customerOrderData
      );

      console.log(`✅ Customer order saved: customer-orders/${customerOrderRef.id}`);
      return customerOrderRef.id;

    } catch (error) {
      console.error('❌ Failed to save customer order:', error);
      return null;
    }
  }

  /**
   * Update customer order status when vendor makes changes
   * Called from MenuVerse when vendor updates order status
   * 
   * This method implements the webhook handler pattern documented in
   * docs/API-INTEGRATION.md - MenuVerse Order Update Webhook
   */
  static async syncStatusToCustomer(
    vendorOrderId: string,
    newStatus: CustomerOrder['status'],
    vendorId: string,
    message?: string,
    riderInfo?: {
      name: string;
      phone: string;
      vehicle?: string;
      plateNumber?: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`🔄 Syncing status to customer: ${newStatus} for vendor order ${vendorOrderId}`);
      
      // ✅ FIXED: Implement proper customer order lookup
      // Query customer-orders collection by orderId field
      const customerOrdersRef = collection(db, 'customer-orders');
      const q = query(
        customerOrdersRef,
        where('orderId', '==', vendorOrderId),
        where('vendorId', '==', vendorId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.warn(`⚠️ No customer order found for vendor order ${vendorOrderId}`);
        return false;
      }
      
      // Update all matching customer orders (should be only one)
      const updates = snapshot.docs.map(async (docSnapshot) => {
        const orderRef = doc(db, 'customer-orders', docSnapshot.id);
        
        // Map MenuVerse status to customer-friendly delivery status
        const deliveryStatusMap: Record<string, string> = {
          'Pending': 'order_received',
          'Confirmed': 'packaging',
          'Preparing': 'packaging',
          'Out for Delivery': 'dispatched',
          'Delivered': 'delivered',
          'Canceled': 'order_received'
        };
        
        const deliveryStatus = deliveryStatusMap[newStatus] || 'order_received';
        
        // Prepare tracking update
        const trackingUpdate = {
          status: deliveryStatus,
          timestamp: serverTimestamp(),
          message: message || `Order ${newStatus.toLowerCase()}`,
          location: riderInfo ? `Rider: ${riderInfo.name}` : undefined
        };
        
        // Get existing tracking updates
        const currentData = docSnapshot.data();
        const existingUpdates = currentData.trackingUpdates || [];
        
        // Update order with new status and tracking
        await updateDoc(orderRef, {
          status: newStatus,
          deliveryStatus: deliveryStatus,
          updatedAt: serverTimestamp(),
          trackingUpdates: [...existingUpdates, trackingUpdate],
          ...(riderInfo && {
            rider: {
              name: riderInfo.name,
              phone: riderInfo.phone,
              vehicle: riderInfo.vehicle || 'Motorcycle',
              plateNumber: riderInfo.plateNumber || 'N/A'
            }
          })
        });
        
        console.log(`✅ Customer order ${docSnapshot.id} synced to status: ${newStatus}`);
        return true;
      });
      
      await Promise.all(updates);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to sync status to customer:', error);
      return false;
    }
  }

  /**
   * Add tracking update to customer order
   * 
   * This method properly retrieves existing updates and appends new ones
   * following the documented pattern in docs/API-INTEGRATION.md
   */
  static async addTrackingUpdate(
    customerOrderId: string,
    update: {
      status: string;
      message: string;
      location?: string;
    }
  ): Promise<boolean> {
    try {
      const orderRef = doc(db, 'customer-orders', customerOrderId);
      
      // ✅ FIXED: Get existing updates and append
      // First, get the current order data
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        console.error(`❌ Order not found: ${customerOrderId}`);
        return false;
      }
      
      const currentData = orderDoc.data();
      const existingUpdates = currentData.trackingUpdates || [];
      
      // Create new tracking update
      const newUpdate = {
        status: update.status,
        timestamp: serverTimestamp(),
        message: update.message,
        location: update.location
      };
      
      // Append to existing updates
      await updateDoc(orderRef, {
        updatedAt: serverTimestamp(),
        trackingUpdates: [...existingUpdates, newUpdate]
      });

      console.log(`✅ Tracking update added to customer order: ${customerOrderId}`);
      console.log(`   Total updates: ${existingUpdates.length + 1}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to add tracking update:', error);
      return false;
    }
  }

  /**
   * Get customer order by ChopChop order ID
   * Utility method for looking up customer orders
   */
  static async getCustomerOrderByOrderId(orderId: string): Promise<string | null> {
    try {
      const customerOrdersRef = collection(db, 'customer-orders');
      const q = query(customerOrdersRef, where('orderId', '==', orderId));
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Return the first matching document ID
      return snapshot.docs[0].id;
      
    } catch (error) {
      console.error('❌ Failed to get customer order:', error);
      return null;
    }
  }
}