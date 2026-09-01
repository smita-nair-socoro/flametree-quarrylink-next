'use client';

import * as React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { JOB_ATTACHMENT_CATEGORY } from '@/lib/types/job-enums';
import {
  AddJobAttachmentContent,
  AddJobAttachmentDescription,
} from '@/hooks/job/add-job-attachment-content';
import { jobAttachmentFormSchema } from '../../schemas/job-attachment-form-schema';
import { useUploadJobAttachment } from '@/lib/api/job';
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

interface AddJobAttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: number;
}

const EMPTY_ATTACHMENT_FORM = {
  category: '' as JOB_ATTACHMENT_CATEGORY | '',
  fileName: '',
  file: null as File | null,
};

export function AddJobAttachmentDialog({
  open,
  onOpenChange,
  jobId,
}: AddJobAttachmentDialogProps) {
  const uploadAttachmentMutation = useUploadJobAttachment();
  const [formState, setFormState] = React.useState(EMPTY_ATTACHMENT_FORM);
  const [fieldErrors, setFieldErrors] = React.useState<AttachmentFieldErrors>(
    {},
  );

  const resetForm = React.useCallback(() => {
    setFormState(EMPTY_ATTACHMENT_FORM);
    setFieldErrors({});
  }, []);

  const handleConfirmAdd = async () => {
    const result = jobAttachmentFormSchema.safeParse({
      category: formState.category,
      fileName: formState.fileName,
      file: formState.file,
    });

    if (!result.success) {
      setFieldErrors(mapSchemaErrors(result.error.issues));
      return;
    }

    if (!jobId) {
      notifyError('Job ID is required to upload an attachment');
      return;
    }

    try {
      await uploadAttachmentMutation.mutateAsync({
        jobId,
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
      description={<AddJobAttachmentDescription />}
      content={
        <AddJobAttachmentContent
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
      closeOnConfirm={false}
      onConfirmAction={() => handleConfirmAdd()}
      customWidth="600px"
    />
  );
}
