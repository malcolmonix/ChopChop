import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useFirebaseAuth } from '../lib/context/firebase-auth.context';
import { useCart } from '../lib/context/cart.context';

export default function Header() {
  const { user, signOut } = useFirebaseAuth();
  const { count, total } = useCart();
  const isProd = process.env.NODE_ENV === 'production';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-600 text-white">🍽️</span>
          <span>ChopChop</span>
        </Link>

        <nav className="flex items-center gap-3">
          {!isProd && (
            <>
              <Link
                href="/order-flow-test"
                className="hidden sm:block px-2 py-1.5 rounded-lg text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-50 border border-red-200"
              >
                🔧 Debug
              </Link>
              <Link
                href="/menuverse-demo"
                className="hidden sm:block px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
              >
                MenuVerse Demo
              </Link>
            </>
          )}

          {/* Cart Button */}
          {count > 0 && (
            <Link
              href="/checkout"
              className="relative px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-sm flex items-center gap-2"
            >
              🛒
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{count}</span>
              <span className="hidden sm:inline text-xs">₦{total.toLocaleString()}</span>
            </Link>
          )}
          
          {!user ? (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-sm"
            >
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hidden sm:block text-sm text-gray-700 hover:text-gray-900">
                {user.displayName || user.email || user.phoneNumber}
              </Link>
              <Link href="/profile" className="inline-block">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="avatar" width={32} height={32} className="rounded-full ring-2 ring-orange-200" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 text-sm font-medium ring-2 ring-orange-200">
                    {((user.displayName || user.email || user.phoneNumber || 'U')[0] || 'U').toUpperCase()}
                  </span>
                )}
              </Link>
              <button onClick={() => signOut()} className="px-3 py-1.5 rounded-lg text-sm border hover:bg-gray-50">
                Sign out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
