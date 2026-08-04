'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { ExternalLinkFormSchema } from './schemas/external-link-form-schema';
import {
  ExternalLinkDetailQueryOptions,
  useCreateExternalLink,
  useUpdateExternalLink,
} from '@/lib/api/quote-profile-content';

type ExternalLinkFormValues = z.infer<typeof ExternalLinkFormSchema>;

interface ExternalLinkFormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function ExternalLinkForm({
  id,
  onCancel,
  onSuccess,
  onDirtyChange,
}: Readonly<ExternalLinkFormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);

  const { data: editingItem, isPending: isLoadingDetail } = useQuery(
    ExternalLinkDetailQueryOptions(id ?? 0, isEditing),
  );

  const createExternalLink = useCreateExternalLink();
  const updateExternalLink = useUpdateExternalLink();
  const isSubmitting =
    createExternalLink.isPending || updateExternalLink.isPending;

  const form = useForm<ExternalLinkFormValues>({
    resolver: zodResolver(ExternalLinkFormSchema),
    defaultValues: {
      name: '',
      url: '',
      defaultItem: false,
    },
  });

  React.useEffect(() => {
    if (isEditing && editingItem) {
      form.reset({
        name: editingItem.name,
        url: editingItem.externalUrl,
        defaultItem: editingItem.defaultItem,
      });
    }
  }, [isEditing, editingItem, form]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const onSubmit = (values: ExternalLinkFormValues) => {
    const data = {
      name: values.name,
      externalUrl: values.url,
      externalLinkText: values.name,
      defaultItem: values.defaultItem,
    };
    const onSettled = {
      onSuccess: () => {
        notifySuccess(
          isEditing ? `"${values.name}" updated.` : `"${values.name}" added.`,
        );
        onSuccess?.();
      },
      onError: (err: unknown) => notifyError(extractErrorMessage(err)),
    };
    if (isEditing && id) {
      updateExternalLink.mutate({ id, data }, onSettled);
    } else {
      createExternalLink.mutate(data, onSettled);
    }
  };

  const submitLabel = isEditing ? 'Save Changes' : 'Add Link';
  const isLoading = isEditing && isLoadingDetail;

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
          form="external-link-form"
          type="submit"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    ) : null,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        id="external-link-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display label</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Credit Policy (SharePoint)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://company.sharepoint.com/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultItem"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border border-[#E4E4E7] bg-[#F4F4F54D] px-3 py-2.5 text-[#09090B]">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal text-[#09090B]">
                Attach to new quotes by default
              </FormLabel>
            </FormItem>
          )}
        />
        {!isDesktop && (
          <div className="flex flex-col gap-3">
            <Button
              form="external-link-form"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Saving...
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
