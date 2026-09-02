'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { jobTableAdditionalCount } from '@/lib/utils/job-table-values';

const EMPTY_DISPLAY = '—';

export function JobMultiValueCell({
  values,
  testId,
}: {
  values: string[];
  testId?: string;
}) {
  if (values.length === 0) {
    return (
      <div className="py-2 text-muted-foreground" data-testid={testId}>
        {EMPTY_DISPLAY}
      </div>
    );
  }

  const leading = values[0];
  const additional = jobTableAdditionalCount(values);
  const cell = (
    <div
      className="flex min-w-0 max-w-[11rem] items-center gap-1 py-2"
      data-testid={testId}
      tabIndex={additional > 0 ? 0 : undefined}
    >
      <span className="min-w-0 truncate">{leading}</span>
      {additional > 0 && (
        <Badge
          variant="secondary"
          className="shrink-0 px-1.5 font-normal"
          data-testid="multi-value-badge"
        >
          +{additional}
        </Badge>
      )}
    </div>
  );

  if (additional === 0) {
    return cell;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent variant="white" className="max-w-xs text-left">
        {values.map((value) => (
          <p key={value}>{value}</p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
