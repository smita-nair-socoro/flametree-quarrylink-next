'use client';

import * as React from 'react';
import { TableBadges } from '@/components/table-badges';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AccountingSyncDisplayStatus,
  toAccountingSyncDisplay,
} from '@/lib/utils/accounting-sync';

type AccountingSyncBadgeProps = {
  status?: string | null;
  failureReason?: string | null;
  onRetry?: () => void;
  retrying?: boolean;
};

export function AccountingSyncBadge({
  status,
  failureReason,
  onRetry,
  retrying,
}: AccountingSyncBadgeProps) {
  const display = toAccountingSyncDisplay(status);
  const badgeName =
    display === 'NOT_SYNCED' ? 'NOT SYNCED' : display;

  return (
    <div className="flex flex-col items-start gap-1 py-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <TableBadges names={[badgeName]} visibleCount={1} />
          </div>
        </TooltipTrigger>
        {display === 'FAILED' && failureReason ? (
          <TooltipContent className="max-w-xs">
            <p>{failureReason}</p>
          </TooltipContent>
        ) : null}
      </Tooltip>
      {display === 'FAILED' && onRetry ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          disabled={retrying}
          onClick={onRetry}
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function isFailedAccountingSync(
  status?: AccountingSyncDisplayStatus | string | null,
): boolean {
  return toAccountingSyncDisplay(status) === 'FAILED';
}
