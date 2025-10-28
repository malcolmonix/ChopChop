import React from 'react';

export default function FirebaseDebug() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Configuration Debug</h1>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Main Firebase Config</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Missing'}</p>
                <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing'}</p>
                <p><strong>Storage Bucket:</strong> {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ Missing'}</p>
                <p><strong>Messaging Sender ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ Missing'}</p>
                <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ Missing'}</p>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">MenuVerse Firebase Config</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN || '❌ Missing'}</p>
                <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_PROJECT_ID || '❌ Missing'}</p>
                <p><strong>Storage Bucket:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_STORAGE_BUCKET || '❌ Missing'}</p>
                <p><strong>Messaging Sender ID:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_MESSAGING_SENDER_ID || '❌ Missing'}</p>
                <p><strong>App ID:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_APP_ID || '❌ Missing'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Debug Information</h3>
            <div className="text-sm text-blue-800">
              <p>If any configurations show "❌ Missing", check your .env.local file.</p>
              <p>Environment variables should start with NEXT_PUBLIC_ to be available in the browser.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}