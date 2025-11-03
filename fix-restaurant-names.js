// Update Restaurant Names in Firebase
// Fix the eatery documents to have proper restaurant names

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

// Real restaurant names to use
const restaurantNames = [
  "Mama Cass Kitchen",
  "KFC Lagos", 
  "Domino's Pizza",
  "Mr. Bigg's",
  "Chicken Republic",
  "Sweet Sensation",
  "Tantalizers"
];

// Restaurant descriptions
const restaurantDescriptions = [
  "Authentic Nigerian cuisine with the best jollof rice in town",
  "World famous fried chicken and finger lickin' good meals",
  "Fresh hot pizza delivered to your door in 30 minutes or less",
  "Nigeria's favorite family restaurant serving quality fast food",
  "Delicious grilled chicken and continental dishes",
  "Sweet treats, cakes, and continental cuisine",
  "Fast food with a Nigerian twist, quality meals for everyone"
];

async function updateRestaurantNames() {
  console.log('🔧 UPDATING RESTAURANT NAMES');
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
    console.log('\n📋 Fetching Eateries to Update');
    console.log('------------------------------');
    
    const eateriesRef = collection(db, 'eateries');
    const eateriesSnapshot = await getDocs(eateriesRef);

    console.log(`🔍 Found ${eateriesSnapshot.size} eateries to update`);

    let updateCount = 0;
    const promises = [];

    eateriesSnapshot.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      const currentName = data.name;
      
      // Assign a real restaurant name
      const newName = restaurantNames[index % restaurantNames.length];
      const newDescription = restaurantDescriptions[index % restaurantDescriptions.length];
      
      console.log(`\n📝 Updating Eatery ${index + 1}:`);
      console.log(`   ID: ${docSnapshot.id}`);
      console.log(`   Current: "${currentName}"`);
      console.log(`   New: "${newName}"`);
      
      // Update the document
      const updatePromise = updateDoc(doc(db, 'eateries', docSnapshot.id), {
        name: newName,
        description: newDescription
      }).then(() => {
        console.log(`   ✅ Updated ${docSnapshot.id} to "${newName}"`);
      }).catch((error) => {
        console.error(`   ❌ Failed to update ${docSnapshot.id}:`, error.message);
      });
      
      promises.push(updatePromise);
      updateCount++;
    });

    // Wait for all updates to complete
    console.log(`\n🔄 Updating ${updateCount} eateries...`);
    await Promise.all(promises);

    console.log('\n📊 UPDATE RESULTS');
    console.log('==================');
    console.log(`✅ SUCCESS: Updated ${updateCount} restaurant names`);
    console.log('🔍 Restaurant names should now appear correctly in ChopChop');
    
    // Show the updated names
    console.log('\n📋 New Restaurant Names:');
    console.log('------------------------');
    restaurantNames.slice(0, Math.min(updateCount, restaurantNames.length)).forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });

  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateRestaurantNames();