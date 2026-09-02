'use client';

import * as React from 'react';
import { DateRangePresets, DateRangeValue } from '@/components/date-range-presets';
import { FailedOnlyToggle } from '@/components/failed-only-toggle';

export function PaymentsListToolbar({
  dateRange,
  onDateRangeChange,
  failedOnly,
  onFailedOnlyChange,
  showFailedOnly = true,
}: {
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;
  failedOnly: boolean;
  onFailedOnlyChange: (checked: boolean) => void;
  showFailedOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <DateRangePresets value={dateRange} onChange={onDateRangeChange} />
      {showFailedOnly ? (
        <FailedOnlyToggle
          checked={failedOnly}
          onCheckedChange={onFailedOnlyChange}
        />
      ) : null}
    </div>
  );
}
