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
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const absolute = format(date, 'PPpp');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help font-medium">{relative}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <span className="whitespace-nowrap">{absolute}</span>
      </TooltipContent>
    </Tooltip>
  );
};
