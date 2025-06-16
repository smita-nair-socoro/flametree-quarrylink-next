'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { Spinner } from '@/components/ui/spinner';

export default function CallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.error) {
        console.error('OIDC error', auth.error);
      } else if (auth.isAuthenticated) {
        router.replace('/');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, router]);

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center space-x-2">
        <Spinner className="h-8 w-8 animate-spin" />
        <span className="text-lg font-medium">Signing you in…</span>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-red-600">Error: {auth.error.message}</p>
      </div>
    );
  }

  return null;
}
