// Test Customer Order Synchronization using MenuVerse Firebase
// Verify that customer orders are properly saved and synced

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// MenuVerse Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjUBUG1PsI6BTXPjxSlJxNyO7DFo_9qSA",
  authDomain: "menuverse-ea4e5.firebaseapp.com",
  projectId: "menuverse-ea4e5",
  storageBucket: "menuverse-ea4e5.firebasestorage.app",
  messagingSenderId: "320853859648",
  appId: "1:320853859648:web:18fa30c6fe0e5c2ae0e3e0"
};

// Test script to verify customer order sync is working
async function testCustomerOrderSync() {
  console.log('🧪 CUSTOMER ORDER SYNC TEST');
  console.log('==========================');

  try {
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized for customer order test');

    // Check if customer-orders collection exists and has data
    console.log('\n📋 Checking Customer Orders Collection');
    console.log('-------------------------------------');
    
    const customerOrdersRef = collection(db, 'customer-orders');
    const customerOrdersQuery = query(customerOrdersRef, orderBy('createdAt', 'desc'));
    const customerOrdersSnapshot = await getDocs(customerOrdersQuery);

    console.log(`📍 Collection path: customer-orders`);
    console.log(`🔍 Found ${customerOrdersSnapshot.size} customer orders`);

    if (customerOrdersSnapshot.size > 0) {
      customerOrdersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nCustomer Order ${index + 1}: {`);
        console.log(`  id: '${doc.id}',`);
        console.log(`  orderId: ${data.orderId || 'undefined'},`);
        console.log(`  customerId: ${data.customerId || 'undefined'},`);
        console.log(`  vendorId: ${data.vendorId || 'undefined'},`);
        console.log(`  status: '${data.status}',`);
        console.log(`  totalAmount: ${data.totalAmount},`);
        console.log(`  restaurant: ${data.restaurantName || 'undefined'},`);
        console.log(`  customer: ${data.customer?.name || 'undefined'},`);
        console.log(`  createdAt: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'undefined'}`);
        console.log(`}`);
      });
    }

    // Also check vendor orders to compare
    console.log('\n📋 Checking Vendor Orders for Comparison');
    console.log('----------------------------------------');
    
    const vendorUID = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
    const vendorOrdersRef = collection(db, 'eateries', vendorUID, 'orders');
    const vendorOrdersQuery = query(vendorOrdersRef, orderBy('createdAt', 'desc'));
    const vendorOrdersSnapshot = await getDocs(vendorOrdersQuery);

    console.log(`📍 Vendor collection path: eateries/${vendorUID}/orders`);
    console.log(`🔍 Found ${vendorOrdersSnapshot.size} vendor orders`);

    const recentVendorOrders = [];
    vendorOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.platform === 'ChopChop') {
        recentVendorOrders.push({
          id: doc.id,
          orderId: data.orderId,
          status: data.status,
          platform: data.platform
        });
      }
    });

    console.log(`🛒 ChopChop orders in vendor collection: ${recentVendorOrders.length}`);

    console.log('\n📊 CUSTOMER ORDER SYNC TEST RESULTS');
    console.log('===================================');
    console.log(`Customer orders found: ${customerOrdersSnapshot.size}`);
    console.log(`Vendor orders found: ${vendorOrdersSnapshot.size}`);
    console.log(`ChopChop vendor orders: ${recentVendorOrders.length}`);
    
    if (customerOrdersSnapshot.size > 0) {
      console.log('✅ SUCCESS: Customer orders collection is working!');
      console.log('🔍 Orders are being saved for customer tracking');
    } else {
      console.log('⚠️ No customer orders found yet');
      console.log('🔍 Place a new ChopChop order to test the sync');
    }

  } catch (error) {
    console.error('❌ Customer order sync test failed:', error);
  }
}

testCustomerOrderSync();