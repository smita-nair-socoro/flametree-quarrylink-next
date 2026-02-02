'use client';

import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  formatLocalDate,
  getRelativeTimePastOrFuture,
} from '@/lib/utils/date';

export interface DateCellProps {
  /** Backend timestamp (UTC, without Z). Parsed as UTC and shown in local time. */
  dateString: string;
  /** Tooltip placement */
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const DateCell: React.FC<DateCellProps> = ({
  dateString,
  side = 'top',
}) => {
  if (!dateString) {
    return <span className="text-muted-foreground">-</span>;
  }
  // Backend sends UTC (no Z); parse as UTC, display in local time, relative from that instant
  const displayDate = formatLocalDate(dateString);
  const relative = getRelativeTimePastOrFuture(dateString);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help font-medium">{displayDate}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <span className="text-sm">{relative}</span>
      </TooltipContent>
    </Tooltip>
  );
};
