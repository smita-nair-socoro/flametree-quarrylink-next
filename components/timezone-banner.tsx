'use client';

import * as React from 'react';
import { Globe, X } from 'lucide-react';
import { useTenantStore } from '@/app/stores/tenant-store';
import { useLocalStorageState } from '@/hooks/use-localstorage';

/** IANA timezone id -> "UTC+10" / "UTC+5:30" style short offset label. */
function getUtcOffsetLabel(timeZoneId: string, date: Date): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value;
    return offset ? offset.replace('GMT', 'UTC') : null;
  } catch {
    return null;
  }
}

/**
 * Warns the user when their browser's timezone offset differs from the
 * tenant account's configured timezone, since displayed times (dockets,
 * schedules, etc.) are rendered in the account's timezone.
 */
export function TimezoneBanner() {
  const tenantTimeZoneId = useTenantStore((s) => s.tenantDetails?.timeZoneId);

  const { visible, browserOffset, tenantOffset } = React.useMemo(() => {
    if (!tenantTimeZoneId) {
      return { visible: false, browserOffset: '', tenantOffset: '' };
    }
    const now = new Date();
    const browserTimeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const browserOffset = getUtcOffsetLabel(browserTimeZoneId, now);
    const tenantOffset = getUtcOffsetLabel(tenantTimeZoneId, now);

    if (!browserOffset || !tenantOffset || browserOffset === tenantOffset) {
      return { visible: false, browserOffset: '', tenantOffset: '' };
    }
    return { visible: true, browserOffset, tenantOffset };
  }, [tenantTimeZoneId]);

  const dismissKey = `${browserOffset}|${tenantOffset}`;
  const [dismissed, setDismissed] = useLocalStorageState<string | null>(
    'timezone-banner-dismissed',
    null,
  );

  if (!visible || dismissed === dismissKey) {
    return null;
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <Globe className="h-4 w-4 shrink-0 text-amber-500" />
      <p className="flex-1 leading-snug">
        Your timezone <span className="font-semibold">{browserOffset}</span>{' '}
        differs from this account&apos;s timezone{' '}
        <span className="font-semibold">{tenantOffset}</span> — displayed
        times may not match your local time.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(dismissKey)}
        aria-label="Dismiss timezone notice"
        className="shrink-0 rounded p-0.5 text-amber-500 transition-colors hover:text-amber-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
