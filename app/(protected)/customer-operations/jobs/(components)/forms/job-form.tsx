'use client';

import { format, parseISO } from 'date-fns';
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
import rawJson from '@/lib/tests/jobsDetailResponseData.json';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { JobFormSchema } from './schemas/job-form-schema';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@/components/date-picker';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { cn } from '@/lib/utils';
// import { useSelectedJob } from '@/app/stores/job-store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { EMPTY_JOB_FORM_VALUES } from '@/hooks/job/use-job-form-state';
import { UsersListQueryOptions } from '@/lib/api/user';
import { GetTodaysDate, formatLocalDateShort } from '@/lib/utils/date';
import { PhoneInput } from '@/components/ui/phone-input';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { Job } from '@/lib/types/job';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Spinner } from '@/components/ui/spinner';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

export default function QuotationForm({
  id,
  onCancel,
  className,
  onDirtyChange,
  // onSuccess,
  // onSaved,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));

  // const selectedJob = useSelectedJob();

  const selectedJob = React.useMemo(() => {
    return rawJson.items.find((job) => job.id === id);
  }, [id]);

  const jobForm = useForm<z.infer<typeof JobFormSchema>>({
    resolver: zodResolver(JobFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_JOB_FORM_VALUES,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(jobForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobForm.formState.isDirty]);

  // Fetch customers from API
  const { data: customers = [] } = useQuery(CustomersListQueryOptions());

  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    if (!customers) return [];
    return customers
      .filter((customer) => customer.id !== undefined)
      .map((customer) => ({
        label: customer.businessName || customer.contactName,
        value: customer.id!,
      }));
  }, [customers]);

  // Auto-fill phone/email (and preselect account manager on create) when customer is selected
  React.useEffect(() => {
    const subscription = jobForm.watch((value, { name }) => {
      if (name === 'customerId' && value.customerId) {
        const selectedCustomer = customers.find(
          (c) => c.id === value.customerId,
        );

        if (selectedCustomer) {
          // Update phone and email fields whenever customer changes
          jobForm.setValue(
            'phone',
            normalizePhoneNumber(selectedCustomer.phone || '') || '',
          );
          jobForm.setValue('email', selectedCustomer.email || '');

          jobForm.setValue(
            'accountManagerSub',
            selectedCustomer.accountManagerSub || '',
          );

          // If we are creating a new job (not editing), set the receipt email to the customer email
          jobForm.setValue('receiptEmail', selectedCustomer.email || '');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, jobForm, isEditing]);

  // Pre-fill form when editing
  React.useEffect(() => {
    if (isEditing && selectedJob) {
      jobForm.reset({
        poNumber: selectedJob.poNumber,
        customerId: selectedJob.customerId ?? 0,
        accountManagerSub: selectedJob.accountManagerSub,
        projectName: selectedJob.projectName,
        deliveryStartDate: selectedJob.deliveryStartDate
          ? parseISO(selectedJob.deliveryStartDate)
          : undefined,
        deliveryWindowStart: selectedJob.deliveryWindowStart
          ? format(parseISO(selectedJob.deliveryWindowStart), 'HH:mm')
          : '',
        deliveryWindowEnd: selectedJob.deliveryWindowEnd
          ? format(parseISO(selectedJob.deliveryWindowEnd), 'HH:mm')
          : '',
        receiptEmail: selectedJob.receiptEmail ?? '',
        // We'll let the customer selection effect handle phone/email if they are missing from job data
        // But if we had them in job data, we'd set them here:
        // phone: selectedJob.phone,
        // email: selectedJob.email,
      });

      // Trigger customer selection logic to fill phone/email if needed
      if ((selectedJob as Job).customerId) {
        const customer = customers.find((c) => c.id === selectedJob.customerId);
        if (customer) {
          jobForm.setValue(
            'phone',
            normalizePhoneNumber(customer.phone || '') || '',
          );
          jobForm.setValue('email', customer.email || '');
        }
      }
    }
  }, [isEditing, selectedJob, jobForm, customers]);

  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const userOptions: FormSelectOption[] = React.useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      label: user.name,
      value: user.sub,
    }));
  }, [users]);

  // Will be used later once we have API endpoint
  // const getUserNameBySub = React.useCallback(
  //   (subOrName?: string | null) => {
  //     if (!subOrName) return '';
  //     return users.find((u) => u.sub === subOrName)?.name || subOrName;
  //   },
  //   [users],
  // );

  const today = React.useMemo(() => {
    const d = GetTodaysDate();
    return d;
  }, []);

  async function onSubmit(values: z.infer<typeof JobFormSchema>) {
    setIsSubmitting(true);
    console.log(`Job Form Values:`, values);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
  }

  return (
    <div className="w-full relative">
      {isSubmitting && (
        <div
          className={cn(
            'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
            isDesktop ? '' : 'pt-10',
          )}
        >
          <div className="flex flex-col items-center space-y-4 p-8">
            <Spinner size="medium" />
            <p className="text-lg text-muted-foreground font-bold">
              {isEditing ? 'Updating Job...' : 'Adding Job...'}
            </p>
          </div>
        </div>
      )}
      <Form {...jobForm}>
        <form
          id="add-new-job-form"
          className={cn('p-1 w-full flex flex-col', className)}
          onSubmit={jobForm.handleSubmit(onSubmit)}
        >
          <div
            className={cn(
              'p-1 gap-1 w-full',
              isDesktop && isEditing
                ? 'grid grid-cols-2 gap-x-8'
                : 'grid grid-cols-1',
              className,
            )}
          >
            <FormField
              control={jobForm.control}
              name="poNumber"
              render={({ field }) => (
                <FormItem className={'col-span-2 col-start-1'}>
                  <FormLabel>PO Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter PO Number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSelect
              control={jobForm.control}
              name="customerId"
              label="Customer*"
              searchLabel="Customer"
              options={customerOptions}
              placeholder="Select Customer"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
              }
            />

            <FormSelect
              control={jobForm.control}
              name="accountManagerSub"
              label="Account Manager*"
              searchLabel="Account Managers"
              options={userOptions}
              placeholder="Select Customer First"
              formItemClassName={
                isEditing && isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
              }
            />

            <FormField
              control={jobForm.control}
              name="projectName"
              render={({ field }) => (
                <FormItem className={'col-span-2 col-start-1'}>
                  <FormLabel>Project Name*</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="Enter Project Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={jobForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                    }
                  >
                    <div className="flex items-center gap-2">
                      <FormLabel>Customer Email*</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Email"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isEditing && (
              <FormField
                control={jobForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-2' : 'col-span-2'
                    }
                  >
                    <div className="flex items-center gap-2">
                      <FormLabel>Customer Phone*</FormLabel>
                    </div>
                    <FormControl>
                      <PhoneInput
                        className="w-full"
                        placeholder="Enter Phone"
                        defaultCountry="AU"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Delivery Time Window Section */}
            <div
              className={cn(
                'col-span-2',
                isEditing && isDesktop
                  ? 'grid grid-cols-4 gap-4'
                  : 'grid grid-cols-1 gap-2',
              )}
            >
              <h3 className="font-bold col-span-full mb-2">
                Delivery Time Window
              </h3>
              <FormField
                control={jobForm.control}
                name="deliveryStartDate"
                render={({ field }) => (
                  <FormItem
                    className={isEditing && isDesktop ? 'col-span-2' : ''}
                  >
                    <FormLabel>Delivery Date*</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChangeAction={field.onChange}
                        placeholder="Pick a date"
                        disabled={{ before: today }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={jobForm.control}
                name="deliveryWindowStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time Window</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        id="time-picker-start"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={jobForm.control}
                name="deliveryWindowEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time Window</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="time"
                        id="time-picker-end"
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none w-full"
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={jobForm.control}
              name="receiptEmail"
              render={({ field }) => {
                // Get the customer email to use as a fixed value
                const customerEmail = jobForm.watch('email');
                const fixedValues = customerEmail ? [customerEmail] : [];

                return (
                  <FormItem className={'col-span-2 col-start-1'}>
                    <FormLabel>Receipt Email*</FormLabel>
                    <FormControl>
                      <MultipleInput
                        className="w-full"
                        placeholder={
                          jobForm.watch('customerId') === 0
                            ? 'Select Customer First'
                            : 'Enter Receipt Emails'
                        }
                        fixedValues={fixedValues}
                        validate={(s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)}
                        label="Press Enter or comma to add email addresses for delivery receipts"
                        disabled={jobForm.watch('customerId') === 0}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          {/* Audit Information */}
          {isEditing && (
            <div className="col-span-full space-y-6 mt-10 mb-4">
              <h2 className="text-2xl font-bold">Audit Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob?.createdBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Last Modified By:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedJob?.lastModifiedBy || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Created Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(selectedJob?.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Modified Date:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatLocalDateShort(selectedJob?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 mb-6">
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
              <Button
                form="add-new-job-form"
                className="cursor-pointer"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Customer'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6">
              <Button
                form="add-new-job-form"
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Customer...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Customer'}
              </Button>
              <Button variant="outline" type="button" onClick={onCancel}>
                {isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
