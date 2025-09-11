import { useEffect, useState } from 'react';

interface NavigatorUAData {
  platform?: string;
}
type NavWithUAData = Navigator & {
  userAgentData?: NavigatorUAData;
};

export function useIsMac(): boolean {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const nav = navigator as NavWithUAData;

    if (nav.userAgentData?.platform) {
      setIsMac(nav.userAgentData.platform.toLowerCase().includes('mac'));
      return;
    }

    // Fallback: look for “Mac” in the userAgent string
    //    e.g. "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)…"
    setIsMac(/\bMac/i.test(navigator.userAgent));
  }, []);

  return isMac;
}
