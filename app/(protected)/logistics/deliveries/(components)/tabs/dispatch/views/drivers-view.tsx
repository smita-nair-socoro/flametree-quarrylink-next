'use client';

import { format } from 'date-fns';

export function DispatchDriversView({ date }: { date: Date }) {
  return (
    <>
      <div className="border-b py-6.5 bg-white">Filter</div>
      <div className="border-b py-2.5 bg-white">Summary</div>

      <div className="space-y-2 rounded-lg border border-border bg-card p-6 text-muted-foreground mb-5">
        <p className="text-sm text-foreground">
          Dispatch Drivers for{' '}
          <span className="font-semibold">
            {format(date, 'EEEE, d MMMM yyyy')}
          </span>
        </p>
        <p className="text-sm">Driver dispatch content goes here.</p>
      </div>
    </>
  );
}
