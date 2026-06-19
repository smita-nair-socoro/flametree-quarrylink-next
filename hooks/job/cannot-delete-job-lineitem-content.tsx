'use client';

import { TriangleAlert } from 'lucide-react';
import { JobItem } from '@/lib/types/job';

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
  activeDocketIds = [],
}: {
  activeDocketIds?: number[];
}) {
  const docketCount = activeDocketIds.length;
  const docketLink = `/customer-operations/dockets/?docketId=${activeDocketIds.join(',')}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <TriangleAlert className="h-4 w-4 text-[#E7000B] flex-shrink-0" />
          <span className="text-[14px] font-semibold text-[#991B1B]">
            Deletion Blocked
          </span>
        </div>
        <span className="text-[14px] text-[#B91C1C] pl-6">
          This line item cannot be removed because it is attached to active
          dockets in this job.
        </span>
      </div>

      {docketCount > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold text-gray-900">
            Active Dockets Found:
          </span>
          <div className="rounded-md border border-[#FFD6A7] bg-[#FFF3E6] px-4 py-3">
            <a
              href={docketLink}
              className="text-[14px] text-[#155DFC] underline font-medium"
            >
              {docketCount} active {docketCount === 1 ? 'docket' : 'dockets'}
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          Required actions:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            'Invoice, cancel or void all active dockets linked to this line item',
          ].map((item) => (
            <li key={item} className="flex gap-2 text-[14px] text-[#6A7282]">
              <span className="mt-[6px] h-[5px] w-[5px] rounded-full bg-[#6A7282] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
