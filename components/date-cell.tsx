'use client';

import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { formatLocalDate, getRelativeTime } from '@/lib/utils/date';

export interface DateCellProps {
  /** an ISO-8601 timestamp string */
  dateString: string;
  /** Tooltip placement */
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const DateCell: React.FC<DateCellProps> = ({
  dateString,
  side = 'top',
}) => {
  // Handle null, undefined, or empty string
  if (!dateString) {
    return <span className="text-muted-foreground">-</span>;
  }
  // Use unified date formatting utilities for consistent timezone handling
  const displayDate = formatLocalDate(dateString);
  const relative = getRelativeTime(dateString);

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
