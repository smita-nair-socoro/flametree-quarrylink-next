'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSafeRedirectUrl } from '@/lib/utils/redirect-helpers';

export default function CallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // Get redirect URL from sessionStorage (set before redirect) or use default
      const redirectUrl =
        sessionStorage.getItem('oauth_redirect_url') ||
        getSafeRedirectUrl();
      sessionStorage.removeItem('oauth_redirect_url');
      router.replace(redirectUrl);
    } else {
      // No session, redirect to login
      router.replace('/login');
    }
  }, [session, status, router]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">
            Authentication Failed
          </p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">Processing authentication...</p>
        <p className="text-sm text-gray-600 mt-2">
          Please wait while we complete your sign-in.
        </p>
      </div>
    </div>
  );
}
