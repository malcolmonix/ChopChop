import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Import dynamically to avoid module issues
    const { menuVerseAPI } = await import('../../lib/services/menuverse-api');
    
    console.log('🔍 Testing MenuVerse API from server...');
    
    // Get all restaurants
    const restaurants = await menuVerseAPI.getRestaurants();
    console.log(`✅ Found ${restaurants.length} restaurants`);
    
    const result = {
      restaurantCount: restaurants.length,
      restaurants: restaurants.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description
      })),
      menuTests: []
    };
    
    // Test menu for each restaurant
    for (const restaurant of restaurants.slice(0, 3)) {
      console.log(`🍽️ Testing menu for: ${restaurant.name} (${restaurant.id})`);
      const menuItems = await menuVerseAPI.getRestaurantMenu(restaurant.id);
      console.log(`📋 Found ${menuItems.length} menu items for ${restaurant.name}`);
      
      (result.menuTests as any[]).push({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        menuItemCount: menuItems.length,
        menuItems: menuItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          eateryId: item.eateryId
        }))
      });
    }
    
    console.log('📊 Final result:', JSON.stringify(result, null, 2));
    res.status(200).json(result);
    
  } catch (error: any) {
    console.error('❌ Error in debug API:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}