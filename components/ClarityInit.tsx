'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Clarity from '@microsoft/clarity';
import { getTenantId } from '@/lib/utils';
import { claritySafe } from '@/lib/clarity';
import { useConfig } from '@/lib/providers/ConfigProvider';

// Type for npm package init only
interface MicrosoftClarityInit {
  init: (projectId: string) => void;
}

export default function ClarityInit() {
  const pathname = usePathname();
  const { CLARITY_PROJECT_ID: clarityProjectId } = useConfig();

  useEffect(() => {
    if (typeof window === 'undefined' || !clarityProjectId) return;
    (Clarity as MicrosoftClarityInit).init(clarityProjectId);
  }, [clarityProjectId]);

  // On every route change: tag page and tenant (only after window.clarity is ready)
  useEffect(() => {
    if (!pathname) return;

    getTenantId().then((tenantId) => {
      claritySafe((c) => {
        c('set', 'page', pathname);
        c('set', 'tenantId', tenantId ?? '');
      });
    });
  }, [pathname]);

  return null;
}
