import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { testPath } = req.query;
  
  const imagePath = testPath || 'uploads/restaurants/1761609101604_IMG-20250918-WA0022.jpg';
  
  return res.status(200).json({
    message: 'Image API test endpoint',
    testImageUrl: `/api/images/${imagePath}`,
    instructions: 'Try accessing the testImageUrl to see if the image loads',
    originalPath: imagePath
  });
}