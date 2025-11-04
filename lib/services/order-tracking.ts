import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, Unsubscribe } from 'firebase/firestore';
import { getFirebaseApp } from '../firebase/client';

export interface OrderStatus {
  status: string;
  timestamp: any;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface DeliveryTracking {
  currentStatus: string;
  deliveryStatus: string;
  estimatedDeliveryTime?: string;
  rider?: {
    name: string;
    phone: string;
    vehicleNumber?: string;
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
  };
  statusHistory: OrderStatus[];
}

export interface OrderDetails {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    variation?: string;
    addons?: string;
  }>;
  orderAmount: number;
  deliveryCharges: number;
  tipping: number;
  taxationAmount: number;
  paidAmount: number;
  paymentMethod: string;
  orderStatus: string;
  deliveryStatus?: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  instructions?: string;
  orderDate: string;
  createdAt: any;
  tracking?: DeliveryTracking;
}

export class OrderTrackingService {
  private static db = getFirestore(getFirebaseApp());

  /**
   * Subscribe to real-time order updates
   */
  static subscribeToOrder(
    orderId: string,
    onUpdate: (order: OrderDetails | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      // Try to find order in main orders collection
      const ordersRef = collection(this.db, 'orders');
      const q = query(ordersRef, where('orderId', '==', orderId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            console.log(`No order found with orderId: ${orderId}`);
            onUpdate(null);
            return;
          }

          const orderDoc = snapshot.docs[0];
          const data = orderDoc.data();

          const orderDetails: OrderDetails = {
            id: orderDoc.id,
            orderId: data.orderId || orderId,
            restaurantId: data.restaurantId || '',
            restaurantName: data.restaurantName || 'Restaurant',
            customer: {
              name: data.customer?.name || 'Customer',
              email: data.customer?.email || '',
              phone: data.customer?.phone || '',
              address: data.deliveryAddress || data.customer?.address || ''
            },
            items: (data.items || []).map((item: any) => ({
              id: item.id || Math.random().toString(),
              name: item.title || item.name || 'Item',
              quantity: item.quantity || 1,
              price: item.price || 0,
              variation: item.variation,
              addons: item.addons
            })),
            orderAmount: data.orderAmount || 0,
            deliveryCharges: data.deliveryCharges || 0,
            tipping: data.tipping || 0,
            taxationAmount: data.taxationAmount || 0,
            paidAmount: data.paidAmount || data.orderAmount || 0,
            paymentMethod: data.paymentMethod || 'CASH',
            orderStatus: data.orderStatus || 'PENDING',
            deliveryStatus: data.deliveryStatus || 'order_received',
            deliveryAddress: data.deliveryAddress || '',
            deliveryLatitude: data.deliveryLatitude,
            deliveryLongitude: data.deliveryLongitude,
            instructions: data.instructions,
            orderDate: data.orderDate || new Date().toISOString(),
            createdAt: data.createdAt,
            tracking: {
              currentStatus: data.orderStatus || 'PENDING',
              deliveryStatus: data.deliveryStatus || 'order_received',
              estimatedDeliveryTime: data.estimatedDeliveryTime,
              rider: data.rider,
              statusHistory: data.statusHistory || []
            }
          };

          console.log('Order update received:', orderDetails);
          onUpdate(orderDetails);
        },
        (error) => {
          console.error('Error subscribing to order:', error);
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Failed to subscribe to order:', error);
      if (onError) onError(error as Error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Subscribe to rider location updates
   */
  static subscribeToRiderLocation(
    orderId: string,
    onUpdate: (location: { latitude: number; longitude: number } | null) => void
  ): Unsubscribe {
    try {
      const riderRef = doc(this.db, 'rider_locations', orderId);

      return onSnapshot(
        riderRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            onUpdate(null);
            return;
          }

          const data = snapshot.data();
          if (data.latitude && data.longitude) {
            onUpdate({
              latitude: data.latitude,
              longitude: data.longitude
            });
          } else {
            onUpdate(null);
          }
        },
        (error) => {
          console.error('Error subscribing to rider location:', error);
          onUpdate(null);
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to rider location:', error);
      return () => {};
    }
  }

  /**
   * Get order status history
   */
  static async getOrderHistory(orderId: string): Promise<OrderStatus[]> {
    try {
      const historyRef = collection(this.db, 'orders', orderId, 'status_history');
      const q = query(historyRef, orderBy('timestamp', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        status: doc.data().status,
        timestamp: doc.data().timestamp,
        message: doc.data().message || '',
        location: doc.data().location
      }));
    } catch (error) {
      console.error('Failed to get order history:', error);
      return [];
    }
  }

  /**
   * Calculate estimated delivery time
   */
  static calculateEstimatedDelivery(orderStatus: string, deliveryStatus: string): string {
    const now = new Date();
    let minutesToAdd = 30; // Default

    switch (deliveryStatus) {
      case 'order_received':
        minutesToAdd = 35;
        break;
      case 'packaging':
        minutesToAdd = 30;
        break;
      case 'awaiting_dispatch':
        minutesToAdd = 25;
        break;
      case 'dispatch_arrived':
        minutesToAdd = 20;
        break;
      case 'dispatched':
        minutesToAdd = 15;
        break;
      case 'dispatch_otw':
        minutesToAdd = 10;
        break;
      case 'dispatch_arrived_location':
        minutesToAdd = 5;
        break;
      case 'delivered':
        return 'Delivered';
      default:
        minutesToAdd = 30;
    }

    const estimatedTime = new Date(now.getTime() + minutesToAdd * 60000);
    return estimatedTime.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  /**
   * Get friendly status message
   */
  static getStatusMessage(orderStatus: string, deliveryStatus: string): string {
    const statusMessages: Record<string, string> = {
      'order_received': '🎉 Your order has been received! The restaurant is preparing your food.',
      'packaging': '👨‍🍳 Your delicious meal is being prepared and packaged with care.',
      'awaiting_dispatch': '📦 Your order is ready and waiting for a delivery rider.',
      'dispatch_arrived': '🏍️ A delivery rider has arrived at the restaurant to pick up your order.',
      'dispatched': '🚚 Your order is on its way! The rider has picked it up.',
      'dispatch_otw': '🛣️ Your order is en route to your location.',
      'dispatch_arrived_location': '🏠 The delivery rider has arrived at your address!',
      'delivered': '✅ Your order has been delivered. Enjoy your meal!'
    };

    return statusMessages[deliveryStatus] || 'Processing your order...';
  }

  /**
   * Get delivery progress percentage
   */
  static getProgressPercentage(deliveryStatus: string): number {
    const statusProgress: Record<string, number> = {
      'order_received': 12,
      'packaging': 25,
      'awaiting_dispatch': 37,
      'dispatch_arrived': 50,
      'dispatched': 62,
      'dispatch_otw': 75,
      'dispatch_arrived_location': 87,
      'delivered': 100
    };

    return statusProgress[deliveryStatus] || 0;
  }
}

export default OrderTrackingService;
