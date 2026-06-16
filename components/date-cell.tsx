'use client';

import React from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  formatCalendarDate,
  parseCalendarDate,
  getRelativeTimePastOrFuture,
} from '@/lib/utils/date';

export interface DateCellProps {
  /** Backend date/datetime string. Displays the YYYY-MM-DD portion only. */
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
  const displayDate = formatCalendarDate(dateString);
  const relative = getRelativeTimePastOrFuture(parseCalendarDate(dateString));

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
