import React, { useState } from 'react';
import Link from 'next/link';
import { useFirebaseAuth } from '../../lib/context/firebase-auth.context';
import { useFirebaseToken, authenticatedFetch } from '../../lib/hooks/use-firebase-token';

export default function AuthDebug() {
  const { user, signOut } = useFirebaseAuth();
  const { getIdToken } = useFirebaseToken();
  const [apiResult, setApiResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const callProtected = async () => {
    try {
      setError(null);
      setApiResult(null);
      const res = await authenticatedFetch('/api/user/me');
      const json = await res.json();
      setApiResult(json);
    } catch (e: any) {
      setError(e?.message || 'Request failed');
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Auth Debug</h1>
        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-medium mb-2">Client user</h2>
          <pre className="text-sm overflow-auto bg-gray-50 p-3 rounded">{JSON.stringify({
            uid: user?.uid,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
            displayName: user?.displayName,
          }, null, 2)}</pre>

          <div className="flex gap-3 mt-3">
            {!user && (
              <Link href={{ pathname: '/login', query: { callbackUrl: '/dev/auth-debug' } }} className="px-3 py-2 rounded bg-orange-600 text-white text-sm">Go to Login</Link>
            )}
            {user && (
              <button onClick={() => signOut()} className="px-3 py-2 rounded bg-gray-800 text-white text-sm">Sign out</button>
            )}
            <button onClick={async () => alert(await getIdToken())} className="px-3 py-2 rounded border text-sm">Show ID Token</button>
            <button onClick={callProtected} className="px-3 py-2 rounded bg-green-600 text-white text-sm">Call /api/user/me</button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border">
          <h2 className="font-medium mb-2">Protected API result</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <pre className="text-sm overflow-auto bg-gray-50 p-3 rounded">{JSON.stringify(apiResult, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
