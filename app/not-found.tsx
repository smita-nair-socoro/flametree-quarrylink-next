'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * TEMPORARY (QLINK-2973): Remove the docket deep-link translation below once the
 * backend emits the canonical `/drivers-app/?docketId=...` URL in the driver
 * "View Delivery" emails. Until then, the backend sends links like
 * `/driver-app/dockets/12340` which never match a generated route (static export),
 * so we intercept them here, translate to `/drivers-app/?docketId=...`, and let the
 * protected layout handle auth (redirecting to /login with returnTo when signed out).
 * After the backend fix, this whole file can be deleted (or reverted to a plain 404).
 */
const DOCKET_DEEP_LINK = /\/drivers?-app\/dockets\/(\d+)\/?$/;

export default function NotFound() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    const match = window.location.pathname.match(DOCKET_DEEP_LINK);
    if (match) {
      setIsRedirecting(true);
      router.replace(`/drivers-app/?docketId=${match[1]}`);
    }
  }, [router]);

  if (isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Opening delivery…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h1 className="text-6xl font-bold text-[#0F172A]">404</h1>
        <p className="text-lg font-medium text-[#0F172A]">Page not found</p>
        <p className="text-sm text-[#64748B] max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
