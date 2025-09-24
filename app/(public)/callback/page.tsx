'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Since we're using direct Amplify authentication instead of OAuth flow,
    // this callback page is no longer needed. Redirect to login.
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-lg font-medium">Redirecting to login...</p>
    </div>
  );
}
