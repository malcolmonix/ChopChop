import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { menuVerseAPI } = await import('../../lib/services/menuverse-api');
    
    const restaurantId = '0GI3MojVnLfvzSEqMc25oCzAmCz2';
    console.log(`🔍 Checking menu for restaurant: ${restaurantId}`);
    
    const menuItems = await menuVerseAPI.getRestaurantMenu(restaurantId);
    console.log(`📋 Found ${menuItems.length} menu items`);
    
    const result = {
      restaurantId,
      menuItemCount: menuItems.length,
      menuItems: menuItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        eateryId: item.eateryId
      }))
    };
    
    res.status(200).json(result);
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}