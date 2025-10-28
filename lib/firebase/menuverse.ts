import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// MenuVerse Firebase configuration
const menuverseConfig = {
  apiKey: process.env.NEXT_PUBLIC_MENUVERSE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_MENUVERSE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_MENUVERSE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MENUVERSE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_MENUVERSE_APP_ID,
};

// Initialize MenuVerse Firebase app with a unique name
export function getMenuverseApp() {
  // Validate that all required config values are present
  if (!menuverseConfig.apiKey) {
    console.warn('MenuVerse API key is missing. Check your NEXT_PUBLIC_MENUVERSE_API_KEY environment variable.');
    return null;
  }
  
  try {
    // Check if MenuVerse app already exists
    const existingApp = getApps().find(app => app.name === 'menuverse');
    if (existingApp) {
      return existingApp;
    }
    
    // Validate config before initializing
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    for (const field of requiredFields) {
      if (!menuverseConfig[field]) {
        console.warn(`MenuVerse ${field} is missing. Check your environment variables.`);
        return null;
      }
    }
    
    // Initialize new MenuVerse app
    return initializeApp(menuverseConfig, 'menuverse');
  } catch (error) {
    console.error('Error initializing MenuVerse Firebase app:', error);
    return null;
  }
}

export function getMenuverseAuth() {
  try {
    const app = getMenuverseApp();
    if (!app) return null;
    
    return getAuth(app);
  } catch (error) {
    console.error('Error initializing MenuVerse Auth:', error);
    return null;
  }
}

export function getMenuverseFirestore() {
  try {
    const app = getMenuverseApp();
    if (!app) return null;
    
    return getFirestore(app);
  } catch (error) {
    console.error('Error initializing MenuVerse Firestore:', error);
    return null;
  }
}

// Helper function to ensure anonymous authentication for MenuVerse
export async function ensureMenuverseAuth() {
  try {
    console.log('MenuVerse: Attempting to ensure authentication...');
    const auth = getMenuverseAuth();
    if (!auth) {
      console.warn('MenuVerse auth not available, proceeding without authentication');
      return null;
    }
    
    console.log('MenuVerse: Auth service obtained, checking current user...');
    
    // Check if already signed in
    if (auth.currentUser) {
      console.log('MenuVerse: Already signed in as:', auth.currentUser.uid);
      return auth.currentUser;
    }
    
    console.log('MenuVerse: No current user, attempting anonymous sign-in...');
    
    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(auth);
      console.log('MenuVerse: Successfully signed in anonymously:', userCredential.user.uid);
      return userCredential.user;
    } catch (authError) {
      console.error('MenuVerse: Anonymous sign-in failed:', authError);
      console.error('MenuVerse: Auth error details:', {
        code: authError.code,
        message: authError.message
      });
      
      if (authError.code === 'auth/admin-restricted-operation') {
        console.warn('MenuVerse: Anonymous authentication is DISABLED in Firebase Console');
        console.warn('MenuVerse: To fix this:');
        console.warn('MenuVerse: 1. Go to https://console.firebase.google.com');
        console.warn('MenuVerse: 2. Select chopchop-67750 project');
        console.warn('MenuVerse: 3. Go to Authentication → Sign-in method');
        console.warn('MenuVerse: 4. Enable "Anonymous" provider');
        console.warn('MenuVerse: 5. Save changes');
        console.warn('MenuVerse: Proceeding without authentication - order placement will likely fail');
        // Don't return null, throw error so we know auth is required
        throw new Error('Anonymous authentication disabled in Firebase Console. Please enable it to place orders.');
      }
      throw authError;
    }
  } catch (error) {
    console.error('MenuVerse: Authentication failed with error:', error);
    console.error('MenuVerse: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // Don't throw error for auth issues, allow app to continue
    return null;
  }
}