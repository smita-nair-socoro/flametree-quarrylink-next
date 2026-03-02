'use client';
import {
  TriangleAlert,
  Pause,
  Truck,
  CircleX,
  CircleCheck,
} from 'lucide-react';
import { JobDetails } from '@/lib/types/job';
import { Docket } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import { cn } from '@/lib/utils';

function getDocketStatusStyle(status: DOCKET_STATUS): {
  label: string;
  className: string;
} {
  switch (status) {
    case DOCKET_STATUS.IN_TRANSIT:
      return { label: 'IN TRANSIT', className: 'bg-blue-100 text-blue-700' };
    case DOCKET_STATUS.ASSIGNED:
      return { label: 'ASSIGNED', className: 'bg-slate-100 text-slate-600' };
    default:
      return { label: status, className: 'bg-gray-100 text-gray-600' };
  }
}

export function PauseJobContent({
  job,
  activeDockets,
  docketAction,
  onDocketActionChange,
}: {
  job?: JobDetails | null;
  activeDockets: Docket[];
  docketAction: 'stop' | 'allow';
  onDocketActionChange: (action: 'stop' | 'allow') => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-start items-center gap-2">
        <div className="flex w-[42px] h-[42px] justify-center bg-[#FFF7ED] rounded-md">
          <span className="flex items-center justify-center">
            <Pause className="h-[20px] w-[20px] text-[#CA3500]" />
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{job?.projectName}</span>
          <div className="flex justify-start gap-2">
            <span className="text-sm text-gray-500">{job?.jobNumber}</span>
            {job?.customerName && (
              <>
                <span className="text-sm text-gray-500 font-extrabold">·</span>
                <span className="text-sm text-gray-500">{job.customerName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to pause this job?
      </span>

      {activeDockets.length > 0 && (
        <>
          <div className="border border-amber-200 rounded-md p-4 bg-amber-50">
            <div className="flex justify-start gap-2 self-stretch">
              <TriangleAlert className="h-[20px] w-[20px] text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[16px] text-amber-700 font-medium">
                  Active Dockets Found
                </span>
                <span className="text-[14px] font-normal text-amber-600">
                  This job has {activeDockets.length} assigned docket
                  {activeDockets.length !== 1 ? 's' : ''} with drivers. Choose
                  how to handle them:
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-[#F3F4F6] py-2 px-4">
            <div className="divide-y divide-[#E5E7EB]">
              {activeDockets.map((docket) => {
                const statusStyle = getDocketStatusStyle(docket.status);
                return (
                  <div
                    key={docket.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-2 text-[14px] text-gray-700">
                      <Truck className="h-[20px] w-[20px] text-gray-400" />
                      <span className="font-medium">{docket.docketNumber}</span>
                      {docket.contactName && (
                        <span className="text-gray-500">
                          - {docket.contactName}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded',
                        statusStyle.className,
                      )}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                );
              })}
            </div>
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
                    'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'stop'
                      ? 'border-red-500'
                      : 'border-gray-300',
                  )}
                >
                  {docketAction === 'stop' && (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CircleX className="h-[20px] w-[20px] text-red-500" />
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
                    'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    docketAction === 'allow'
                      ? 'border-green-500'
                      : 'border-gray-300',
                  )}
                >
                  {docketAction === 'allow' && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-[20px] w-[20px] text-green-500" />
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

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-gray-900">
          When job is paused:
        </span>
        <ul className="text-[14px] font-normal text-gray-600 space-y-1 list-disc list-outside pl-5">
          {[
            'Job status changes to "Paused"',
            'All Assigned dockets will be Unassigned',
            'All In Transit dockets will be Stopped',
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
