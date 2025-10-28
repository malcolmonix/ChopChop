import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const testItem = {
    id: 'test-item-1',
    name: 'Test Cookie',
    price: 500,
    quantity: 1,
    restaurantId: '0GI3MojVnLfvzSEqMc25oCzAmCz2',
    restaurantName: 'cookies'
  };

  res.status(200).json({
    message: 'Cart test endpoint',
    testItem,
    instructions: 'Use this item structure when adding to cart',
    cartFormat: {
      'new API': 'addItem(item)',
      'old API': 'addItem(restaurantId, restaurantName, item)'
    }
  });
}