import React from 'react';

export default function DebugEnv() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_API_KEY:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? ' [SET]' : ' [MISSING]'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '[MISSING]'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_PROJECT_ID:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '[MISSING]'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '[MISSING]'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '[MISSING]'}
        </div>
        <div>
          <strong>NEXT_PUBLIC_FIREBASE_APP_ID:</strong> 
          {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '[MISSING]'}
        </div>
      </div>
    </div>
  );
}