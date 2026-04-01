'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

import { useQuery } from '@tanstack/react-query';
import { UserDetailQueryOptions } from '@/lib/api/user';

export default function HomePage() {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data: currentUser } = useQuery(
    UserDetailQueryOptions(auth.user?.userId || ''),
  );

  // Redirect after auth state is known
  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // If we're on the root path, redirect to dashboard
        // Otherwise, stay on the current path (this handles SPA fallback)
        if (pathname === '/') {
          // Wait for currentUser to be loaded before deciding
          if (currentUser) {
            const isDriver = currentUser.groups?.includes('driver') || false;

            if (isDriver) {
              router.replace('/drivers-app');
            } else {
              router.replace('/customer-operations/customers');
            }
          }
        }
      } else {
        router.replace('/login');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, currentUser, router, pathname]);

  return <div>Loading...</div>;
}
