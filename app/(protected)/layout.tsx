'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  if (auth.isLoading) return <p>Loading…</p>;

  if (!auth.isAuthenticated) {
    useEffect(() => {
      router.replace('/login');
    }, [router, auth]);
    return null;
  }

  return <>{children}</>;
}
