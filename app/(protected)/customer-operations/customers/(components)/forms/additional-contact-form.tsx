'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
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
import { PhoneInput } from '@/components/ui/phone-input';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFormDialogFooter } from '@/components/form-dialog';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { additionalContactFormSchema } from './schemas/additional-contact-form-schema';
import { AdditionalContactDTO } from '@/lib/types/customer';
import {
  useCreateAdditionalContact,
  useUpdateAdditionalContact,
} from '@/lib/api/customer';
import { Spinner } from '@/components/ui/spinner';

interface AdditionalContactFormProps {
  customerId: number;
  contact?: AdditionalContactDTO | null;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function AdditionalContactForm({
  customerId,
  contact,
  onCancel,
  onSuccess,
  onDirtyChange,
}: AdditionalContactFormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isEditing = Boolean(contact?.id);
  const createAdditionalContact = useCreateAdditionalContact();
  const updateAdditionalContact = useUpdateAdditionalContact();
  const isSubmitting =
    createAdditionalContact.isPending || updateAdditionalContact.isPending;

  const form = useForm<z.infer<typeof additionalContactFormSchema>>({
    resolver: zodResolver(additionalContactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
    },
  });

  React.useEffect(() => {
    if (!contact) {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
      });
      return;
    }

    form.reset({
      firstName: contact.firstName ?? '',
      lastName: contact.lastName ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      position: contact.position ?? '',
    });
  }, [contact, form]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  async function onSubmit(values: z.infer<typeof additionalContactFormSchema>) {
    if (!customerId) {
      notifyError('Customer ID is required');
      return;
    }

    try {
      if (isEditing && contact?.id) {
        await updateAdditionalContact.mutateAsync({
          customerId,
          contactId: contact.id,
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
      </div>
    ) : null,
  );

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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone*</FormLabel>
              <FormControl>
                <PhoneInput
                  className="w-full"
                  defaultCountry="AU"
                  placeholder="Enter phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
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

        {!isDesktop && (
          <div className="flex flex-col gap-3 pt-2">
            <Button
              form="additional-contact-form"
              type="submit"
              className="cursor-pointer"
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
