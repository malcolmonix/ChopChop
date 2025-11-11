/**
 * Order Service
 * 
 * Centralized service for all order-related operations following industry standards:
 * - Single Responsibility Principle
 * - Proper error handling with typed errors
 * - Consistent data transformation
 * - Proper sorting and filtering
 * - Caching support
 * - Type safety
 */

import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  limit
} from 'firebase/firestore';
import { getFirebaseApp } from '../firebase/client';

// Types
export interface Order {
  id: string;
  orderId: string;
  eateryId: string;
  eateryName: string;
  restaurantId?: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentMethod: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  estimatedDeliveryTime?: string;
  trackingUpdates: TrackingUpdate[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Canceled';

export type DeliveryStatus = 'order_received' | 'packaging' | 'awaiting_dispatch' | 'dispatch_arrived' | 'dispatched' | 'dispatch_otw' | 'dispatch_arrived_location' | 'delivered';

export interface TrackingUpdate {
  status: string;
  timestamp: Timestamp | Date;
  message: string;
  location?: string;
}

export interface OrderFilters {
  status?: OrderStatus[];
  customerId?: string;
  customerEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

export type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'status';

// Error types
export class OrderServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

/**
 * Order Service Class
 * Handles all order-related operations with Firebase
 */
export class OrderService {
  private static instance: OrderService;
  private db: ReturnType<typeof getFirestore>;
  private cache: Map<string, { data: Order[], timestamp: number }> = new Map();
  private cacheTimeout = 30000; // 30 seconds

  private constructor() {
    this.db = getFirestore(getFirebaseApp());
  }

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  /**
   * Get orders for a customer with filters and sorting
   * 
   * @param filters - Filters to apply (customer email, status, date range)
   * @param sortBy - Sort option (newest, oldest, amount-high, amount-low, status)
   * @param useCache - Whether to use cached data
   * @returns Promise<Order[]>
   */
  async getOrders(
    filters: OrderFilters = {},
    sortBy: SortOption = 'newest',
    useCache: boolean = true
  ): Promise<Order[]> {
    try {
      // Check cache
      const cacheKey = JSON.stringify({ filters, sortBy });
      if (useCache && this.isCacheValid(cacheKey)) {
        console.log('📦 Returning cached orders');
        return this.cache.get(cacheKey)!.data;
      }

      console.log('🔄 Fetching orders from Firebase with filters:', filters);

      // Build query
      const ordersRef = collection(this.db, 'customer-orders');
      let q = query(ordersRef);

      // Apply filters
      if (filters.customerEmail) {
        q = query(q, where('customer.email', '==', filters.customerEmail));
      }

      if (filters.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      // Apply sorting
      const sortField = this.getSortField(sortBy);
      const sortDirection = this.getSortDirection(sortBy);
      q = query(q, orderBy(sortField, sortDirection));

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      // Execute query
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('📭 No orders found');
        return [];
      }

      // Transform documents to orders
      const orders = snapshot.docs.map(doc => this.transformDocument(doc));

      // Apply client-side date filtering (if needed)
      let filteredOrders = orders;
      if (filters.dateFrom || filters.dateTo) {
        filteredOrders = this.filterByDateRange(orders, filters.dateFrom, filters.dateTo);
      }

      // Sort client-side for custom sorting options
      const sortedOrders = this.sortOrders(filteredOrders, sortBy);

      console.log(`✅ Found ${sortedOrders.length} orders`);

      // Update cache
      this.cache.set(cacheKey, {
        data: sortedOrders,
        timestamp: Date.now()
      });

      return sortedOrders;

    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      throw new OrderServiceError(
        'Failed to fetch orders',
        'FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      console.log(`🔍 Fetching order: ${orderId}`);
      
      const orderRef = doc(this.db, 'customer-orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        console.log('❌ Order not found');
        return null;
      }

      const order = this.transformDocument(orderDoc);
      console.log('✅ Order found');

      return order;

    } catch (error) {
      console.error('❌ Error fetching order:', error);
      throw new OrderServiceError(
        'Failed to fetch order',
        'FETCH_SINGLE_ERROR',
        error
      );
    }
  }

  /**
   * Get orders grouped by status
   */
  async getOrdersByStatus(customerEmail: string): Promise<Record<OrderStatus, Order[]>> {
    try {
      const allOrders = await this.getOrders({ customerEmail }, 'newest', false);

      const grouped: Record<OrderStatus, Order[]> = {
        'Pending': [],
        'Confirmed': [],
        'Preparing': [],
        'Out for Delivery': [],
        'Delivered': [],
        'Canceled': []
      };

      allOrders.forEach(order => {
        grouped[order.status].push(order);
      });

      return grouped;

    } catch (error) {
      throw new OrderServiceError(
        'Failed to group orders by status',
        'GROUP_BY_STATUS_ERROR',
        error
      );
    }
  }

  /**
   * Get active orders (not delivered or canceled)
   */
  async getActiveOrders(customerEmail: string): Promise<Order[]> {
    return this.getOrders(
      {
        customerEmail,
        status: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery']
      },
      'newest',
      false
    );
  }

  /**
   * Get completed orders (delivered or canceled)
   */
  async getCompletedOrders(customerEmail: string): Promise<Order[]> {
    return this.getOrders(
      {
        customerEmail,
        status: ['Delivered', 'Canceled']
      },
      'newest',
      false
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Cache cleared');
  }

  /**
   * Transform Firestore document to Order object
   */
  private transformDocument(doc: DocumentSnapshot): Order {
    const data = doc.data();
    if (!data) {
      throw new OrderServiceError('Document has no data', 'INVALID_DOCUMENT');
    }

    // Map API status to friendly status
    const status = this.mapStatus(data.status || data.orderStatus || 'PENDING');

    return {
      id: doc.id,
      orderId: data.orderId || doc.id,
      eateryId: data.eateryId || data.restaurantId || '',
      eateryName: data.eateryName || data.restaurantName || 'Restaurant',
      restaurantId: data.restaurantId,
      customer: {
        name: data.customer?.name || '',
        phone: data.customer?.phone || '',
        email: data.customer?.email || '',
        address: data.customer?.address || data.deliveryAddress || ''
      },
      items: (data.items || []).map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        name: item.name || item.title || 'Item',
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      totalAmount: Number(data.totalAmount || data.paidAmount || data.orderAmount || 0),
      status,
      deliveryStatus: this.mapDeliveryStatus(status),
      paymentMethod: data.paymentMethod || 'Cash on Delivery',
      createdAt: data.createdAt || Timestamp.now(),
      updatedAt: data.updatedAt,
      estimatedDeliveryTime: data.estimatedDeliveryTime,
      trackingUpdates: data.trackingUpdates || []
    };
  }

  /**
   * Map API status to friendly status
   */
  private mapStatus(apiStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'PENDING': 'Pending',
      'PENDING_PAYMENT': 'Pending',
      'CONFIRMED': 'Confirmed',
      'ACCEPTED': 'Confirmed',
      'PROCESSING': 'Preparing',
      'PREPARING': 'Preparing',
      'READY': 'Preparing',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DISPATCHED': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'COMPLETED': 'Delivered',
      'CANCELLED': 'Canceled',
      'CANCELED': 'Canceled'
    };

    return statusMap[apiStatus.toUpperCase()] || 'Pending';
  }

  /**
   * Map friendly status to delivery status
   */
  private mapDeliveryStatus(status: OrderStatus): DeliveryStatus {
    const deliveryStatusMap: Record<OrderStatus, DeliveryStatus> = {
      'Pending': 'order_received',
      'Confirmed': 'awaiting_dispatch',
      'Preparing': 'packaging',
      'Out for Delivery': 'dispatch_otw',
      'Delivered': 'delivered',
      'Canceled': 'order_received'
    };

    return deliveryStatusMap[status] || 'order_received';
  }

  /**
   * Get sort field for Firebase query
   */
  private getSortField(sortBy: SortOption): string {
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        return 'createdAt';
      case 'amount-high':
      case 'amount-low':
        return 'totalAmount';
      case 'status':
        return 'status';
      default:
        return 'createdAt';
    }
  }

  /**
   * Get sort direction for Firebase query
   */
  private getSortDirection(sortBy: SortOption): 'asc' | 'desc' {
    switch (sortBy) {
      case 'newest':
      case 'amount-high':
        return 'desc';
      case 'oldest':
      case 'amount-low':
      case 'status':
        return 'asc';
      default:
        return 'desc';
    }
  }

  /**
   * Sort orders client-side
   */
  private sortOrders(orders: Order[], sortBy: SortOption): Order[] {
    const sorted = [...orders];

    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeB - timeA; // Newest first
        });
        break;

      case 'oldest':
        sorted.sort((a, b) => {
          const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return timeA - timeB; // Oldest first
        });
        break;

      case 'amount-high':
        sorted.sort((a, b) => b.totalAmount - a.totalAmount);
        break;

      case 'amount-low':
        sorted.sort((a, b) => a.totalAmount - b.totalAmount);
        break;

      case 'status':
        const statusOrder: Record<OrderStatus, number> = {
          'Pending': 1,
          'Confirmed': 2,
          'Preparing': 3,
          'Out for Delivery': 4,
          'Delivered': 5,
          'Canceled': 6
        };
        sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }

    return sorted;
  }

  /**
   * Filter orders by date range
   */
  private filterByDateRange(orders: Order[], dateFrom?: Date, dateTo?: Date): Order[] {
    return orders.filter(order => {
      const orderDate = order.createdAt instanceof Timestamp 
        ? order.createdAt.toDate() 
        : new Date(order.createdAt);

      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;

      return true;
    });
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < this.cacheTimeout;
  }
}

// Export singleton instance
export const orderService = OrderService.getInstance();
