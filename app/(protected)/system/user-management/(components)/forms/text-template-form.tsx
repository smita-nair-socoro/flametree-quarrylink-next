'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTextTemplateFormState } from '@/hooks/quote-settings/use-quote-settings-form-state';
import { TextTemplateFormSchema } from './schemas/text-template-form-schema';

type TextTemplateFormValues = z.infer<typeof TextTemplateFormSchema>;

interface TextTemplateFormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function TextTemplateForm({
  id,
  onCancel,
  onSuccess,
  onDirtyChange,
}: Readonly<TextTemplateFormProps>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(id);

  const form = useForm<TextTemplateFormValues>({
    resolver: zodResolver(TextTemplateFormSchema),
    defaultValues: {
      name: '',
      content: '',
      defaultItem: false,
    },
  });

  const { isLoadingDetail, isSubmitting, onSubmit } = useTextTemplateFormState({
    id,
    isEditing,
    form,
    onDirtyChange,
    onSuccess,
  });

  const submitLabel = isEditing ? 'Save Changes' : 'Add Template';

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
          form="text-template-form"
          type="submit"
          disabled={isSubmitting || isLoadingDetail}
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

  // Show loading while the existing template is still being fetched by id
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
        id="text-template-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Standard Supply Terms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms &amp; conditions text</FormLabel>
              <FormControl>
                <RichTextEditor
                  placeholder="Enter terms and conditions..."
                  maxLength={8000}
                  value={field.value}
                  onChange={field.onChange}
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
              form="text-template-form"
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
