'use client';

import UnassignedDockets from '../cards/unassigned-dockets';
import AssignedDockets from '../cards/assigned-dockets';

export function DispatchTrucksView({ date }: { date: Date }) {
  return (
    <>
      <div className="border-b py-6.5 bg-white">Filter</div>
      <div className="border-b py-2.5 bg-white">Summary</div>
      <div className="grid grid-cols-[1fr_3fr] pt-2 px-4 gap-4">
        <UnassignedDockets date={date} />
        <AssignedDockets date={date} />
      </div>

    </>
  );
}
