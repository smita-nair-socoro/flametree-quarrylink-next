'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DataTableClient } from '@/components/ui/data-table-client';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { JobAttachmentsQueryOptions } from '@/lib/api/job';
import { JOB_ATTACHMENT_MAX_COUNT } from '@/app/(protected)/customer-operations/jobs/(components)/forms/schemas/job-attachment-form-schema';
import { getJobAttachmentColumns } from '@/app/(protected)/customer-operations/jobs/(components)/(data-tables)/attachment/columns';
import { AddJobAttachmentDialog } from '@/app/(protected)/customer-operations/jobs/(components)/forms/add-job-attachment-dialog';

interface JobAttachmentsSectionProps {
  jobId: number;
}

export function JobAttachmentsSection({ jobId }: JobAttachmentsSectionProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [addAttachmentOpen, setAddAttachmentOpen] = React.useState(false);

  const { data: attachments, isLoading } = useQuery(
    JobAttachmentsQueryOptions(jobId),
  );

  const attachmentTableData = React.useMemo(
    () => (Array.isArray(attachments) ? attachments : []),
    [attachments],
  );

  const count = attachmentTableData.length;
  const atCap = count >= JOB_ATTACHMENT_MAX_COUNT;
  const columns = React.useMemo(
    () => getJobAttachmentColumns(jobId),
    [jobId],
  );

  return (
    <div className="col-span-2 col-start-1 mb-6">
      <Separator className="my-4" />
      <div className="flex flex-col gap-4 mt-6">
        <div
          className={cn(
            isDesktop
              ? 'flex justify-between items-center'
              : 'flex flex-col gap-4',
          )}
        >
          <span className="text-lg font-semibold">Attachments</span>
          <Button
            type="button"
            className="cursor-pointer"
            disabled={isLoading || atCap}
            onClick={() => setAddAttachmentOpen(true)}
          >
            Add Attachment ({count} of {JOB_ATTACHMENT_MAX_COUNT})
          </Button>
        </div>

        <div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
          <DataTableClient
            tableId={`job-attachments-${jobId}`}
            columns={columns}
            data={attachmentTableData}
            simpleTable={true}
            isLoading={isLoading}
            defaultSorting={[{ id: 'fileName', desc: false }]}
          />
        </div>
      </div>

      <AddJobAttachmentDialog
        open={addAttachmentOpen}
        onOpenChange={setAddAttachmentOpen}
        jobId={jobId}
      />
    </div>
  );
}
