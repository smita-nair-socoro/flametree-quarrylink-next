'use client';

import { format } from 'date-fns';

export function ScheduleWeekTrucksView({ date }: { date: Date }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-6 text-muted-foreground">
      <p className="text-sm text-foreground">
        Weekly Truck Schedule for week of <span className="font-semibold">{format(date, 'EEEE, d MMMM yyyy')}</span>
      </p>
      <p className="text-sm">Weekly truck schedule content goes here.</p>
    </div>
  );
}
