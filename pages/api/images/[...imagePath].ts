import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { imagePath } = req.query;

  // Handle the catch-all route - imagePath will be an array
  if (!imagePath) {
    return res.status(400).json({ error: 'Image path is required' });
  }

  // Join the array parts to reconstruct the full path
  const fullImagePath = Array.isArray(imagePath) ? imagePath.join('/') : imagePath;
  
  console.log('🖼️ Image API called with path:', fullImagePath);

  // Try to find the image in multiple possible locations
  const possiblePaths = [
    // Check in multivendor-web public directory
    path.join(process.cwd(), 'public', fullImagePath),
    // Check in admin panel public directory (relative path)
    path.join(process.cwd(), '..', 'multivendor-admin', 'public', fullImagePath),
    // Check if it's an absolute path to admin uploads (extract just filename)
    path.join(process.cwd(), '..', 'multivendor-admin', 'public', 'uploads', 'restaurants', path.basename(fullImagePath)),
  ];

  console.log('🔍 Searching for image in paths:', possiblePaths);

  let filePath: string | null = null;
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }

  if (!filePath) {
    console.log('❌ Image not found in any of these paths:', possiblePaths);
    return res.status(404).json({ error: 'Image not found', searchedPaths: possiblePaths });
  }

  console.log('✅ Image found at:', filePath);

  try {
    // Get file extension to set proper content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Set cache headers for better performance
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving image:', error);
    return res.status(500).json({ error: 'Failed to serve image' });
  }
}