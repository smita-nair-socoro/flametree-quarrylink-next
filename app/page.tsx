'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function HomePage() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect after auth state is known
  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // If we're on the root path, redirect to dashboard
        // Otherwise, stay on the current path (this handles SPA fallback)
        if (pathname === '/') {
          router.replace('/dashboard');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, router, pathname]);

  if (auth.isLoading) {
    return <p>Loading…</p>;
  }

  return null;
}
