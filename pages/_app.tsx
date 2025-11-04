import type { AppProps } from 'next/app';
import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { FirebaseAuthProvider } from '../lib/context/firebase-auth.context';
import { CartProvider } from '../lib/context/cart.context';
import { ToastProvider } from '../lib/context/toast.context';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/globals.css';
import Header from '@/components/Header';
import client from '@/lib/apolloClient';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <FirebaseAuthProvider>
          <ToastProvider>
            <CartProvider>
              <Header />
              <Component {...pageProps} />
            </CartProvider>
          </ToastProvider>
        </FirebaseAuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
