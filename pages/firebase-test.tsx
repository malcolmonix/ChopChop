import React, { useEffect, useState } from 'react';
import { getFirebaseApp } from '../lib/firebase/client';

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const app = getFirebaseApp();
      console.log('Firebase app initialized:', app.name);
      console.log('Firebase config:', app.options);
      setStatus('Firebase app initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Firebase initialization error:', err);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <div className="mt-2 space-y-1 text-sm">
            <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}</div>
            <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '✗ Missing'}</div>
            <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '✗ Missing'}</div>
            <div>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '✗ Missing'}</div>
            <div>Messaging Sender ID: {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '✗ Missing'}</div>
            <div>App ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '✗ Missing'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}