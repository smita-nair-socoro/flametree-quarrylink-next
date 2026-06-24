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
  HaulierDriversQueryOptions,
  HaulierTrucksQueryOptions,
} from '@/lib/api/haulier';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { TableBadges } from '@/components/table-badges';
import { Spinner } from '@/components/ui/spinner';

interface HaulierFormProps {
  id?: number;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  scrollToSection?: string;
}

export default function HaulierForm({
  id,
  onCancel,
  onSuccess,
  onDirtyChange,
  scrollToSection,
}: HaulierFormProps) {
  const isEditing = Boolean(id && id > 0);
  const createHaulier = useCreateHaulier();
  const updateHaulier = useUpdateHaulier();

  const trucksRef = React.useRef<HTMLDivElement>(null);
  const driversRef = React.useRef<HTMLDivElement>(null);

  const { data: haulierData } = useQuery(HaulierDetailQueryOptions(id ?? 0));
  const { data: linkedTrucks, isLoading: trucksLoading } = useQuery(
    HaulierTrucksQueryOptions(id ?? 0),
  );
  const { data: linkedDrivers, isLoading: driversLoading } = useQuery(
    HaulierDriversQueryOptions(id ?? 0),
  );

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

  React.useEffect(() => {
    if (!scrollToSection) return;
    if (scrollToSection === 'trucks') {
      trucksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollToSection === 'drivers') {
      driversRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToSection]);

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

        {isEditing && (
          <>
            <div ref={trucksRef}>
              <Separator className="my-4" />
              <h3 className="text-base font-medium mb-3">Linked Trucks</h3>
              {trucksLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="small" />
                </div>
              ) : (linkedTrucks?.trucks ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No trucks linked to this haulier.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedTrucks?.trucks?.map((truck) => (
                    <div
                      key={truck.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                    >
                      <span className="font-medium text-sm">
                        {truck.licensePlate}
                      </span>
                      <div className="flex gap-2">
                        <TableBadges names={[truck.truckType]} visibleCount={1} />
                        {truck.truckStatus && (
                          <TableBadges
                            names={[truck.truckStatus]}
                            visibleCount={1}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div ref={driversRef}>
              <Separator className="my-4" />
              <h3 className="text-base font-medium mb-3">Linked Drivers</h3>
              {driversLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="small" />
                </div>
              ) : (linkedDrivers?.drivers ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No drivers linked to this haulier.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedDrivers?.drivers?.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                    >
                      <span className="font-medium text-sm">
                        {driver.driverName}
                      </span>
                      <div className="flex gap-2">
                        <TableBadges
                          names={[driver.driverType]}
                          visibleCount={1}
                        />
                        {driver.driverStatus && (
                          <TableBadges
                            names={[driver.driverStatus]}
                            visibleCount={1}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

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
