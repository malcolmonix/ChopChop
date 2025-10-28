import { } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LoadingButton } from '@/lib/components/loading';
import { useToast } from '@/lib/context/toast.context';
import { getFirebaseAuth } from '@/lib/firebase/client';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast('success', 'Login successful!');
      const callbackUrl = (router.query.callbackUrl as string) || '/';
      router.push(callbackUrl);
    } catch (error: any) {
      showToast('error', error.message || 'Google sign-in failed');
    }
  };

  // Phone auth temporarily disabled due to Firebase billing/enablement.

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background with food image and overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
          alt="Delicious food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm"></div>
      </div>

      {/* Floating food elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-orange-500/20 blur-2xl animate-pulse"></div>
      <div className="absolute bottom-32 right-20 w-32 h-32 rounded-full bg-green-500/20 blur-3xl animate-pulse delay-1000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Glassmorphism card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">🍽️</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to order delicious meals
            </p>
          </div>

          {/* Content: Google only */}
          <div className="space-y-6">
            {/* Google Sign In Button */}
              <LoadingButton
                type="button"
                loading={false}
                onClick={handleGoogleSignIn}
                className="relative w-full inline-flex items-center justify-center gap-3 py-3 h-12 px-4 border-2 border-gray-200 text-sm font-medium rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-sm hover:shadow-md"
              >
                {/* Left-aligned icon (keeps text perfectly centered) */}
                <span className="absolute left-4 inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5 shrink-0"
                    aria-hidden
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611 20.083H42V20H24v8h11.303C33.602 31.233 29.174 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.868 4.053 29.706 2 24 2 11.85 2 2 11.85 2 24s9.85 22 22 22c11.046 0 20-8.954 20-20 0-1.341-.138-2.651-.389-3.917z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306 14.691l6.571 4.814C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.868 4.053 29.706 2 24 2 16.318 2 9.656 6.337 6.306 12.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 46c5.111 0 9.749-1.953 13.285-5.148l-6.146-5.203C29.058 37.091 26.648 38 24 38c-5.154 0-9.567-2.752-11.908-6.804l-6.52 5.02C8.836 41.556 15.869 46 24 46z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611 20.083H42V20H24v8h11.303c-1.12 3.233-3.52 5.852-6.218 7.148l.001.001 6.146 5.203C36.943 41.999 44 36 44 24c0-1.341-.138-2.651-.389-3.917z"
                    />
                  </svg>
                </span>
                {/* Centered label */}
                <span className="pointer-events-none">Continue with Google</span>
              </LoadingButton>
            <p className="text-xs text-gray-500 text-center">Phone sign-in is temporarily unavailable.</p>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <Link href="/" className="text-sm text-gray-600 hover:text-orange-600 transition-colors inline-flex items-center gap-1">
              <span>←</span> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
