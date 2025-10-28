// Quick debugging script to check restaurant data structure
import { menuVerseAPI } from '../services/menuverse-api';

async function debugRestaurantData() {
  try {
    console.log('🔍 Debugging restaurant data...');
    const restaurants = await menuVerseAPI.getRestaurants();
    
    console.log(`Found ${restaurants.length} restaurants:`);
    
    restaurants.forEach((restaurant, index) => {
      console.log(`\n--- Restaurant ${index + 1}: ${restaurant.name} ---`);
      console.log('ID:', restaurant.id);
      console.log('image:', restaurant.image);
      console.log('logoUrl:', restaurant.logoUrl);
      console.log('bannerUrl:', restaurant.bannerUrl);
      console.log('address:', restaurant.address);
      console.log('contactEmail:', restaurant.contactEmail);
      console.log('isActive:', restaurant.isActive);
      
      // Check if image URL is accessible
      if (restaurant.image) {
        console.log('Image URL format:', typeof restaurant.image);
        console.log('Image URL starts with http:', restaurant.image.startsWith('http'));
        console.log('Image URL starts with data:', restaurant.image.startsWith('data:'));
        console.log('Image URL length:', restaurant.image.length);
      }
    });
    
  } catch (error) {
    console.error('❌ Error debugging restaurant data:', error);
  }
}

// Export for use in browser console or Next.js pages
if (typeof window !== 'undefined') {
  (window as any).debugRestaurantData = debugRestaurantData;
}

export { debugRestaurantData };