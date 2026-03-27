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
import { HaulierFormSchema } from './schemas/haulier-form-schema';
import z from 'zod';
import type { SelectCreateEditItem } from '@/components/ui/select-create-edit';

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
  const form = useForm<z.infer<typeof HaulierFormSchema>>({
    resolver: zodResolver(HaulierFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: editingItem?.label ?? '',
      email: editingItem?.fields?.email ?? '',
      phone: editingItem?.fields?.phone ?? '',
    },
  });

  // Reset form when switching between add/edit
  React.useEffect(() => {
    form.reset({
      name: editingItem?.label ?? '',
      email: editingItem?.fields?.email ?? '',
      phone: editingItem?.fields?.phone ?? '',
    });
  }, [editingItem, form]);

  function onSubmit(values: z.infer<typeof HaulierFormSchema>) {
    onSave({
      id: editingItem?.id ?? String(Date.now()),
      label: values.name,
      fields: { email: values.email, phone: values.phone },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isEditing ? 'Update Haulier' : 'Add Haulier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
