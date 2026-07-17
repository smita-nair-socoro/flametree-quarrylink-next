'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Globe, X } from 'lucide-react';
import { useTenantStore } from '@/app/stores/tenant-store';
import { useUserStore } from '@/app/stores/user-store';
import { cn, getLocalStorage, setLocalStorage } from '@/lib/utils';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const DISMISS_STORAGE_PREFIX = 'timezone-banner-dismissed-at';

interface DismissedState {
  dismissedAt: number;
  browserTimezone: string;
  tenantTimezone: string;
}

function shouldShowTimezoneBanner({
  browserTimezone,
  tenantTimezone,
  dismissedState,
}: {
  browserTimezone?: string | null;
  tenantTimezone?: string | null;
  dismissedState?: DismissedState | null;
}) {
  if (!browserTimezone) return false;
  if (!tenantTimezone) return false;
  if (browserTimezone === tenantTimezone) return false;

  if (!dismissedState) return true;

  const dismissedWithin24Hours =
    Date.now() - dismissedState.dismissedAt < TWENTY_FOUR_HOURS;

  const sameTimezonePair =
    dismissedState.browserTimezone === browserTimezone &&
    dismissedState.tenantTimezone === tenantTimezone;

  return !(dismissedWithin24Hours && sameTimezonePair);
}

/**
 * IANA timezone id -> "UTC+10" / "UTC+5:30" style offset label.
 *
 * Uses 'longOffset' (always "+HH:MM") rather than 'shortOffset' - some
 * engines (Safari/WebKit in particular) don't reliably trim zero minutes
 * from 'shortOffset', producing inconsistent labels like "GMT+8" next to
 * "GMT+08:00" for other zones in the same render. Trimming ":00" ourselves
 * from the always-padded 'longOffset' output is deterministic everywhere.
 */
function getUtcOffsetLabel(timeZoneId: string, date: Date): string | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const offset = parts.find((part) => part.type === 'timeZoneName')?.value;
    if (!offset) return null;
    return offset
      .replace('GMT', 'UTC')
      .replace(/:00$/, '')
      .replace(/^(UTC[+-])0(\d)/, '$1$2');
  } catch {
    return null;
  }
}

/** Browser's IANA timezone id, or null if it can't be resolved. */
function getBrowserTimeZoneId(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * Warns the user when their browser's timezone offset differs from the
 * tenant account's configured timezone, since displayed times (dockets,
 * schedules, etc.) are rendered in the account's timezone.
 *
 * Purely client-side: dismissal is stored in localStorage, keyed by the
 * logged-in user's sub so it doesn't leak across accounts on a shared
 * device/browser, and expires after 24h (or sooner, if either timezone in
 * the mismatched pair changes before then).
 */
export function TimezoneBanner({ standalone }: { standalone?: boolean } = {}) {
  const tenantTimeZoneId = useTenantStore((s) => s.tenantDetails?.timeZoneId);
  const userSub = useUserStore((s) => s.user.sub);
  const pathname = usePathname();

  const dismissStorageKey = userSub
    ? `${DISMISS_STORAGE_PREFIX}:${userSub}`
    : null;

  const [dismissedState, setDismissedState] =
    React.useState<DismissedState | null>(null);

  // Re-read on every navigation/reload - picks up an expired dismissal, or
  // one recorded in another tab, without needing a storage event listener.
  React.useEffect(() => {
    setDismissedState(
      dismissStorageKey
        ? getLocalStorage<DismissedState | null>(dismissStorageKey, null)
        : null,
    );
  }, [dismissStorageKey, pathname]);

  // Re-derived on every navigation/reload, not just on mount, since the
  // device timezone may have changed mid-session.
  const { visible, browserOffset, tenantOffset } = React.useMemo(() => {
    const hidden = { visible: false, browserOffset: '', tenantOffset: '' };

    if (!tenantTimeZoneId || !dismissStorageKey) return hidden;

    const browserTimeZoneId = getBrowserTimeZoneId();
    if (!browserTimeZoneId) return hidden;

    const now = new Date();
    const browserOffset = getUtcOffsetLabel(browserTimeZoneId, now);
    const tenantOffset = getUtcOffsetLabel(tenantTimeZoneId, now);
    if (!browserOffset || !tenantOffset) return hidden;

    const show = shouldShowTimezoneBanner({
      browserTimezone: browserOffset,
      tenantTimezone: tenantOffset,
      dismissedState,
    });

    return show
      ? { visible: true, browserOffset, tenantOffset }
      : hidden;
    // pathname forces a recompute on every navigation, since the device
    // timezone can change mid-session without tenantTimeZoneId changing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantTimeZoneId, dismissStorageKey, dismissedState, pathname]);

  if (!visible || !dismissStorageKey) {
    return null;
  }

  const handleDismiss = () => {
    const dismissed: DismissedState = {
      dismissedAt: Date.now(),
      browserTimezone: browserOffset,
      tenantTimezone: tenantOffset,
    };
    setLocalStorage(dismissStorageKey, dismissed);
    setDismissedState(dismissed);
  };

  return (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800',
        standalone && 'my-2',
      )}
    >
      <Globe className="h-4 w-4 shrink-0 text-amber-500" />
      <p className="flex-1 leading-snug">
        Your timezone <span className="font-semibold">{browserOffset}</span>{' '}
        differs from this account&apos;s timezone{' '}
        <span className="font-semibold">{tenantOffset}</span> — displayed
        times may not match your local time.
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss timezone notice"
        className="shrink-0 rounded p-0.5 text-amber-500 transition-colors hover:text-amber-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
