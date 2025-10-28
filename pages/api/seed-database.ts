import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { seedMenuVerseDatabase } = await import('../../lib/utils/seed-menuverse');
    
    console.log('🌱 Starting MenuVerse database seeding...');
    const seedResult = await seedMenuVerseDatabase();
    
    console.log(`✅ Seeding completed: ${seedResult} restaurants`);
    
    res.status(200).json({ 
      success: true, 
      message: `Successfully seeded ${seedResult} restaurants with menu items`,
      restaurants: seedResult
    });
    
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}