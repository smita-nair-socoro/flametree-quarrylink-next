'use client';

import { format } from 'date-fns';
import { ScheduleFilter } from './schedule-filter';


type ViewType = 'trucks' | 'drivers';

export function ScheduleWeekView({ date, viewType, onDateChange }: { date: Date, viewType: ViewType, onDateChange?: (date: Date) => void }) {
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden">
      <ScheduleFilter viewType={viewType} />
      {onDateChange && (
        <span>Implement this week schedule</span>
      )}
      {/* Fixed top bar */}
      <div className="border-b pl-6 py-2.5 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-[#64748B]">
            {format(date, 'EEE dd MMM').toUpperCase()}
          </span>
          <div className="border bg-green-50 border-green-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">13/17</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Assigned</span>
          </div>
          <div className="border bg-blue-50 border-blue-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Trucks booked this month</span>
          </div>
          <div className="border bg-purple-50 border-purple-800 rounded-xl px-3 py-1 items-center flex gap-1">
            <span className="text-[12px] font-semibold tracking-wider">2</span>{" "}
            <span className="text-[12px] font-medium text-gray-700 tracking-wider">Drivers on trips</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        <div className="flex-1 overflow-y-auto bg-white my-5 mx-3 rounded-xl border border-gray-300 shadow-md">
          <div className="mb-6">
            <div className="bg-[#FAF5FF] border-t border-[#EDE9FE] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#4C1D95]">View only</h3>
              <p className="text-xs text-[#6D28D9] mt-0.5">
                Use Dispatch to assign or move dockets. Click a day to focus the date; click a docket chip for full details.
              </p>
            </div>
          </div>

          <div>Weekly Calendar</div>
        </div>

        {/* Fixed right panel — sticks to viewport height, scrolls internally */}
        {/* {
          selectedDocket && (
            <div className="w-[23vw] shrink-0 border-l border-[#E2E8F0] bg-white shadow-sm overflow-y-auto flex flex-col">
              <DocketDetailsPanel
                docket={selectedDocket}
                onClose={() => setSelectedDocketId(undefined)}
                onUnassign={handleUnassign}
              />
            </div>
          )
        } */}
      </div >
    </div >
  );
}