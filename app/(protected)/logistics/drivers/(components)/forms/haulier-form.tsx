'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Separator } from '@/components/ui/separator';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  HaulierFormSchema,
  HaulierFormValues,
} from './schemas/haulier-form-schema';
import type { SelectCreateEditItem } from '@/components/ui/select-create-edit';
import {
  useCreateHaulier,
  useGetHaulierById,
  useUpdateHaulier,
} from '@/lib/api/haulier';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

interface HaulierFormProps {
  editingItem?: SelectCreateEditItem | null;
  isEditing: boolean;
  onSave: (item: SelectCreateEditItem) => void;
  onCancel: () => void;
}

export default function HaulierForm({
  editingItem,
  isEditing,
  onSave,
  onCancel,
}: HaulierFormProps) {
  const createHaulier = useCreateHaulier();
  const updateHaulier = useUpdateHaulier();
  const editingId = isEditing && editingItem?.id ? Number(editingItem.id) : 0;

  const { data: haulierData } = useGetHaulierById(editingId);

  const form = useForm<HaulierFormValues>({
    resolver: zodResolver(HaulierFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  // Populate form with fetched data when editing (mirrors docket form pattern)
  React.useEffect(() => {
    if (!isEditing || !haulierData) return;

    form.reset({
      name: haulierData.haulierName,
      email: haulierData.emailAddress,
      phone: haulierData.phoneNumber,
    });
  }, [isEditing, haulierData, form]);

  // Clear form when switching to add mode
  React.useEffect(() => {
    if (!isEditing) {
      form.reset({ name: '', email: '', phone: '' });
    }
  }, [isEditing, form]);

  async function onSubmit(values: HaulierFormValues) {
    if (isEditing) {
      try {
        const result = await updateHaulier.mutateAsync({
          id: editingId,
          data: {
            haulierName: values.name,
            haulierEmailAddress: values.email,
            haulierPhoneNumber: values.phone,
          },
        });
        notifySuccess('Haulier updated successfully.');
        onSave({
          id: result.id,
          label: result.haulierName,
          fields: { email: result.emailAddress, phone: result.phoneNumber },
        });
      } catch (error: unknown) {
        notifyError(extractErrorMessage(error));
      }
    } else {
      try {
        const result = await createHaulier.mutateAsync({
          haulierName: values.name,
          haulierEmailAddress: values.email,
          haulierPhoneNumber: values.phone,
        });
        notifySuccess('Haulier created successfully.');
        onSave({
          id: String(result.id),
          label: result.haulierName,
          fields: { email: result.emailAddress, phone: result.phoneNumber },
        });
      } catch (error: unknown) {
        notifyError(extractErrorMessage(error));
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-4"
      >
        <Separator />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Haulier Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter Haulier Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Haulier Email*</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
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
              <FormLabel>Haulier Phone*</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry="AU"
                  placeholder="Enter phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center gap-3 pt-2 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
            disabled={createHaulier.isPending || updateHaulier.isPending}
          >
            {isEditing ? 'Update Haulier' : 'Add Haulier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
