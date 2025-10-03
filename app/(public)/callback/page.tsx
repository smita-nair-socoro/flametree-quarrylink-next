'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { useAuth } from '@/hooks/use-auth';

export default function CallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function getDefaultRedirectUrl(): string {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectParam = urlParams.get('redirect') || urlParams.get('returnTo');
    
    if (redirectParam) {
      try {
        const url = new URL(redirectParam, window.location.origin);
        if (url.origin === window.location.origin) {
          return redirectParam;
        }
      } catch (error) { console.error('Invalid redirect URL:', redirectParam, error); }
    }
    
    return '/dashboard';
  }

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if there's an error in the URL params (OAuth failure)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setError(errorDescription || 'Authentication failed');
          setTimeout(() => router.replace('/login'), 3000);
          return;
        }

        // Check if user is authenticated after OAuth flow
        const user = await getCurrentUser();
        if (user) {
          // Refresh the auth context
          await refreshUser();
          
          // Get redirect URL from sessionStorage (set before OAuth redirect) or use dynamic default
          const redirectUrl = sessionStorage.getItem('oauth_redirect_url') || getDefaultRedirectUrl();
          sessionStorage.removeItem('oauth_redirect_url'); // Clean up
          
          // Redirect to intended destination
          router.replace(redirectUrl);
        } else {
          // No user found, redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        // If there's an error getting the user, redirect to login
        router.replace('/login');
      }
    };

    handleOAuthCallback();
  }, [router, refreshUser]);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Authentication Failed</p>
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
        <p className="text-sm text-gray-600 mt-2">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
}
