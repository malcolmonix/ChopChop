import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/lib/firebase/server';

/**
 * Example protected API route
 * Only authenticated users with valid Firebase ID tokens can access this
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify Firebase authentication
  const authResult = await requireAuth(req);

  if (!authResult.success) {
    return res.status(401).json({ error: authResult.error || 'Unauthorized' });
  }

  // User is authenticated - authResult contains uid, email, phoneNumber
  const { uid, email, phoneNumber } = authResult;

  // Example: return user info
  return res.status(200).json({
    message: 'Protected route accessed successfully',
    user: {
      uid,
      email,
      phoneNumber,
    },
  });
}
