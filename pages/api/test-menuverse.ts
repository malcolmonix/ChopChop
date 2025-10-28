import type { NextApiRequest, NextApiResponse } from 'next';
import { menuVerseAPI } from '../../lib/services/menuverse-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 Testing MenuVerse API...');
    
    // Get all restaurants
    const restaurants = await menuVerseAPI.getRestaurants();
    console.log(`✅ Found ${restaurants.length} restaurants`);
    
    let result: any = {
      restaurants: restaurants.length,
      restaurantList: restaurants.slice(0, 3).map(r => ({
        id: r.id,
        name: r.name,
        description: r.description
      })),
      menuTest: null,
      specificTest: null
    };
    
    if (restaurants.length > 0) {
      // Test menu for first restaurant
      const firstRestaurant = restaurants[0];
      console.log(`🍽️ Testing menu for: ${firstRestaurant.name}`);
      
      const menuItems = await menuVerseAPI.getRestaurantMenu(firstRestaurant.id);
      console.log(`✅ Found ${menuItems.length} menu items`);
      
      result.menuTest = {
        restaurantId: firstRestaurant.id,
        restaurantName: firstRestaurant.name,
        menuItemsCount: menuItems.length,
        sampleItems: menuItems.slice(0, 5).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category
        }))
      };
      
      // Test specific restaurant from logs
      const testId = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
      const specificRestaurant = await menuVerseAPI.getRestaurant(testId);
      if (specificRestaurant) {
        const specificMenu = await menuVerseAPI.getRestaurantMenu(testId);
        result.specificTest = {
          id: testId,
          name: specificRestaurant.name,
          menuItemsCount: specificMenu.length,
          menuItems: specificMenu.map(item => ({
            name: item.name,
            price: item.price,
            category: item.category
          }))
        };
      }
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error testing MenuVerse API:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}