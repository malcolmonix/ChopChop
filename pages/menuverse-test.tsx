                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                import React from 'react';
import { getMenuverseApp, getMenuverseAuth, getMenuverseFirestore } from '../lib/firebase/menuverse';

export default function MenuverseTest() {
  const [connectionStatus, setConnectionStatus] = React.useState('Testing...');
  const [authStatus, setAuthStatus] = React.useState('Testing...');
  const [firestoreStatus, setFirestoreStatus] = React.useState('Testing...');

  React.useEffect(() => {
    async function testConnection() {
      try {
        // Test Firebase app initialization
        const app = getMenuverseApp();
        if (app) {
          setConnectionStatus('✅ MenuVerse Firebase app initialized successfully');
        } else {
          setConnectionStatus('❌ Failed to initialize MenuVerse Firebase app');
          return;
        }

        // Test Auth
        const auth = getMenuverseAuth();
        if (auth) {
          setAuthStatus('✅ MenuVerse Auth service available');
        } else {
          setAuthStatus('❌ MenuVerse Auth service not available');
        }

        // Test Firestore
        const db = getMenuverseFirestore();
        if (db) {
          setFirestoreStatus('✅ MenuVerse Firestore service available');
        } else {
          setFirestoreStatus('❌ MenuVerse Firestore service not available');
        }

      } catch (error) {
        console.error('MenuVerse connection test failed:', error);
        setConnectionStatus('❌ Connection failed: ' + error.message);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">MenuVerse Integration Test</h1>
          
          <div className="space-y-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Firebase App Connection</h3>
              <p className="text-sm">{connectionStatus}</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication Service</h3>
              <p className="text-sm">{authStatus}</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Firestore Database</h3>
              <p className="text-sm">{firestoreStatus}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-4">Configuration Details</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_PROJECT_ID}</p>
              <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_AUTH_DOMAIN}</p>
              <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_MENUVERSE_API_KEY ? '✅ Configured' : '❌ Missing'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Setup Instructions:</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">Enable Anonymous Authentication</h4>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Go to <a href="https://console.firebase.google.com/project/chopchop-67750/authentication/providers" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Firebase Authentication</a></li>
                <li>Click on "Sign-in method" tab</li>
                <li>Click on "Anonymous" provider</li>
                <li>Toggle "Enable" and save</li>
              </ol>
            </div>
            
            <h3 className="font-semibold text-gray-900">Next Steps:</h3>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
              <li>Enable Anonymous Authentication (see yellow box above)</li>
              <li>If all services show ✅, the MenuVerse integration is working!</li>
              <li>Visit <a href="/menuverse-demo" className="text-blue-600 hover:underline">/menuverse-demo</a> to test restaurant listing</li>
              <li>To test with real data, set up sample restaurants in <a href="https://console.firebase.google.com/project/chopchop-67750/firestore" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Firestore</a></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}