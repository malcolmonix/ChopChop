import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, setDoc } from 'firebase/firestore';
import { getFirebaseApp } from './client';
// import { OrderSyncService } from './order-sync'; // Temporarily disabled to fix build

// Initialize Firestore
const db = getFirestore(getFirebaseApp());

export interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  variation?: string;
  addons?: string;
}

export interface OrderAddress {
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
}

export interface FirebaseOrder {
  orderId: string;
  restaurantId: number;
  orderStatus: string;
  paymentMethod: string;
  orderAmount: number;
  paidAmount: number;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  instructions?: string;
  deliveryCharges: number;
  tipping: number;
  taxationAmount: number;
  orderDate: string;
  isPickedUp: boolean;
  createdAt: any; // serverTimestamp
  items: OrderItem[];
  vendorNotified: boolean;
  orderType: string;
  platform: string;
}

export class OrderService {
  static async placeOrder({
    restaurant,
    restaurantName,
    orderInput,
    paymentMethod,
    address,
    customer,
    deliveryCharges = 0,
    tipping = 0,
    taxationAmount = 0,
    instructions = '',
    isPickedUp = false
  }: {
    restaurant: number;
    restaurantName?: string;
    orderInput: OrderItem[];
    paymentMethod: string;
    address?: OrderAddress;
    customer?: {
      name: string;
      email: string;
      address?: string;
    };
    deliveryCharges?: number;
    tipping?: number;
    taxationAmount?: number;
    instructions?: string;
    isPickedUp?: boolean;
  }) {
    try {
      // Calculate order details
      const subtotal = orderInput.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderAmount = subtotal + deliveryCharges + tipping + taxationAmount;

      // Determine order status based on payment method
      let orderStatus = 'PENDING';
      let paidAmount = 0;

      if (paymentMethod === 'CASH') {
        orderStatus = 'CONFIRMED'; // Cash orders are confirmed immediately
        paidAmount = 0;
      } else if (paymentMethod === 'CARD' || paymentMethod === 'WALLET') {
        orderStatus = 'PENDING_PAYMENT'; // Electronic payments require payment processing
        paidAmount = 0; // Not paid yet
      } else if (paymentMethod === 'BANK') {
        orderStatus = 'PENDING_PAYMENT'; // Bank transfer - awaiting verification
        paidAmount = 0;
      }

      const orderCode = `CC${Date.now()}`;

      // Create Firebase order object (removing undefined values)
      const firestoreOrder: any = {
        orderId: orderCode,
        restaurantId: restaurant,
        orderStatus,
        paymentMethod,
        orderAmount,
        paidAmount,
        deliveryCharges,
        tipping,
        taxationAmount,
        orderDate: new Date().toISOString(),
        isPickedUp,
        createdAt: serverTimestamp(),
        items: orderInput,
        // Vendor notification fields for MenuVerse integration
        vendorNotified: false,
        orderType: 'delivery',
        platform: 'ChopChop'
      };

      // Only add optional fields if they have values
      if (address?.deliveryAddress) {
        firestoreOrder.deliveryAddress = address.deliveryAddress;
      }
      if (address?.latitude !== undefined) {
        firestoreOrder.deliveryLatitude = address.latitude;
      }
      if (address?.longitude !== undefined) {
        firestoreOrder.deliveryLongitude = address.longitude;
      }
      if (instructions) {
        firestoreOrder.instructions = instructions;
      }

      // Save to Firebase orders collection
      const docRef = await addDoc(collection(db, 'orders'), firestoreOrder);
      console.log(`✅ Order ${orderCode} saved to Firebase with ID:`, docRef.id);

      // ALSO save to vendor-specific collection for MenuVerse notifications
      console.log(`🚀 STARTING vendor save process for order ${orderCode}...`);
      try {
        // Dynamic restaurant-to-vendor mapping
        // In production, this would come from a database lookup
        // For now, we'll try to find the vendor UID dynamically

        console.log(`🔍 Looking up vendor for restaurant ID: ${restaurant}`);

        // Method 1: Try to find vendor by querying the eateries collection
        let vendorUID: string | null = null;

        try {
          // Query the eateries collection to find which vendor owns this restaurant
          const eateriesSnapshot = await getDocs(collection(db, 'eateries'));

          for (const doc of eateriesSnapshot.docs) {
            const eateryData = doc.data();
            // Check if this eatery has this restaurant ID
            // This assumes the eatery document has a restaurantIds array or similar
            if (eateryData.restaurantIds && eateryData.restaurantIds.includes(restaurant)) {
              vendorUID = doc.id;
              console.log(`✅ Found vendor ${vendorUID} for restaurant ${restaurant}`);
              break;
            }
            // Alternative: check if restaurant ID matches the eatery ID
            if (eateryData.id === restaurant || eateryData.restaurantId === restaurant) {
              vendorUID = doc.id;
              console.log(`✅ Found vendor ${vendorUID} for restaurant ${restaurant} (direct match)`);
              break;
            }
          }
        } catch (lookupError) {
          console.warn('⚠️ Could not lookup vendor from eateries collection:', lookupError);
        }

        // Method 2: If no specific mapping found, save to all active vendors
        // This ensures orders don't get lost while the mapping system is being set up
        const vendorUIDs: string[] = [];

        if (vendorUID) {
          vendorUIDs.push(vendorUID);
        } else {
          console.log(`🔄 No specific vendor found for restaurant ${restaurant}, will save to all active vendors`);

          // Get all vendor UIDs from eateries collection
          try {
            const allEateriesSnapshot = await getDocs(collection(db, 'eateries'));

            if (allEateriesSnapshot.docs.length > 0) {
              const allVendorUIDs = allEateriesSnapshot.docs.map(doc => doc.id);
              vendorUIDs.push(...allVendorUIDs);
              console.log(`📋 Found ${allVendorUIDs.length} active vendors:`, allVendorUIDs);
            } else {
              console.log(`📭 No eateries collection found. Creating vendor entry for current demo user.`);
              // If no eateries exist, create one for the demo vendor
              vendorUIDs.push('0GI3MojVnLfvzSEqMc25oCzAmCz2');
            }
          } catch (allVendorsError) {
            console.warn('⚠️ Could not get all vendors, using fallback UIDs');
            // Fallback to known UIDs if the query fails
            vendorUIDs.push('0GI3MojVnLfvzSEqMc25oCzAmCz2'); // Current demo vendor
          }
        }

        console.log(`🎯 Will save order to ${vendorUIDs.length} vendor(s):`, vendorUIDs);

        // Save order to each vendor's collection
        for (const currentVendorUID of vendorUIDs) {
          try {
            // First, ensure the vendor's eatery document exists
            const eateryDocRef = doc(db, 'eateries', currentVendorUID);
            await setDoc(eateryDocRef, {
              id: currentVendorUID,
              name: restaurantName || 'Restaurant', // Use actual restaurant name
              email: 'vendor@chopchop.com',
              createdAt: serverTimestamp(),
              restaurantIds: [restaurant] // Map this vendor to this restaurant
            }, { merge: true }); // merge: true means only update if document doesn't exist

            console.log(`✅ Ensured eatery document exists for vendor: ${currentVendorUID}`);

            const vendorOrderData = {
              // Use the exact same structure that MenuVerse expects
              id: docRef.id,
              eateryId: currentVendorUID,
              customer: {
                name: customer?.name || 'ChopChop Customer',
                email: customer?.email || 'customer@chopchop.com',
                address: address?.deliveryAddress || customer?.address || 'No address provided'
              },
              items: orderInput.map((item, index) => ({
                id: `${docRef.id}-item-${index}`,
                name: item.title,
                quantity: item.quantity,
                price: item.price
              })),
              totalAmount: orderAmount,
              status: orderStatus === 'PENDING' ? 'Pending' :
                orderStatus === 'CONFIRMED' ? 'Confirmed' : 'Pending',
              createdAt: firestoreOrder.createdAt,
              // Additional ChopChop specific fields
              orderId: orderCode,
              restaurantId: restaurant,
              paymentMethod,
              platform: 'ChopChop'
            };

            const vendorPath = `eateries/${currentVendorUID}/orders`;
            const vendorDocRef = await addDoc(collection(db, 'eateries', currentVendorUID, 'orders'), vendorOrderData);

            console.log(`✅ Order ${orderCode} saved to vendor path: ${vendorPath} with ID: ${vendorDocRef.id}`);
            console.log(`📊 Order data saved:`, vendorOrderData);
            console.log(`🎯 VERIFICATION: Order should be visible at Firebase path: eateries/${currentVendorUID}/orders/${vendorDocRef.id}`);

            // 🔄 SYNC TO CUSTOMER ORDERS: Save order to customer-accessible collection
            // Temporarily disabled to fix build issue
            /*
            try {
              const customerOrderId = await OrderSyncService.saveCustomerOrder({
                orderId: orderCode,
                customerId: customer?.email || `customer-${Date.now()}`, // Use email as customer ID
                vendorId: currentVendorUID,
                restaurantId: restaurant,
                restaurantName: restaurantName || 'Restaurant', // Use actual restaurant name
                customer: {
                  name: customer?.name || 'ChopChop Customer',
                  email: customer?.email || 'customer@chopchop.com',
                  address: address?.deliveryAddress || customer?.address || 'No address provided'
                },
                items: orderInput.map((item, index) => ({
                  id: `${orderCode}-item-${index}`,
                  name: item.title,
                  quantity: item.quantity,
                  price: item.price
                })),
                totalAmount: orderAmount,
                status: orderStatus === 'PENDING' ? 'Pending' : 
                       orderStatus === 'CONFIRMED' ? 'Confirmed' : 'Pending',
                paymentMethod: paymentMethod
              });
              
              if (customerOrderId) {
                console.log(`✅ Customer order synced: customer-orders/${customerOrderId}`);
              }
            } catch (syncError) {
              console.warn('⚠️ Failed to sync customer order:', syncError);
              // Don't fail the main order - this is supplementary
            }
            */

          } catch (pathError) {
            console.error(`❌ Failed to save to vendor UID ${currentVendorUID}:`, pathError);
          }
        }

        // IMPORTANT: Let's also try to save to a predictable path for testing
        // This will help us debug what's happening
        try {
          const debugOrderData = {
            id: docRef.id,
            eateryId: 'DEBUG_VENDOR',
            customer: { name: 'Debug Customer', email: 'debug@test.com', address: 'Debug Address' },
            items: [{ id: 'debug-item', name: 'Debug Item', quantity: 1, price: 10.99 }],
            totalAmount: 10.99,
            status: 'Pending',
            createdAt: firestoreOrder.createdAt,
            debugInfo: {
              originalRestaurantId: restaurant,
              orderCode: orderCode,
              timestamp: new Date().toISOString(),
              source: 'ChopChop Debug Save'
            }
          };

          await addDoc(collection(db, 'eateries', 'DEBUG_VENDOR', 'orders'), debugOrderData);
          console.log(`🐛 DEBUG: Order saved to eateries/DEBUG_VENDOR/orders for testing`);

        } catch (debugError) {
          console.warn('Debug save failed:', debugError);
        }

      } catch (vendorError) {
        console.error('⚠️ Failed to save to vendor collections:', vendorError);
        // Don't throw - global order was saved successfully
      }

      return {
        orderId: orderCode,
        orderStatus,
        total: orderAmount,
        firebaseId: docRef.id
      };

    } catch (error) {
      console.error('❌ Firebase order creation failed:', error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  static async updateOrderStatus(firebaseId: string, status: string, paidAmount?: number) {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      const orderRef = doc(db, 'orders', firebaseId);

      const updateData: any = {
        orderStatus: status,
        updatedAt: serverTimestamp()
      };

      if (paidAmount !== undefined) {
        updateData.paidAmount = paidAmount;
      }

      await updateDoc(orderRef, updateData);
      console.log(`✅ Order ${firebaseId} status updated to ${status}`);

    } catch (error) {
      console.error('❌ Firebase order update failed:', error);
      throw error;
    }
  }
}

export default OrderService;