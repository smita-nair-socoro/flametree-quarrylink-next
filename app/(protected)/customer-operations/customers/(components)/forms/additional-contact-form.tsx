'use client';

import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormSelect } from '@/components/ui/form-select';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import {
  ADDITIONAL_CONTACT_METHOD_TYPE_OPTIONS,
  additionalContactFormSchema,
} from './schemas/additional-contact-form-schema';
import { ADDITIONAL_CONTACT_METHOD_TYPE } from '@/lib/types/customer-enums';
import {
  AdditionalContactDetailQueryOptions,
  useCreateAdditionalContact,
  useUpdateAdditionalContact,
} from '@/lib/api/customer';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';

type FormValues = z.infer<typeof additionalContactFormSchema>;

const EMPTY_CONTACT_METHOD: FormValues['contactMethods'][number] = {
  type: ADDITIONAL_CONTACT_METHOD_TYPE.BUSINESS_PHONE,
  value: '',
};

interface AdditionalContactFormProps {
  contactId?: number;
  customerId: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function AdditionalContactForm({
  contactId,
  customerId,
  onCancel,
  onSuccess,
  onDirtyChange,
}: AdditionalContactFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(contactId);
  const createAdditionalContact = useCreateAdditionalContact();
  const updateAdditionalContact = useUpdateAdditionalContact();
  const isSubmitting =
    createAdditionalContact.isPending || updateAdditionalContact.isPending;

  const { data: contactDetail, isPending: isLoadingDetail } = useQuery(
    AdditionalContactDetailQueryOptions(
      customerId,
      contactId ?? 0,
      isEditing,
    ),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(additionalContactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      positionRole: '',
      contactMethods: [{ ...EMPTY_CONTACT_METHOD }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contactMethods',
  });

  React.useEffect(() => {
    if (!isEditing) {
      form.reset({
        firstName: '',
        lastName: '',
        positionRole: '',
        contactMethods: [{ ...EMPTY_CONTACT_METHOD }],
      });
      return;
    }

    if (!contactDetail) return;

    const methods = (contactDetail.contactMethods ?? []).filter(
      (method) => method.type && method.value,
    );

    form.reset({
      firstName: contactDetail.firstName ?? '',
      lastName: contactDetail.lastName ?? '',
      positionRole: contactDetail.positionRole ?? '',
      contactMethods:
        methods.length > 0
          ? methods.map((method) => ({
            type: method.type as ADDITIONAL_CONTACT_METHOD_TYPE,
            value: method.value,
          }))
          : [{ ...EMPTY_CONTACT_METHOD }],
    });
  }, [contactDetail, form, isEditing]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  async function onSubmit(values: FormValues) {
    if (!customerId) {
      notifyError('Customer ID is required');
      return;
    }

    try {
      if (isEditing && contactId) {
        await updateAdditionalContact.mutateAsync({
          customerId,
          contactId,
          data: values,
        });
        notifySuccess('Contact updated successfully');
      } else {
        await createAdditionalContact.mutateAsync({
          customerId,
          data: values,
        });
        notifySuccess('Contact added successfully');
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving additional contact:', error);
      notifyError(
        extractErrorMessage(error) ||
        `Failed to ${isEditing ? 'update' : 'add'} contact`,
      );
    }
  }

  function onError(errors: unknown) {
    console.error('Additional contact validation errors:', errors);
    notifyError(`Failed to ${isEditing ? 'update' : 'add'} contact`, {
      description: 'Check required fields',
    });
  }

  const submitLabel = isEditing ? 'Save Changes' : 'Add Contact';

  useFormDialogFooter(
    isDesktop ? (
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          form="additional-contact-form"
          type="submit"
          className="cursor-pointer"
          disabled={isSubmitting || (isEditing && isLoadingDetail)}
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

  if (isEditing && isLoadingDetail) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        id="additional-contact-form"
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit, onError)(e);
        }}
        className="space-y-4 pt-5"
      >
        <div
          className={cn(
            'grid gap-4',
            isDesktop ? 'grid-cols-2' : 'grid-cols-1',
          )}
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="positionRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position / Role</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Manager, Supervisor, Accounts"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <FormLabel className="text-md font-semibold">
              Contact Methods
            </FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => append({ ...EMPTY_CONTACT_METHOD })}
              disabled={isSubmitting}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          {fields.map((field, index) => {
            const methodType = form.watch(`contactMethods.${index}.type`);
            const valuePlaceholder =
              methodType === ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL
                ? 'email@example.com'
                : 'Enter phone number';

            return (
              <div
                key={field.id}
                className="rounded-md border border-[#E4E4E7] bg-white p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[#364153]">
                    Contact Method {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    control={form.control}
                    name={`contactMethods.${index}.type`}
                    label="Type*"
                    searchLabel="Type"
                    showSearch={false}
                    options={ADDITIONAL_CONTACT_METHOD_TYPE_OPTIONS}
                    placeholder="Select type"
                  />

                  <FormField
                    control={form.control}
                    name={`contactMethods.${index}.value`}
                    render={({ field: valueField }) => (
                      <FormItem>
                        <FormLabel>Value*</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={valuePlaceholder}
                            {...valueField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            );
          })}

          {form.formState.errors.contactMethods?.root?.message ||
            form.formState.errors.contactMethods?.message ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.contactMethods.root?.message ||
                form.formState.errors.contactMethods.message}
            </p>
          ) : null}
        </div>

        {!isDesktop && (
          <div className="flex flex-col gap-3 pt-2">
            <Button
              form="additional-contact-form"
              type="submit"
              className="cursor-pointer"
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
