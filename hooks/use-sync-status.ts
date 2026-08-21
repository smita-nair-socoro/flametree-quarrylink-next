'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SyncStatusResponse } from '@/lib/types/sync';

interface UseSyncStatusOptions {
  /** Query key prefix for the sync status query itself. */
  queryKey: readonly unknown[];
  /** Function that fetches the sync status from the API. */
  fetchFn: () => Promise<SyncStatusResponse>;
  /** Query keys to invalidate (auto-refresh data) when sync completes. */
  invalidateKeys?: readonly (readonly unknown[])[];
  /** Polling interval in ms while sync is IN_PROGRESS. Default 30000 (30s). */
  pollIntervalMs?: number;
  /** How long to keep showing COMPLETED/FAILED after the sync finishes. Default 10s. */
  completionDismissMs?: number;
}

/**
 * Hook that manages sync status polling with page-refresh resilience.
 *
 * Behaviour:
 * - On mount, always fetches the current sync status (so a page refresh
 *   during an in-progress sync will re-detect it and show the progress bar).
 * - Polls every `pollIntervalMs` while the state is IN_PROGRESS.
 * - Stops polling once the state is IDLE / COMPLETED / FAILED.
 * - When the sync transitions from IN_PROGRESS → COMPLETED or FAILED,
 *   invalidates the supplied `invalidateKeys` so the page data auto-refreshes.
 * - Exposes `syncStatus` (the current status) and `wasInProgress` (true if
 *   the sync was observed as IN_PROGRESS during this session — used to decide
 *   whether to show the COMPLETED/FAILED bar vs hiding it on a fresh page load).
 * - `triggerSync()` should be called when the user clicks the sync button;
 *   it sets `wasInProgress` so the completion bar will be shown.
 */
export function useSyncStatus({
  queryKey,
  fetchFn,
  invalidateKeys,
  pollIntervalMs = 30_000,
  completionDismissMs = 10_000,
}: UseSyncStatusOptions) {
  const queryClient = useQueryClient();

  // Track whether we've seen IN_PROGRESS during this session. This distinguishes
  // "sync completed while we were watching" (show the green bar) from
  // "page loaded and sync was already completed" (don't show the bar).
  const [wasInProgress, setWasInProgress] = React.useState(false);
  const prevStateRef = React.useRef<SyncStatusResponse['state'] | undefined>(undefined);

  const { data: syncStatus } = useQuery({
    queryKey,
    queryFn: fetchFn,
    // Always enabled — we need to check on page load even if the user
    // hasn't clicked sync yet (the sync might have been started in a
    // previous session and still be running).
    enabled: true,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === 'IN_PROGRESS' ? pollIntervalMs : false;
    },
    // Keep previous data while refetching to avoid flicker.
    placeholderData: (prev) => prev,
  });

  // Track state transitions.
  React.useEffect(() => {
    const currentState = syncStatus?.state;
    const prevState = prevStateRef.current;
    prevStateRef.current = currentState;

    if (currentState === 'IN_PROGRESS') {
      setWasInProgress(true);
    }

    // When sync transitions from IN_PROGRESS → COMPLETED or FAILED,
    // invalidate the data queries so the page auto-refreshes.
    if (
      prevState === 'IN_PROGRESS' &&
      (currentState === 'COMPLETED' || currentState === 'FAILED')
    ) {
      if (invalidateKeys) {
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: [...key] });
        }
      }
    }
  }, [syncStatus, queryClient, invalidateKeys]);

  // Reset wasInProgress after the completion bar has been shown long enough.
  React.useEffect(() => {
    if (
      wasInProgress &&
      (syncStatus?.state === 'COMPLETED' || syncStatus?.state === 'FAILED')
    ) {
      const timer = setTimeout(() => {
        setWasInProgress(false);
      }, completionDismissMs);
      return () => clearTimeout(timer);
    }
  }, [wasInProgress, syncStatus, completionDismissMs]);

  // Called when the user clicks the sync button.
  const triggerSync = React.useCallback(() => {
    setWasInProgress(true);
  }, []);

  return {
    syncStatus,
    wasInProgress,
    triggerSync,
  };
}
