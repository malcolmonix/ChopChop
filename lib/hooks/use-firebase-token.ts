import { useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';
import { getFirebaseAuth } from '@/lib/firebase/client';

/**
 * Hook to get Firebase ID token for API calls
 * Returns a function that retrieves the current user's ID token
 */
export function useFirebaseToken() {
  const { user } = useFirebaseAuth();

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return null;

      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  };

  return { getIdToken, user };
}

/**
 * Helper to create Authorization header with Firebase ID token
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;

  if (!user) {
    return {};
  }

  try {
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
}

/**
 * Fetch wrapper with automatic Firebase auth headers
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders,
    },
  });
}
