import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Initialize with service account or default credentials
  // For production: use service account JSON
  // For development: GOOGLE_APPLICATION_CREDENTIALS env var or default credentials
  
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  }

  // Fallback: use default credentials or environment-based auth
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

/**
 * Verify Firebase ID token from client
 * @param idToken - The Firebase ID token from the client
 * @returns Decoded token with user info
 */
export async function verifyIdToken(idToken: string) {
  try {
    const app = getFirebaseAdmin();
    const decodedToken = await app.auth().verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number,
      emailVerified: decodedToken.email_verified,
      user: decodedToken,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Invalid token',
    };
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Middleware helper to protect API routes with Firebase auth
 * Usage in Next.js API routes:
 * 
 * export default async function handler(req, res) {
 *   const authResult = await requireAuth(req);
 *   if (!authResult.success) {
 *     return res.status(401).json({ error: authResult.error });
 *   }
 *   // authResult.uid, authResult.email available here
 * }
 */
export async function requireAuth(req: any) {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    return {
      success: false,
      error: 'Authorization token required',
    };
  }

  return await verifyIdToken(token);
}
