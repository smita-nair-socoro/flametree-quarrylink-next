'use client';

import React from 'react';
import { parseISO, formatDistanceToNow, format } from 'date-fns';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

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
  const date = parseISO(dateString);

  const displayDate = format(date, 'dd MMM yyyy');

  const relative = formatDistanceToNow(date, { addSuffix: true });

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
