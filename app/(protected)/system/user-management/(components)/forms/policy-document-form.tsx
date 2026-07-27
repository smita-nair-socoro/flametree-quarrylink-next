'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormDialogFooter } from '@/components/form-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { PolicyDocumentFormSchema } from './schemas/policy-document-form-schema';
import { PolicyDocumentItem } from '@/lib/types/terms-conditions';
import {
  useCreatePolicyDocument,
  useUpdatePolicyDocument,
} from '@/lib/api/quote-profile-content';

type PolicyDocumentFormValues = z.infer<typeof PolicyDocumentFormSchema>;

interface PolicyDocumentFormProps {
  currentDocument?: PolicyDocumentItem;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function PolicyDocumentForm({
  currentDocument,
  onCancel,
  onSuccess,
  onDirtyChange,
}: Readonly<PolicyDocumentFormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isReplacing = Boolean(currentDocument);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createPolicyDocument = useCreatePolicyDocument();
  const updatePolicyDocument = useUpdatePolicyDocument();
  const isSubmitting =
    createPolicyDocument.isPending || updatePolicyDocument.isPending;

  const form = useForm<PolicyDocumentFormValues>({
    resolver: zodResolver(PolicyDocumentFormSchema),
    defaultValues: {
      name: currentDocument?.name ?? '',
      file: undefined,
    },
  });

  const selectedFile = form.watch('file');

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const onSubmit = (values: PolicyDocumentFormValues) => {
    if (!values.file) return;

    const metadata = { name: values.name, defaultItem: true };
    const file = values.file;

    if (currentDocument) {
      updatePolicyDocument.mutate(
        { id: currentDocument.id, metadata, file },
        {
          onSuccess: () => {
            notifySuccess(`"${values.name}" updated.`);
            onSuccess?.();
          },
          onError: (err) => notifyError(extractErrorMessage(err)),
        },
      );
    } else {
      createPolicyDocument.mutate(
        { metadata, file },
        {
          onSuccess: () => {
            notifySuccess(`"${values.name}" uploaded.`);
            onSuccess?.();
          },
          onError: (err) => notifyError(extractErrorMessage(err)),
        },
      );
    }
  };

  const submitLabel = isReplacing ? 'Replace Document' : 'Upload Document';
  const submittingLabel = isReplacing ? 'Replacing...' : 'Uploading...';

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          form="policy-document-form"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    ) : null,
  );

  return (
    <Form {...form}>
      <form
        id="policy-document-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {currentDocument && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Current document: {currentDocument.name} (
            {currentDocument.originalFileName})
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Standard Supply Terms 2026"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>PDF file</FormLabel>
              <FormControl>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      form.setValue('file', file, { shouldValidate: true });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2.5 text-sm hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    {selectedFile
                      ? selectedFile.name
                      : isReplacing
                        ? 'Choose Replacement PDF'
                        : 'Choose PDF'}
                  </button>
                </div>
              </FormControl>
              <p className="text-xs text-muted-foreground">
                PDF only, max 10 MB
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isDesktop && (
          <div className="flex flex-col gap-3">
            <Button
              form="policy-document-form"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  {submittingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}