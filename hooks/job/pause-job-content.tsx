'use client';
import {
  TriangleAlert,
  Pause,
  Truck,
  CirclePlay,
  CircleStop,
} from 'lucide-react';
import { JobDTO } from '@/lib/types/job';
import { DocketDTO } from '@/lib/types/docket';
import { cn } from '@/lib/utils';
import { TableBadges } from '@/components/table-badges';

export function PauseJobDescription({ job }: { job?: JobDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FFF7ED] rounded-full">
        <span className="flex items-center justify-center">
          <Pause className="h-[20px] w-[20px] text-[#CA3500]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{job?.projectName}</span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-gray-500">{job?.jobNumber}</span>
          {job?.customerDto?.businessName ||
            (job?.customerDto?.contactName && (
              <>
                <span className="text-sm text-gray-500 font-extrabold">·</span>
                <span className="text-sm text-gray-500">
                  {job?.customerDto?.businessName ||
                    job?.customerDto?.contactName}
                </span>
              </>
            ))}
        </div>
      </div>
    </div>
  );
}

export function PauseJobContent({
  activeDockets,
  docketAction,
  onDocketActionChange,
}: {
  activeDockets: DocketDTO[];
  docketAction: 'stop' | 'allow';
  onDocketActionChange: (action: 'stop' | 'allow') => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to pause this job?
      </span>

      {activeDockets.length > 0 && (
        <>
          <div className="border border-[#FEF08A] rounded-md p-4 bg-[#FFFBEB]">
            <div className="flex justify-start gap-2 self-stretch">
              <TriangleAlert className="h-[20px] w-[20px] text-[#CA8A04] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[16px] text-[#854D0E] font-medium">
                  Active Dockets Found
                </span>
                <span className="text-[14px] font-normal text-[#A16207]">
                  This job has {activeDockets.length} assigned docket
                  {activeDockets.length !== 1 ? 's' : ''} with drivers. Choose
                  how to handle them:
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-[#F9FAFB] py-2 px-4 border border-[#E5E5E5]">
            {activeDockets.map((docket) => {
              return (
                <div
                  key={docket.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2 text-[14px]">
                    <Truck className="h-[20px] w-[20px] text-[#6A7282]" />
                    <span className="font-medium">{docket.docketNumber}</span>
                    <span className="text-[#6A7282]">
                      - {docket.driver?.driverName ?? 'John Smith'}
                    </span>
                  </div>
                  <TableBadges names={docket.docketStatus} />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-gray-900">
              Select an action for assigned dockets:
            </span>

            <div
              className={cn(
                'border rounded-md p-3 cursor-pointer transition-colors',
                docketAction === 'stop'
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
              onClick={() => onDocketActionChange('stop')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'stop'
                      ? 'border-red-500'
                      : 'border-gray-300',
                  )}
                >
                  {docketAction === 'stop' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CircleStop className="h-[20px] w-[20px] text-[#E7000B]" />
                    <span className="text-[14px] font-medium text-gray-900">
                      Stop All Dockets
                    </span>
                  </div>
                  <span className="text-[14px] font-normal text-gray-500">
                    Immediately stop all assigned dockets. Drivers will be
                    notified that they have been unassigned.
                  </span>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'border rounded-md p-3 cursor-pointer transition-colors',
                docketAction === 'allow'
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50',
              )}
              onClick={() => onDocketActionChange('allow')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'allow'
                      ? 'border-green-500'
                      : 'border-gray-300',
                  )}
                >
                  {docketAction === 'allow' && (
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CirclePlay className="h-[20px] w-[20px] text-[#008236]" />
                    <span className="text-[14px] font-medium text-gray-900">
                      Allow Drivers to Complete
                    </span>
                  </div>
                  <span className="text-[14px] font-normal text-gray-500">
                    Let assigned drivers finish their current assigned
                    deliveries.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 bg-[#F9FAFB] px-2 py-3 rounded-md">
        <span className="text-[14px] font-medium">When job is paused:</span>
        <ul className="text-[14px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-4">
          {[
            'Job status changes to "Paused"',
            ...(activeDockets.length > 0 && docketAction === 'stop'
              ? [
                  'All Assigned dockets will be Unassigned',
                  'All In Transit dockets will be Stopped',
                ]
              : []),
            'New docket creation is blocked',
            'Can be resumed at any time',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
