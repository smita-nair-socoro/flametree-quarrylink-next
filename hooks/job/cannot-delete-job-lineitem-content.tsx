'use client';

import { TriangleAlert } from 'lucide-react';
import { JobItem } from '@/lib/types/job';

interface CannotDeleteJobLineItemContentProps {
  blockingDocketIds?: number[];
}

export function CannotDeleteJobLineItemDescription({
  jobItem,
}: {
  jobItem?: JobItem | null;
}) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#FEF2F2] rounded-md flex-shrink-0">
        <span className="flex items-center justify-center">
          <TriangleAlert className="h-[20px] w-[20px] text-[#E7000B]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">
          {jobItem?.product?.productName ?? ''}
        </span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-[#6A7282]">
            {jobItem?.product?.productCode ?? ''}
          </span>
          {jobItem?.quarrySupplierName && (
            <>
              <span className="text-sm text-[#6A7282] font-extrabold">·</span>
              <span className="text-sm text-[#6A7282]">
                {jobItem.quarrySupplierName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CannotDeleteJobLineItemContent({
  blockingDocketIds = [],
}: Readonly<CannotDeleteJobLineItemContentProps>) {
  const docketsHref = `/customer-operations/dockets/?ids=${blockingDocketIds.join(',')}`;
  const docketLabel = blockingDocketIds.length === 1 ? 'docket' : 'dockets';

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        This line item cannot be removed because it is attached to active
        dockets in this job.
      </span>

      <div className="border border-[#FFD6A7] rounded-md p-4 bg-[#FFF7ED]">
        <div className="flex justify-start gap-2 self-stretch">
          <TriangleAlert className="h-[20px] w-[20px] text-[#F54900] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#F54900] font-medium">
              Active Dockets Found
            </span>
            {blockingDocketIds.length > 0 && (
              <a
                href={docketsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#155DFC] font-medium underline"
              >
                {blockingDocketIds.length} active {docketLabel}
              </a>
            )}
            <span className="text-[14px] font-normal text-[#CA3500]">
              Line items can only be removed when there are no active dockets
              associated with them. Invoice, cancel or void the active dockets
              first.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-[#101828]">
          To remove this line item:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          <li className="flex gap-2 text-[14px] text-[#6A7282]">
            <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
            Invoice, cancel or void all active dockets linked to this line item
          </li>
        </ul>
      </div>
    </div>
  );
}
