'use client';

import { format } from 'date-fns';

export function ScheduleMonthView({ date }: { date: Date }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-6 text-muted-foreground">
      <p className="text-sm text-foreground">
        Monthly Schedule for <span className="font-semibold">{format(date, 'MMMM yyyy')}</span>
      </p>
      <p className="text-sm">Monthly schedule content goes here.</p>
    </div>
  );
}
