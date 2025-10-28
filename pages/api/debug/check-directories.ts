import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check various paths for the admin uploads directory
    const adminUploadsPaths = [
      path.join(process.cwd(), '..', 'multivendor-admin', 'public', 'uploads'),
      path.join(process.cwd(), '..', 'multivendor-admin', 'public', 'uploads', 'restaurants'),
    ];

    const results = adminUploadsPaths.map(dirPath => {
      const exists = fs.existsSync(dirPath);
      let files: string[] = [];
      
      if (exists) {
        try {
          files = fs.readdirSync(dirPath);
        } catch (error) {
          files = [`Error reading directory: ${error.message}`];
        }
      }

      return {
        path: dirPath,
        exists,
        files: files.slice(0, 10) // Limit to first 10 files
      };
    });

    // Also check current working directory
    const cwd = process.cwd();
    
    return res.status(200).json({
      currentWorkingDirectory: cwd,
      adminPaths: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to check directories',
      message: error.message 
    });
  }
}