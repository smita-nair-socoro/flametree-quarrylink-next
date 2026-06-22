'use client';

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

function ActiveRecordRow({
  count,
  singularLabel,
  pluralLabel,
  href,
}: {
  count: number;
  singularLabel: string;
  pluralLabel: string;
  href?: string;
}) {
  if (count === 0) return null;
  const label = count === 1 ? singularLabel : pluralLabel;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[14px] font-semibold text-gray-900">
        Active {label.charAt(0).toUpperCase() + label.slice(1)} Found:
      </span>
      <div className="rounded-md border border-[#FFD6A7] bg-[#FFF3E6] px-4 py-3">
        {href ? (
          <a
            href={href}
            className="text-[14px] text-[#155DFC] underline font-medium"
          >
            {count} active {label}
          </a>
        ) : (
          <span className="text-[14px] text-[#364153] font-normal">
            {count} active {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function CannotDeleteEligibilityCheckContent({
  blockingDependencies,
  entityLabel,
}: CannotDeleteEligibilityCheckContentProps) {
  const blockingQuotations = blockingDependencies?.blockingQuotations ?? [];
  const blockingJobs = blockingDependencies?.blockingJobs ?? [];
  const blockingDockets = blockingDependencies?.blockingDockets ?? [];

  const blockingQuotationIds = getIds(blockingQuotations);
  const blockingJobIds = getIds(blockingJobs);
  const blockingDocketIds = getIds(blockingDockets);

  const quotationsHref =
    blockingQuotationIds.length > 0
      ? `/customer-operations/quotation?linkedQuotationIds=${encodeURIComponent(blockingQuotationIds.join(','))}`
      : undefined;
  const jobsHref =
    blockingJobIds.length > 0
      ? `/customer-operations/jobs?jobId=${encodeURIComponent(blockingJobIds.join(','))}`
      : undefined;
  const docketsHref =
    blockingDocketIds.length > 0
      ? `/customer-operations/dockets/?docketId=${encodeURIComponent(blockingDocketIds.join(','))}`
      : undefined;

  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        This {entityLabel} cannot be deleted because it has pending business
        activities.
      </span>

      <ActiveRecordRow
        count={blockingQuotations.length}
        singularLabel="quote"
        pluralLabel="quotes"
        href={quotationsHref}
      />
      <ActiveRecordRow
        count={blockingJobs.length}
        singularLabel="job"
        pluralLabel="jobs"
        href={jobsHref}
      />
      <ActiveRecordRow
        count={blockingDockets.length}
        singularLabel="docket"
        pluralLabel="dockets"
        href={docketsHref}
      />

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-semibold text-gray-900">
          Required actions:
        </span>
        <ul className="flex flex-col gap-1 pl-1">
          {[
            `Remove this ${entityLabel} from active quotes, jobs, or dockets`,
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
