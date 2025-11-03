// Firebase Debug Script - Check what's actually in the database
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC8XjBJN-Inntjfqd6GhkfRcbTe4hyMx6Q",
  authDomain: "chopchop-67750.firebaseapp.com",
  projectId: "chopchop-67750",
  storageBucket: "chopchop-67750.firebasestorage.app",
  messagingSenderId: "835361851966",
  appId: "1:835361851966:web:78810ea4389297a8679f6f"
};

async function debugFirebase() {
  console.log('🔍 FIREBASE DATABASE DIAGNOSTIC');
  console.log('================================');
  
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Check global orders collection
    console.log('\n📂 Checking global "orders" collection...');
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    console.log(`Found ${ordersSnapshot.size} documents in orders collection`);
    
    if (ordersSnapshot.size > 0) {
      ordersSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        console.log(`Order ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    }
    
    // Check eateries collection
    console.log('\n🏪 Checking "eateries" collection...');
    const eateriesSnapshot = await getDocs(collection(db, 'eateries'));
    console.log(`Found ${eateriesSnapshot.size} documents in eateries collection`);
    
    if (eateriesSnapshot.size > 0) {
      for (const eateryDoc of eateriesSnapshot.docs) {
        console.log(`\n🏪 Eatery: ${eateryDoc.id}`);
        console.log('Eatery data:', eateryDoc.data());
        
        // Check orders subcollection for this eatery
        const eateryOrdersSnapshot = await getDocs(collection(db, 'eateries', eateryDoc.id, 'orders'));
        console.log(`  📦 Orders in ${eateryDoc.id}: ${eateryOrdersSnapshot.size} documents`);
        
        if (eateryOrdersSnapshot.size > 0) {
          eateryOrdersSnapshot.docs.forEach((orderDoc, index) => {
            console.log(`    Order ${index + 1}:`, {
              id: orderDoc.id,
              data: orderDoc.data()
            });
          });
        }
      }
    }
    
    // Check the specific vendor UID from MenuVerse
    const vendorUID = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
    console.log(`\n🎯 Checking specific vendor: ${vendorUID}`);
    
    const vendorDoc = await getDoc(doc(db, 'eateries', vendorUID));
    if (vendorDoc.exists()) {
      console.log('✅ Vendor document exists:', vendorDoc.data());
      
      const vendorOrdersSnapshot = await getDocs(collection(db, 'eateries', vendorUID, 'orders'));
      console.log(`📦 Vendor orders: ${vendorOrdersSnapshot.size} documents`);
      
      if (vendorOrdersSnapshot.size > 0) {
        vendorOrdersSnapshot.docs.forEach((orderDoc, index) => {
          console.log(`  Order ${index + 1}:`, {
            id: orderDoc.id,
            data: orderDoc.data()
          });
        });
      }
    } else {
      console.log('❌ Vendor document does not exist');
    }
    
  } catch (error) {
    console.error('🚨 Firebase debug failed:', error);
  }
}

debugFirebase();