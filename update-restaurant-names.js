// Update Restaurant Names in Firebase
// Fix the "Demo Restaurant" issue by updating actual restaurant names

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// MenuVerse Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjUBUG1PsI6BTXPjxSlJxNyO7DFo_9qSA",
  authDomain: "menuverse-ea4e5.firebaseapp.com",
  projectId: "menuverse-ea4e5",
  storageBucket: "menuverse-ea4e5.firebasestorage.app",
  messagingSenderId: "320853859648",
  appId: "1:320853859648:web:18fa30c6fe0e5c2ae0e3e0"
};

// Restaurant names to use instead of "Demo Restaurant"
const restaurantNames = [
  'Mama Cass Kitchen',
  'KFC Lagos',
  'Dominos Pizza',
  'Mr. Biggs',
  'Sweet Sensation',
  'Chicken Republic',
  'Tantalizers'
];

async function updateRestaurantNames() {
  console.log('🍽️  UPDATING RESTAURANT NAMES');
  console.log('============================');

  try {
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');

    // Get all eateries
    console.log('\n📋 Fetching Current Eateries');
    console.log('----------------------------');
    
    const eateriesRef = collection(db, 'eateries');
    const eateriesSnapshot = await getDocs(eateriesRef);

    console.log(`🔍 Found ${eateriesSnapshot.size} eateries`);

    // Update each eatery with a proper name
    let updateCount = 0;
    const updates = [];
    
    eateriesSnapshot.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      const newName = restaurantNames[index % restaurantNames.length];
      
      console.log(`\nEatery ${index + 1}:`);
      console.log(`  ID: ${docSnapshot.id}`);
      console.log(`  Current Name: ${data.name || 'undefined'}`);
      console.log(`  New Name: ${newName}`);
      
      // Prepare update
      updates.push({
        id: docSnapshot.id,
        currentName: data.name,
        newName: newName
      });
    });

    // Confirm updates
    console.log('\n🔄 Updating Restaurant Names');
    console.log('-----------------------------');
    
    for (const update of updates) {
      try {
        const eateryDocRef = doc(db, 'eateries', update.id);
        await updateDoc(eateryDocRef, {
          name: update.newName,
          updatedAt: new Date()
        });
        
        console.log(`✅ Updated ${update.id}: "${update.currentName}" → "${update.newName}"`);
        updateCount++;
      } catch (error) {
        console.error(`❌ Failed to update ${update.id}:`, error);
      }
    }

    console.log('\n📊 UPDATE RESULTS');
    console.log('==================');
    console.log(`Total eateries: ${eateriesSnapshot.size}`);
    console.log(`Successfully updated: ${updateCount}`);
    console.log(`Failed: ${eateriesSnapshot.size - updateCount}`);
    
    if (updateCount > 0) {
      console.log('\n✅ SUCCESS: Restaurant names updated!');
      console.log('🔄 Refresh ChopChop to see the new restaurant names');
    }

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateRestaurantNames();