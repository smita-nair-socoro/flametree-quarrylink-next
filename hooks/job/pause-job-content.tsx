'use client';
import { TriangleAlert, Pause, CircleCheck, CircleX } from 'lucide-react';
import { JobDTO } from '@/lib/types/job';
import { DocketDTO } from '@/lib/types/docket';
import { cn } from '@/lib/utils';

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
          {job?.customerDto && (
            <>
              <span className="text-sm text-gray-500 font-extrabold">·</span>
              <span className="text-sm text-gray-500">
                {job.customerDto.customerType === 'BUSINESS'
                  ? (job.customerDto.businessName || job?.contactPersonName)
                  : (job.customerDto.individualContactName || job?.contactPersonName)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DocketActionSelector({
  sectionLabel,
  docketCount,
  action,
  onActionChange,
  stopLabel,
  stopDescription,
  allowLabel,
  allowDescription,
}: {
  sectionLabel: string;
  docketCount: number;
  action: 'stop' | 'allow';
  onActionChange: (action: 'stop' | 'allow') => void;
  stopLabel: string;
  stopDescription: string;
  allowLabel: string;
  allowDescription: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          {sectionLabel} ({docketCount})
        </span>
      </div>

      <span className="text-[13px] text-gray-500">
        Select an action for {sectionLabel.toLowerCase()} dockets:
      </span>

      <div
        className={cn(
          'border rounded-md p-3 cursor-pointer transition-colors',
          action === 'stop' ? 'border-red-400' : 'border-gray-200',
        )}
        onClick={() => onActionChange('stop')}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5',
              action === 'stop' ? 'border-red-500' : 'border-gray-300',
            )}
          >
            {action === 'stop' && (
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[#FEF2F2] flex-shrink-0">
                <CircleX className="h-[15px] w-[15px] text-[#E7000B]" />
              </div>
              <span className="text-[14px] font-semibold text-gray-900">{stopLabel}</span>
            </div>
            <span className="text-[13px] font-normal text-gray-500">{stopDescription}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'border rounded-md p-3 cursor-pointer transition-colors',
          action === 'allow' ? 'border-green-400' : 'border-gray-200',
        )}
        onClick={() => onActionChange('allow')}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5',
              action === 'allow' ? 'border-green-500' : 'border-gray-300',
            )}
          >
            {action === 'allow' && (
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-[24px] h-[24px] rounded-full bg-[#ECFDF5] flex-shrink-0">
                <CircleCheck className="h-[15px] w-[15px] text-[#009966]" />
              </div>
              <span className="text-[14px] font-semibold text-gray-900">{allowLabel}</span>
            </div>
            <span className="text-[13px] font-normal text-gray-500">{allowDescription}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PauseJobContent({
  deliveryDockets,
  collectionDockets,
  deliveryDocketAction,
  collectionDocketAction,
  onDeliveryDocketActionChange,
  onCollectionDocketActionChange,
}: {
  deliveryDockets: DocketDTO[];
  collectionDockets: DocketDTO[];
  deliveryDocketAction: 'stop' | 'allow';
  collectionDocketAction: 'stop' | 'allow';
  onDeliveryDocketActionChange: (action: 'stop' | 'allow') => void;
  onCollectionDocketActionChange: (action: 'stop' | 'allow') => void;
}) {
  const totalDockets = deliveryDockets.length + collectionDockets.length;
  const hasAnyDockets = totalDockets > 0;

  const summaryItems: string[] = [
    'Job status changes to "Paused"',
    ...(deliveryDockets.length > 0 && deliveryDocketAction === 'stop'
      ? [
          'All Assigned delivery dockets will be Unassigned',
          'All In Transit delivery dockets will be Stopped',
        ]
      : []),
    'Pending collection dockets will be Cancelled',
    'New docket creation is blocked (delivery and collection)',
    'Can be resumed at any time',
  ];

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to pause this job?
      </span>

      {!hasAnyDockets && (
        <div className="border border-[#FFD6A7] rounded-md p-4 bg-[#FFF3E6]">
          <div className="flex justify-start gap-2 self-stretch">
            <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="text-[16px] text-[#CA3500] font-medium">
                Business Impact
              </span>
              <span className="text-[14px] font-normal text-[#9F2D00]">
                Pausing this job will prevent new docket creation, and
                automatically cancel any unassigned dockets.
              </span>
            </div>
          </div>
        </div>
      )}

      {hasAnyDockets && (
        <>
          <div className="border border-[#FEF08A] rounded-md p-4 bg-[#FFFBEB]">
            <div className="flex justify-start gap-2 self-stretch">
              <TriangleAlert className="h-[20px] w-[20px] text-[#CA8A04] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#854D0E] font-medium">
                  Active Dockets Found
                </span>
                <span className="text-[13px] font-normal text-[#A16207]">
                  This job has {totalDockets} active docket{totalDockets !== 1 ? 's' : ''}
                  {deliveryDockets.length > 0 && collectionDockets.length > 0
                    ? ` — ${deliveryDockets.length} delivery and ${collectionDockets.length} collection`
                    : deliveryDockets.length > 0
                      ? ` — ${deliveryDockets.length} delivery`
                      : ` — ${collectionDockets.length} collection`}
                  . Choose how to handle them:
                </span>
              </div>
            </div>
          </div>

          {deliveryDockets.length > 0 && (
            <DocketActionSelector
              sectionLabel="Delivery Dockets"
              docketCount={deliveryDockets.length}
              action={deliveryDocketAction}
              onActionChange={onDeliveryDocketActionChange}
              stopLabel="Stop All Delivery Dockets"
              stopDescription="Immediately stop all assigned delivery dockets. Drivers will be notified that they have been unassigned."
              allowLabel="Allow Drivers to Complete"
              allowDescription="Let assigned drivers finish their current assigned deliveries."
            />
          )}

          {collectionDockets.length > 0 && (
            <DocketActionSelector
              sectionLabel="Collection Dockets"
              docketCount={collectionDockets.length}
              action={collectionDocketAction}
              onActionChange={onCollectionDocketActionChange}
              stopLabel="Stop Active Collection Dockets"
              stopDescription="Move preparing and ready dockets into pending."
              allowLabel="Allow Active Collections to Complete"
              allowDescription="Let Preparing and Ready dockets continue to completion. Block new collection dockets only."
            />
          )}
        </>
      )}

      <div className="flex flex-col gap-2 bg-[#F9FAFB] px-3 py-3 rounded-md">
        <span className="text-[13px] font-bold text-gray-900">When job is paused:</span>
        <ul className="text-[13px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-4">
          {summaryItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
