import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useFirebaseAuth } from '@/lib/context/firebase-auth.context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC to protect pages - redirects to login if not authenticated
 * Usage: export default withAuth(YourPage);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
