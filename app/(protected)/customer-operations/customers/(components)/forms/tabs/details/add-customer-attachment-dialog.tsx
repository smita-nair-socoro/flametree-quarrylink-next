'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import {
  CUSTOMER_ATTACHMENT_CATEGORY,
} from '@/lib/types/customer-enums';
import {
  AddCustomerAttachmentContent,
  AddCustomerAttachmentDescription,
} from '@/hooks/customer/add-customer-attachment-content';
import { customerAttachmentFormSchema } from '../../schemas/customer-attachment-form-schema';
import { useUploadCustomerAttachment } from '@/lib/api/customer';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

type AttachmentFieldErrors = Partial<
  Record<'category' | 'fileName' | 'file', string>
>;

function mapSchemaErrors(
  issues: { path: PropertyKey[]; message: string }[],
): AttachmentFieldErrors {
  const errors: AttachmentFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (field === 'category' || field === 'fileName' || field === 'file') {
      errors[field] = issue.message;
    }
  }

  return errors;
}

interface AddCustomerAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: number;
}

const EMPTY_ATTACHMENT_FORM = {
  category: '' as CUSTOMER_ATTACHMENT_CATEGORY | '',
  fileName: '',
  file: null as File | null,
};

export function AddCustomerAttachmentDialog({
  open,
  onOpenChange,
  customerId,
}: AddCustomerAttachmentDialogProps) {
  const uploadAttachmentMutation = useUploadCustomerAttachment();
  const [formState, setFormState] = React.useState(EMPTY_ATTACHMENT_FORM);
  const [fieldErrors, setFieldErrors] = React.useState<AttachmentFieldErrors>(
    {},
  );

  const resetForm = React.useCallback(() => {
    setFormState(EMPTY_ATTACHMENT_FORM);
    setFieldErrors({});
  }, []);

  const handleConfirmAdd = async () => {
    const result = customerAttachmentFormSchema.safeParse({
      category: formState.category,
      fileName: formState.fileName,
      file: formState.file,
    });

    if (!result.success) {
      setFieldErrors(mapSchemaErrors(result.error.issues));
      return;
    }

    if (!customerId) {
      notifyError('Customer ID is required to upload an attachment');
      return;
    }

    try {
      await uploadAttachmentMutation.mutateAsync({
        customerId,
        category: result.data.category,
        fileName: result.data.fileName,
        file: result.data.file,
      });
      notifySuccess('Attachment uploaded successfully');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to upload attachment');
    }
  };

  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
        }
        onOpenChange(nextOpen);
      }}
      title="Add Attachment"
      description={<AddCustomerAttachmentDescription />}
      content={
        <AddCustomerAttachmentContent
          category={formState.category}
          onCategoryChange={(category) => {
            setFieldErrors((current) => ({ ...current, category: undefined }));
            setFormState((current) => ({ ...current, category }));
          }}
          fileName={formState.fileName}
          onFileNameChange={(fileName) => {
            setFieldErrors((current) => ({ ...current, fileName: undefined }));
            setFormState((current) => ({ ...current, fileName }));
          }}
          file={formState.file}
          onFileChange={(file) => {
            setFieldErrors((current) => ({ ...current, file: undefined }));
            setFormState((current) => ({ ...current, file }));
          }}
          fieldErrors={fieldErrors}
        />
      }
      confirmText="Add Attachment"
      confirmCustomColor="#8E51FF"
      cancelText="Cancel"
      confirmDisabled={uploadAttachmentMutation.isPending}
      onConfirmAction={() => void handleConfirmAdd()}
      customWidth="600px"
    />
  );
}
