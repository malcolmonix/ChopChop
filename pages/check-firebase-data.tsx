import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getMenuverseFirestore, ensureMenuverseAuth } from '../lib/firebase/menuverse';

export default function CheckFirebaseData() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize MenuVerse connection
      const db = getMenuverseFirestore();
      if (!db) {
        throw new Error('Failed to initialize Firestore');
      }
      await ensureMenuverseAuth();
      
      const collections = ['eateries', 'restaurants', 'stores', 'vendors'];
      const results: any = {};
      
      for (const collectionName of collections) {
        try {
          const collRef = collection(db, collectionName);
          const snapshot = await getDocs(collRef);
          
          results[collectionName] = {
            exists: !snapshot.empty,
            count: snapshot.size,
            docs: snapshot.docs.map(doc => ({
              id: doc.id,
              data: doc.data()
            }))
          };
        } catch (err) {
          results[collectionName] = {
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          };
        }
      }
      
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Data Check</h1>
      
      <button
        onClick={checkCollections}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Firebase Collections'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Collection Status:</h2>
          
          {Object.entries(data).map(([collectionName, info]: [string, any]) => (
            <div key={collectionName} className="mb-6 p-4 border rounded">
              <h3 className="text-xl font-medium mb-2">
                Collection: <code className="bg-gray-100 px-2 py-1 rounded">{collectionName}</code>
              </h3>
              
              {info.exists ? (
                <div>
                  <p className="text-green-600 font-semibold">✓ Exists ({info.count} documents)</p>
                  
                  {info.docs && info.docs.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium">Sample Documents:</h4>
                      {info.docs.slice(0, 3).map((doc: any, index: number) => (
                        <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                          <strong>ID:</strong> {doc.id}
                          <pre className="mt-1 text-sm overflow-auto">
                            {JSON.stringify(doc.data, null, 2)}
                          </pre>
                        </div>
                      ))}
                      {info.docs.length > 3 && (
                        <p className="text-gray-600 text-sm mt-2">
                          ... and {info.docs.length - 3} more documents
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-semibold">✗ Does not exist or empty</p>
                  {info.error && (
                    <p className="text-red-500 text-sm mt-1">Error: {info.error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}