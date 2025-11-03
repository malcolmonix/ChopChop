// Test Customer Order Synchronization
// Verify that customer orders are properly saved and synced

const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');

// Test script to verify customer order sync is working
async function testCustomerOrderSync() {
  console.log('🧪 CUSTOMER ORDER SYNC TEST');
  console.log('==========================');

  try {
    // Import Firebase config
    const { getFirebaseApp } = require('./lib/firebase/client');
    const app = getFirebaseApp();
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

    console.log('\n📊 CUSTOMER ORDER SYNC TEST RESULTS');
    console.log('===================================');
    console.log(`Customer orders found: ${customerOrdersSnapshot.size}`);
    
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