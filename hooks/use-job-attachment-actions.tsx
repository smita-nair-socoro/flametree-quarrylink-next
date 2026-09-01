'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { JobAttachmentDTO } from '@/lib/types/job';
import { Trash2 } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { JOB_ATTACHMENT_CATEGORY_LABELS } from '@/app/(protected)/customer-operations/jobs/(components)/forms/schemas/job-attachment-form-schema';
import { useDeleteJobAttachment } from '@/lib/api/job';
import { downloadJobAttachment } from '@/lib/utils/job-attachment-helper';

function RemoveJobAttachmentDescription({
  attachment,
}: {
  attachment?: JobAttachmentDTO | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FFE2E2]">
        <Trash2 className="h-5 w-5 text-[#E7000B]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-[#101828]">
          {attachment?.fileName ?? 'Unknown file'}
        </span>
        {attachment?.category ? (
          <span className="text-sm text-[#6A7282]">
            {JOB_ATTACHMENT_CATEGORY_LABELS[attachment.category] ??
              attachment.category}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RemoveJobAttachmentContent() {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-normal text-[#364153]">
        Are you sure you want to delete this attachment from the job?
      </span>
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E7000B]" />
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-[#991B1B]">
              This action cannot be undone
            </span>
            <span className="text-sm text-[#B91C1C]">
              The attachment will be permanently removed from this job.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useJobAttachmentActions(
  jobId: number,
  initialData?: JobAttachmentDTO | null,
) {
  const deleteAttachmentMutation = useDeleteJobAttachment();
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [attachmentData, setAttachmentData] = React.useState<
    JobAttachmentDTO | null | undefined
  >(initialData);

  React.useEffect(() => {
    setAttachmentData(initialData);
  }, [initialData]);

  const handleConfirmRemove = async () => {
    if (!jobId || !attachmentData?.id) return;

    try {
      await deleteAttachmentMutation.mutateAsync({
        jobId,
        attachmentId: attachmentData.id,
      });
      setRemoveOpen(false);
      notifySuccess('Attachment deleted successfully');
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to delete attachment');
      setRemoveOpen(false);
    }
  };

  const actions = {
    download: () => {
      if (!attachmentData) return;
      void downloadJobAttachment(jobId, attachmentData);
    },
    remove: () => setRemoveOpen(true),
  };

  const confirmDialogs = (
    <ActionDialog
      open={removeOpen}
      onOpenChangeAction={(open) => {
        if (!open) setRemoveOpen(false);
      }}
      title="Delete Attachment"
      description={
        <RemoveJobAttachmentDescription attachment={attachmentData} />
      }
      content={<RemoveJobAttachmentContent />}
      confirmText="Delete Attachment"
      confirmVariant="destructive"
      confirmCustomColor="#E7000B"
      cancelText="Cancel"
      confirmDisabled={deleteAttachmentMutation.isPending}
      onConfirmAction={() => void handleConfirmRemove()}
    />
  );

  return { actions, confirmDialogs };
}
