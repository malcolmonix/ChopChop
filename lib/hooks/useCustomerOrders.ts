// ChopChop Customer Order Tracking Hook
// Allows customers to see real-time order status updates

import { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { getFirebaseApp } from '../firebase/client';
import type { CustomerOrder } from '../firebase/order-sync';

const db = getFirestore(getFirebaseApp());

export function useCustomerOrders(customerId?: string) {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    console.log('🔍 Setting up customer orders listener for:', customerId);

    try {
      // Query customer orders collection
      const ordersQuery = query(
        collection(db, 'customer-orders'),
        where('customerId', '==', customerId),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          console.log('📦 Customer orders snapshot received:', snapshot.size, 'orders');
          
          const customerOrders: CustomerOrder[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as Omit<CustomerOrder, 'id'>;
            customerOrders.push({
              ...data,
              id: doc.id
            });
          });

          setOrders(customerOrders);
          setLoading(false);
          setError(null);
          
          console.log('✅ Customer orders updated:', customerOrders.length);
        },
        (err) => {
          console.error('❌ Customer orders listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('🔌 Cleaning up customer orders listener');
        unsubscribe();
      };

    } catch (err) {
      console.error('❌ Failed to set up customer orders listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [customerId]);

  return { orders, loading, error };
}

export function useCustomerOrderTracking(orderId: string) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    console.log('🔍 Setting up order tracking for:', orderId);

    try {
      // Query for specific order
      const ordersQuery = query(
        collection(db, 'customer-orders'),
        where('orderId', '==', orderId)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          console.log('📦 Order tracking snapshot received');
          
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data() as Omit<CustomerOrder, 'id'>;
            const customerOrder: CustomerOrder = {
              ...data,
              id: doc.id
            };

            setOrder(customerOrder);
            console.log('✅ Order tracking updated:', customerOrder.status);
          } else {
            setOrder(null);
            console.log('⚠️ Order not found in customer orders');
          }

          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('❌ Order tracking listener error:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('🔌 Cleaning up order tracking listener');
        unsubscribe();
      };

    } catch (err) {
      console.error('❌ Failed to set up order tracking listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [orderId]);

  return { order, loading, error };
}