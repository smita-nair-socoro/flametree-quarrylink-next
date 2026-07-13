'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { CustomerAttachmentDTO } from '@/lib/types/customer';
import { Trash2 } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { CUSTOMER_ATTACHMENT_CATEGORY_LABELS } from '@/app/(protected)/customer-operations/customers/(components)/forms/schemas/customer-attachment-form-schema';
import { useDeleteCustomerAttachment } from '@/lib/api/customer';

function RemoveCustomerAttachmentDescription({
  attachment,
}: {
  attachment?: CustomerAttachmentDTO | null;
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
            {CUSTOMER_ATTACHMENT_CATEGORY_LABELS[attachment.category] ??
              attachment.category}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RemoveCustomerAttachmentContent() {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-normal text-[#364153]">
        Are you sure you want to remove this attachment from the customer?
      </span>
      <div className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-4">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#E7000B]" />
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium text-[#991B1B]">
              This action cannot be undone
            </span>
            <span className="text-sm text-[#B91C1C]">
              The attachment will be permanently removed from this customer.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useCustomerAttachmentActions(
  customerId: number,
  initialData?: CustomerAttachmentDTO | null,
) {
  const deleteAttachmentMutation = useDeleteCustomerAttachment();
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [attachmentData, setAttachmentData] = React.useState<
    CustomerAttachmentDTO | null | undefined
  >(initialData);

  React.useEffect(() => {
    setAttachmentData(initialData);
  }, [initialData]);

  const handleConfirmRemove = async () => {
    if (!customerId || !attachmentData?.id) return;

    try {
      await deleteAttachmentMutation.mutateAsync({
        customerId,
        attachmentId: attachmentData.id,
      });
      setRemoveOpen(false);
      notifySuccess('Attachment removed successfully');
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to remove attachment');
      setRemoveOpen(false);
    }
  };

  const actions = {
    remove: () => setRemoveOpen(true),
  };

  const confirmDialogs = (
    <ActionDialog
      open={removeOpen}
      onOpenChangeAction={(open) => {
        if (!open) setRemoveOpen(false);
      }}
      title="Remove Attachment"
      description={
        <RemoveCustomerAttachmentDescription attachment={attachmentData} />
      }
      content={<RemoveCustomerAttachmentContent />}
      confirmText="Remove Attachment"
      confirmVariant="destructive"
      confirmCustomColor="#E7000B"
      cancelText="Cancel"
      confirmDisabled={deleteAttachmentMutation.isPending}
      onConfirmAction={() => void handleConfirmRemove()}
    />
  );

  return { actions, confirmDialogs };
}
