'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

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

  if (auth.isLoading) return <p>Signing you in…</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;
  return null;
}
