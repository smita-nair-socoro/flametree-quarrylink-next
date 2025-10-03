'use client';

import { LoginForm } from './(components)/login-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getSafeRedirectUrl } from '@/lib/utils/redirect-helpers';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = getSafeRedirectUrl(searchParams);
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white lg:flex-1">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      {/* Right side - QuarryLink Illustration (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <img
          src="/quarrylink-login-side-image.png"
          alt="QuarryLink - Quarry Operations Management"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
