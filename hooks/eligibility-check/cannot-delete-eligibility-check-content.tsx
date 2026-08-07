'use client';

import * as React from 'react';
import { CircleAlert, CircleCheckBig } from 'lucide-react';
import { EligibilityBlockingDependencies } from '@/lib/types/eligibility-check';

interface CannotDeleteEligibilityCheckContentProps {
  blockingDependencies?: EligibilityBlockingDependencies;
  entityLabel: string;
}

function getIds(items: Array<{ id?: number }>): number[] {
  return items
    .map((item) => (typeof item.id === 'number' ? item.id : null))
    .filter((value): value is number => Number.isFinite(value));
}

function renderLinkedCount(
  count: number,
  singularLabel: string,
  pluralLabel: string,
  href?: string,
) {
  if (count === 0) return null;

  const label = count === 1 ? singularLabel : pluralLabel;

  return (
    <div className="text-[14px] text-[#364153] font-normal">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#155DFC] font-medium underline"
        >
          {count} active {label}
        </a>
      ) : (
        <span>
          {count} active {label}
        </span>
      )}
    </div>
  );
}

export function CannotDeleteEligibilityCheckContent({
  blockingDependencies,
  entityLabel,
}: Readonly<CannotDeleteEligibilityCheckContentProps>) {
  const blockingQuotations = blockingDependencies?.blockingQuotations ?? [];
  const blockingJobs = blockingDependencies?.blockingJobs ?? [];
  const blockingDockets = blockingDependencies?.blockingDockets ?? [];

  const blockingQuotationIds = getIds(blockingQuotations);
  const blockingJobIds = getIds(blockingJobs);
  const blockingDocketIds = getIds(blockingDockets);

  const quotationsHref =
    blockingQuotationIds.length > 0
      ? `/customer-operations/quotation?linkedQuotationIds=${encodeURIComponent(
          blockingQuotationIds.join(','),
        )}`
      : undefined;
  const jobsHref =
    blockingJobIds.length > 0
      ? `/customer-operations/jobs?ids=${blockingJobIds.join(',')}`
      : undefined;
  const docketsHref =
    blockingDocketIds.length > 0
      ? `/customer-operations/dockets/?docketId=${blockingDocketIds.join(',')}`
      : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="text-[15px] text-[#364153] font-normal">
        This {entityLabel} cannot be deleted because it has pending business
        activities:
      </div>

      <div className="flex flex-col gap-3">
        <div className="font-medium text-[#101828] text-[14px]">
          Active Usage:
        </div>
        <div className="bg-[#FFF7ED] border border-[#FFD6A7] rounded-md p-3 flex flex-col gap-2">
          {renderLinkedCount(
            blockingQuotations.length,
            'quote',
            'quotes',
            quotationsHref,
          )}
          {renderLinkedCount(blockingJobs.length, 'job', 'jobs', jobsHref)}
          {renderLinkedCount(
            blockingDockets.length,
            'docket',
            'dockets',
            docketsHref,
          )}
        </div>

        <div className="border border-[#BEDBFF] bg-[#EFF6FF] rounded-md p-3">
          <div className="flex justify-start gap-2">
            <CircleAlert className="h-[16px] w-[16px] flex-shrink-0 text-[#155DFC] mt-1" />
            <div className="text-[14px] text-[#193CB8] font-normal">
              Deleting this {entityLabel} now would disrupt ongoing business
              operations.
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="font-medium text-[#101828] text-[14px]">
            Recommended Action:
          </div>
          <div className="text-[#6A7282] text-[14px]">
            Complete these activities first:
          </div>
        </div>
        <div className="border border-[#B9F8CF] rounded-md p-[16.625px] bg-[#F0FDF4]">
          <div className="flex items-start gap-2 self-stretch">
            <CircleCheckBig className="h-[23px] w-[18px] text-[#00A63E] flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <div className="text-[14px] text-[#101828] font-medium">
                Resolve Active Dependencies
              </div>
              <div className="text-[13px] text-[#6A7282] font-normal">
                Remove this {entityLabel} from active quotes, jobs, or dockets
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
