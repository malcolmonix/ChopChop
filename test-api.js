// Test MenuVerse API directly
const { menuVerseAPI } = require('./lib/services/menuverse-api');

async function testMenuVerseAPI() {
  try {
    console.log('🔍 Testing MenuVerse API...');
    
    // Get all restaurants
    console.log('\n📋 Fetching restaurants from MenuVerse...');
    const restaurants = await menuVerseAPI.getRestaurants();
    console.log(`✅ Found ${restaurants.length} restaurants`);
    
    if (restaurants.length > 0) {
      // Show first few restaurants
      restaurants.slice(0, 3).forEach((restaurant, index) => {
        console.log(`  ${index + 1}. ${restaurant.name} (ID: ${restaurant.id})`);
      });
      
      // Test menu for first restaurant
      const firstRestaurant = restaurants[0];
      console.log(`\n🍽️ Fetching menu for: ${firstRestaurant.name} (ID: ${firstRestaurant.id})`);
      
      const menuItems = await menuVerseAPI.getRestaurantMenu(firstRestaurant.id);
      console.log(`✅ Found ${menuItems.length} menu items`);
      
      if (menuItems.length > 0) {
        console.log('\nSample menu items:');
        menuItems.slice(0, 5).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} - ₦${item.price.toLocaleString()} (Category: ${item.category || 'None'})`);
        });
      } else {
        console.log('❌ No menu items found for this restaurant');
      }
      
      // Test a specific restaurant ID (the one from the logs)
      const testRestaurantId = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
      console.log(`\n🔍 Testing specific restaurant ID: ${testRestaurantId}`);
      
      const specificRestaurant = await menuVerseAPI.getRestaurant(testRestaurantId);
      if (specificRestaurant) {
        console.log(`✅ Found restaurant: ${specificRestaurant.name}`);
        
        const specificMenu = await menuVerseAPI.getRestaurantMenu(testRestaurantId);
        console.log(`✅ Menu items for ${specificRestaurant.name}: ${specificMenu.length}`);
        
        if (specificMenu.length > 0) {
          console.log('Menu items:');
          specificMenu.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} - ₦${item.price.toLocaleString()}`);
          });
        }
      } else {
        console.log(`❌ Restaurant ${testRestaurantId} not found`);
      }
      
    } else {
      console.log('❌ No restaurants found');
    }
    
  } catch (error) {
    console.error('❌ Error testing MenuVerse API:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMenuVerseAPI();