'use client';
import { Play } from 'lucide-react';
import { JobDTO } from '@/lib/types/job';

export function ResumeJobDescription({ job }: { job?: JobDTO | null }) {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[42px] h-[42px] justify-center bg-[#F0FDF4] rounded-full">
        <span className="flex items-center justify-center">
          <Play className="h-[20px] w-[20px] text-[#008236]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{job?.projectName}</span>
        <div className="flex justify-start gap-2">
          <span className="text-sm text-[#6A7282]">{job?.jobNumber}</span>
          {job?.customerDto && (
            <>
              <span className="text-sm text-[#6A7282] font-extrabold">·</span>
              <span className="text-sm text-[#6A7282]">
                {job.customerDto.customerType === 'BUSINESS'
                  ? job.customerDto.businessName
                  : job.customerDto.individualContactName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResumeJobContent() {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[14px] font-normal text-gray-700">
        Are you sure you want to resume this job?
      </span>

      <div className="border border-[#B9F8CF] rounded-md p-4 bg-[#F0FDF4]">
        <div className="flex justify-start gap-2 self-stretch">
          <Play className="h-[20px] w-[20px] text-[#008236] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#008236] font-medium">
              Resume Operations
            </span>
            <span className="text-[14px] font-normal text-[#008236]">
              This job will be reactivated and deliveries can continue.
              <br />
              All team members will be notified of the resumption.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          What happens when job is resumed:
        </span>
        <ul className="text-[14px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-4">
          {[
            'Job status changes to "Active" or "In Progress"',
            'Deliveries and docket assignments can continue',
            'Team members receive resumption notifications',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-medium text-[#101828]">
          What remains unchanged:
        </span>
        <ul className="text-[14px] font-normal text-[#6A7282] space-y-1 list-disc list-outside pl-4">
          {[
            'All completed deliveries remain finalised',
            'Historical data and progress preserved',
            'All pricing and configurations maintained',
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
