'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { Spinner } from '@/components/ui/spinner';
import { notifySuccess } from '@/lib/toast';

export default function CallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.error) {
        console.error('OIDC error', auth.error);
      } else if (auth.isAuthenticated) {
        notifySuccess(`Welcome Back ${auth.user?.profile.email}`, {
          dismissible: true,
        });
        router.replace('/');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth.user, router]);

  // Show loading spinner while authentication is processing
  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center space-x-2">
        <Spinner className="h-8 w-8 animate-spin" />
        <span className="text-lg font-medium">Signing you in…</span>
      </div>
    );
  }

  // Show error if authentication failed
  if (auth.error) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col space-y-4">
        <p className="text-red-600 text-center">Authentication Error</p>
        <p className="text-sm text-gray-600 text-center">
          {auth.error.message}
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // Debug: Show current auth state if not authenticated and not loading
  if (!auth.isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col space-y-4">
        <p className="text-yellow-600 text-center">
          Debug: Authentication State
        </p>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Loading: {auth.isLoading ? 'true' : 'false'}</p>
          <p>Authenticated: {auth.isAuthenticated ? 'true' : 'false'}</p>
          <p>Error: {auth.error ? (auth.error as Error).message : 'none'}</p>
          <p>User: {auth.user ? 'present' : 'null'}</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return null;
}
