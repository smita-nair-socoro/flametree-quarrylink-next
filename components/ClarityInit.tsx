'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Clarity from '@microsoft/clarity';
import { getTenantId } from '@/lib/utils';

// Type definition for Microsoft Clarity
interface MicrosoftClarity {
  init: (projectId: string) => void;
  setTag: (key: string, value: string | string[]) => void;
  identify: (
    customId: string,
    customSessionId?: string,
    customPageId?: string,
    friendlyName?: string
  ) => void;
  consent: (consent?: boolean) => void;
  consentV2: (consentOptions?: {
    ad_Storage: 'granted' | 'denied';
    analytics_Storage: 'granted' | 'denied';
  }) => void;
  upgrade: (reason: string) => void;
  event: (eventName: string) => void;
}

const clarityProjectId = 'v88amv038n';

export default function ClarityInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !clarityProjectId) return;
    (Clarity as MicrosoftClarity).init(clarityProjectId);
  }, []);

  // On every route change: tag page and refresh tenant for filtering/segmentation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const clarity = Clarity as MicrosoftClarity;

    if (pathname) {
      clarity.setTag('page', pathname);
    }

    getTenantId().then((tenantId) => {
      clarity.setTag('tenantId', tenantId ?? '');
    });
  }, [pathname]);

  return null;
}
