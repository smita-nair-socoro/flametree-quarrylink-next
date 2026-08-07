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
import { usePolicyDocumentFormState } from '@/hooks/quote-settings/use-quote-settings-form-state';
import { PolicyDocumentFormSchema } from './schemas/policy-document-form-schema';

type PolicyDocumentFormValues = z.infer<typeof PolicyDocumentFormSchema>;

interface PolicyDocumentFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function PolicyDocumentForm({
  onCancel,
  onSuccess,
  onDirtyChange,
}: Readonly<PolicyDocumentFormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<PolicyDocumentFormValues>({
    resolver: zodResolver(PolicyDocumentFormSchema),
    defaultValues: {
      name: '',
      file: undefined,
    },
  });

  const { currentDocument, isReplacing, isLoadingDetail, isSubmitting, onSubmit } =
    usePolicyDocumentFormState({
      form,
      onDirtyChange,
      onSuccess,
    });

  const selectedFile = form.watch('file');

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
          disabled={isSubmitting || isLoadingDetail}
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

  // Show loading while the current document (if any) is still being fetched
  if (isLoadingDetail) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

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
