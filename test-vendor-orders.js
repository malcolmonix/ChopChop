// Test script to query vendor orders and debug the real-time listener
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, onSnapshot, doc, getDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "835361851966",
  appId: "1:835361851966:web:78810ea4389297a8679f6f"
};

async function testVendorOrders() {
  console.log('🧪 VENDOR ORDERS TEST');
  console.log('====================');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    const vendorUID = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
    console.log(`\n🎯 Testing vendor: ${vendorUID}`);
    
    // Test 1: Check if vendor document exists
    console.log('\n📋 Test 1: Vendor Document Existence');
    console.log('------------------------------------');
    
    const vendorDoc = await getDoc(doc(db, 'eateries', vendorUID));
    if (vendorDoc.exists()) {
      console.log('✅ Vendor document exists');
      console.log('📄 Vendor data:', vendorDoc.data());
    } else {
      console.log('❌ Vendor document does not exist');
      return;
    }
    
    // Test 2: Query orders collection using getDocs (same as manual test)
    console.log('\n📋 Test 2: Manual Orders Query (getDocs)');
    console.log('------------------------------------------');
    
    const ordersSnapshot = await getDocs(collection(db, 'eateries', vendorUID, 'orders'));
    console.log(`📦 Found ${ordersSnapshot.size} orders using getDocs`);
    
    if (ordersSnapshot.size > 0) {
      console.log('📄 Sample orders:');
      ordersSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ${doc.id}:`, {
          orderId: data.orderId,
          status: data.status,
          totalAmount: data.totalAmount,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          customer: data.customer?.name
        });
      });
    }
    
    // Test 3: Real-time listener test (simulating MenuVerse useCollection)
    console.log('\n📋 Test 3: Real-time Listener Test (onSnapshot)');
    console.log('-----------------------------------------------');
    
    let listenerTriggered = false;
    let ordersReceived = 0;
    
    const unsubscribe = onSnapshot(
      collection(db, 'eateries', vendorUID, 'orders'),
      (snapshot) => {
        listenerTriggered = true;
        ordersReceived = snapshot.size;
        
        console.log(`🔄 Real-time listener triggered!`);
        console.log(`📦 Received ${snapshot.size} orders via listener`);
        
        if (snapshot.size > 0) {
          console.log('📄 First order from listener:');
          const firstDoc = snapshot.docs[0];
          const data = firstDoc.data();
          console.log(`  ID: ${firstDoc.id}`);
          console.log(`  Order: ${data.orderId || 'N/A'}`);
          console.log(`  Status: ${data.status || 'N/A'}`);
          console.log(`  Amount: ${data.totalAmount || 'N/A'}`);
          console.log(`  Created: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        }
        
        // Test the exact data structure MenuVerse expects
        console.log('\n🔍 Data Structure Analysis:');
        snapshot.docs.slice(0, 2).forEach((doc, index) => {
          const data = doc.data();
          console.log(`\nOrder ${index + 1} structure:`);
          console.log(`  Has id: ${!!doc.id}`);
          console.log(`  Has totalAmount: ${!!data.totalAmount}`);
          console.log(`  Has status: ${!!data.status}`);
          console.log(`  Has createdAt: ${!!data.createdAt}`);
          console.log(`  Has customer: ${!!data.customer}`);
          console.log(`  Has items: ${!!data.items}`);
          console.log(`  Raw keys:`, Object.keys(data));
        });
      },
      (error) => {
        console.error('🚨 Real-time listener error:', error);
      }
    );
    
    // Wait for listener to trigger
    console.log('⏳ Waiting 3 seconds for real-time listener...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (!listenerTriggered) {
      console.log('❌ Real-time listener did not trigger after 3 seconds');
      console.log('🔍 This indicates a potential issue with onSnapshot');
    }
    
    unsubscribe();
    
    // Test 4: Compare data structures
    console.log('\n📋 Test 4: Data Structure Comparison');
    console.log('------------------------------------');
    
    if (ordersSnapshot.size > 0) {
      const sampleOrder = ordersSnapshot.docs[0].data();
      console.log('\n🎯 MenuVerse expects these fields:');
      console.log('  - id (document ID)');
      console.log('  - totalAmount (number)');
      console.log('  - status (string)');
      console.log('  - createdAt (timestamp)');
      console.log('  - customer (object)');
      console.log('  - items (array)');
      
      console.log('\n📄 Actual order has:');
      Object.keys(sampleOrder).forEach(key => {
        const value = sampleOrder[key];
        const type = typeof value;
        console.log(`  - ${key} (${type}): ${type === 'object' && value?.constructor?.name ? value.constructor.name : 'simple value'}`);
      });
    }
    
    // Test 5: Permissions test
    console.log('\n📋 Test 5: Permissions Test');
    console.log('---------------------------');
    
    try {
      const testCollection = collection(db, 'eateries', vendorUID, 'orders');
      const testSnapshot = await getDocs(testCollection);
      console.log('✅ Read permissions working');
      console.log(`📖 Successfully read ${testSnapshot.size} documents`);
    } catch (permError) {
      console.error('❌ Permission error:', permError);
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log(`✅ Vendor exists: ${vendorDoc.exists()}`);
    console.log(`✅ Orders found: ${ordersSnapshot.size}`);
    console.log(`✅ Real-time listener: ${listenerTriggered ? 'Working' : 'Failed'}`);
    console.log(`✅ Orders via listener: ${ordersReceived}`);
    
    if (ordersSnapshot.size > 0 && listenerTriggered && ordersReceived === ordersSnapshot.size) {
      console.log('\n🎉 ALL TESTS PASSED! The issue might be in MenuVerse React components.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
  
  process.exit(0);
}

testVendorOrders();