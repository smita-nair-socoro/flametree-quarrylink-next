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
import { HaulierFormSchema } from '@/app/(protected)/logistics/drivers/(components)/forms/schemas/haulier-form-schema';
import z from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  useCreateHaulier,
  HaulierDetailQueryOptions,
  useUpdateHaulier,
} from '@/lib/api/haulier';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

interface HaulierFormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function HaulierForm({
  id,
  onCancel,
  onSuccess,
  onDirtyChange,
}: HaulierFormProps) {
  const isEditing = Boolean(id && id > 0);
  const createHaulier = useCreateHaulier();
  const updateHaulier = useUpdateHaulier();

  const { data: haulierData } = useQuery(HaulierDetailQueryOptions(id ?? 0));

  const form = useForm<z.infer<typeof HaulierFormSchema>>({
    resolver: zodResolver(HaulierFormSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', phone: '' },
  });

  React.useEffect(() => {
    const subscription = form.watch(() => {
      onDirtyChange?.(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  React.useEffect(() => {
    if (!isEditing || !haulierData) return;
    form.reset({
      name: haulierData.haulierName,
      email: haulierData.emailAddress,
      phone: haulierData.phoneNumber,
    });
  }, [isEditing, haulierData, form]);

  React.useEffect(() => {
    if (!isEditing) {
      form.reset({ name: '', email: '', phone: '' });
    }
  }, [isEditing, form]);

  async function onSubmit(values: z.infer<typeof HaulierFormSchema>) {
    try {
      if (isEditing && id) {
        await updateHaulier.mutateAsync({
          id,
          data: {
            haulierName: values.name,
            haulierEmailAddress: values.email,
            haulierPhoneNumber: values.phone,
          },
        });
        notifySuccess('Haulier updated successfully.');
      } else {
        await createHaulier.mutateAsync({
          haulierName: values.name,
          haulierEmailAddress: values.email,
          haulierPhoneNumber: values.phone,
        });
        notifySuccess('Haulier created successfully.');
      }
      onSuccess?.();
    } catch (error: unknown) {
      notifyError(extractErrorMessage(error));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        className="flex flex-col gap-2"
      >
        <Separator className="mb-3" />

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

        <div className="flex justify-end gap-3 mt-4 pb-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={createHaulier.isPending || updateHaulier.isPending}
          >
            {isEditing ? 'Update Haulier' : 'Add Haulier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
