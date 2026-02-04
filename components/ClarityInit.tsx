'use client';
import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

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

export default function ClarityInit() {

  useEffect(() => {
    const clarityProjectId = 'v88amv038n';
    console.log('clarityProjectId', clarityProjectId);

    if (clarityProjectId && typeof window !== 'undefined') {
      const clarity = Clarity as MicrosoftClarity;
      console.log('clarity', clarity);
      clarity.init(clarityProjectId);
    } else if (!clarityProjectId) {
      console.warn(
        'Microsoft Clarity project ID not found.'
      );
    }
  }, []);

  return null;
}
