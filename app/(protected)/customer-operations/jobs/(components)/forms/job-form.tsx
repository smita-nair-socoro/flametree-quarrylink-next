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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import React from 'react';
import { FormSelect, FormSelectOption } from '@/components/ui/form-select';
import { JobFormSchema } from './schemas/job-form-schema';
import { Loader2, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { DatePicker } from '@/components/date-picker';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  useJobFormState,
  EMPTY_JOB_FORM_VALUES,
} from '@/hooks/job/use-job-form-state';
import { UsersListQueryOptions } from '@/lib/api/user';
import { PhoneInput } from '@/components/ui/phone-input';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { useCreateJob, useUpdateJob } from '@/lib/api/job';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from 'react-aria-components';
import { Tab } from '@/components/ui/tabs';
import LineItemsTab from './tabs/line-items/line-itmes-tab';
import InvoicesTab from './tabs/invoices/invoices-tab';
import DocketsTab from './tabs/dockets/dockets-tab';
import { addNewRecordId } from '@/lib/utils';
import { formatLocalDate, formatLocalDateTime } from '@/lib/utils/date';
import { JobDTO } from '@/lib/types/job';
import { useJobStore } from '@/app/stores/job-store';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface FormProps {
  id?: number;
  canEdit?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
}

export default function JobForm({
  id,
  className,
  onDirtyChange,
  onSaved,
  onCancel,
  onSuccess,
}: FormProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isEditing] = React.useState(Boolean(id));
  const jobId = id ?? 0;

  const { jobDetails, jobItems } = useJobFormState(jobId, isEditing);
  const selectedJob = useJobStore((s) => s.selectedJob);

  const jobForm = useForm<z.infer<typeof JobFormSchema>>({
    resolver: zodResolver(JobFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_JOB_FORM_VALUES,
  });

  React.useEffect(() => {
    if (isEditing && jobDetails) {
      const deliveryDate = jobDetails.estimatedStartDate
        ? parseISO(jobDetails.estimatedStartDate)
        : undefined;
      const extractTime = (timeStr?: string) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
        if (timeStr.includes(' ')) return timeStr.split(' ')[1].substring(0, 5);
        return timeStr.substring(0, 5);
      };

      const startWindow = extractTime(jobDetails.startTimeWindow);
      const endWindow = extractTime(jobDetails.endTimeWindow);

      jobForm.reset({
        customerId: jobDetails.customerId,
        poNumber: jobDetails.poNumber || '',
        projectName: jobDetails.projectName,
        deliveryStartDate: deliveryDate,
        deliveryWindowStart: startWindow,
        deliveryWindowEnd: endWindow,
        contactPersonName: jobDetails.contactPersonName,
        phone: jobDetails.contactPersonPhone,
        receiptEmail: (jobDetails.emailRecipients || []).join(','),
        accountManagerSub: customers.find((c) => c.id === jobDetails.customerId)
          ?.accountManagerSub,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, jobDetails, jobForm]);

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  // Report dirty-state to parent dialog
  React.useEffect(() => {
    onDirtyChange?.(jobForm.formState.isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobForm.formState.isDirty]);

  // Fetch customers from API
  const { data: customersData } = useQuery(CustomersListQueryOptions());
  const customers = React.useMemo(() => customersData || [], [customersData]);

  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    if (!customers) return [];
    return customers
      .filter((customer) => customer.id !== undefined)
      .map((customer) => {
        if (customer.customerType === 'BUSINESS') {
          return {
            label: customer.businessName as string,
            value: customer.id!,
          };
        } else {
          return {
            label: customer.individualContactName ?? '',
            value: customer.id!,
          };
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label));
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
            normalizePhoneNumber(selectedCustomer.contactPersonPhone || '') || '',
          );

          jobForm.setValue(
            'accountManagerSub',
            selectedCustomer.accountManagerSub || '',
          );

          // Clear additional emails when customer changes — customer email is already
          // shown as the fixed chip in MultipleInput and sent as docketEmail
          jobForm.setValue('receiptEmail', '');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, jobForm, isEditing]);

  const { data: usersData } = useQuery(UsersListQueryOptions());
  const users = React.useMemo(() => usersData || [], [usersData]);
  const userOptions: FormSelectOption[] = React.useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      label: user.name,
      value: user.sub,
    }));
  }, [users]);

  const getActorName = React.useCallback(
    (actor?: string | null) => {
      if (!actor) return 'Unknown';
      const matchedUser = users.find((user) => user.sub === actor)?.name;
      if (matchedUser) return matchedUser;
      const [, parsedName] = actor.split('-', 2);
      return parsedName || actor;
    },
    [users],
  );

  const statusBanner = React.useMemo(() => {
    if (!isEditing || !jobDetails) return null;
    // Use selectedJob (store) for live status/cancel data since it's updated by mutations
    const liveJob = selectedJob ?? jobDetails;
    if (liveJob.jobStatus !== JOB_STATUS.CANCELLED) return null;

    const actorName = getActorName(liveJob.lastModifiedBy);
    const actionDate = formatLocalDateTime(liveJob.updatedAt);
    const reason = liveJob.reason || 'N/A';
    const notes = liveJob.notes;

    return (
      <div className="border border-[#DC2626] bg-[#FEF2F2] p-4 rounded-md mb-4 flex flex-col">
        <div className="flex items-start gap-2 font-medium text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#EF4444]" />
          <div className="flex flex-col text-[#7F1D1D]">
            <span>
              This job was cancelled by {actorName} - Reason: {reason}
              {actionDate ? ` (${actionDate})` : ''}
            </span>
            {notes && <span>Note: {notes}</span>}
          </div>
        </div>
      </div>
    );
  }, [isEditing, jobDetails, selectedJob, getActorName]);

  const tabs = React.useMemo(
    () => [
      {
        name: 'Products',
        content: <LineItemsTab jobLineItems={jobItems} />,
      },
      {
        name: 'Dockets',
        content: <DocketsTab selectedJob={jobDetails ?? null} />,
      },
      {
        name: 'Invoices',
        content: <InvoicesTab jobId={jobId} />,
      },
    ],
    [jobItems, jobDetails, jobId],
  );

  async function onSubmit(values: z.infer<typeof JobFormSchema>) {
    console.log(values);
    console.log('onSubmit function called!');

    try {
      const dateStr = formatLocalDate(values.deliveryStartDate, 'yyyy-MM-dd');
      const selectedCustomer = customers.find(
        (c) => c.id === values.customerId,
      );

      const receiptEmails = values.receiptEmail
        ? values.receiptEmail
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
        : [];

      const customerEmail = selectedCustomer?.contactPersonEmail;
      const emailRecipients = [
        ...(customerEmail ? [customerEmail] : []),
        ...receiptEmails.filter((email) => email !== customerEmail),
      ];

      const payload = {
        customerId: values.customerId,
        projectName: values.projectName,
        poNumber: values.poNumber,
        contactPersonName: selectedCustomer?.customerType === 'BUSINESS' ? selectedCustomer?.businessName : selectedCustomer?.individualContactName,
        contactPersonPhone: values.phone,
        emailRecipients,
        jobStatus:
          isEditing && jobDetails ? jobDetails.jobStatus : JOB_STATUS.ACTIVE,
        estimatedStartDate: `${dateStr}T00:00:00`,
        startTimeWindow: `${dateStr}T${values.deliveryWindowStart}:00`,
        endTimeWindow: `${dateStr}T${values.deliveryWindowEnd}:00`,
      };

      if (isEditing && jobId) {
        await updateJob.mutateAsync({
          id: jobId,
          data: {
            ...(jobDetails as JobDTO),
            ...payload,
          } as JobDTO,
        });
        notifySuccess('Job updated successfully');
      } else {
        const createdJob = await createJob.mutateAsync(payload);

        if (createdJob?.id) {
          addNewRecordId('job_main_data_table', createdJob.id);
        }

        notifySuccess('Job created successfully');
      }

      onSaved?.();
      onSuccess?.();
    } catch (error) {
      notifyError(
        extractErrorMessage(error) ||
        `Failed to ${isEditing ? 'update' : 'create'} job. Please try again.`,
      );
    }
  }

  const isPending = createJob.isPending || updateJob.isPending;

  return (
    <div className="w-full relative">
      {isPending && (
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
          className={cn('py-1 w-full flex flex-col', className)}
          onSubmit={jobForm.handleSubmit(onSubmit)}
        >
          {statusBanner}
          <div
            className={cn(
              'gap-1 w-full',
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
              disabled
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
                name="contactPersonName"
                render={({ field }) => (
                  <FormItem
                    className={
                      isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
                    }
                  >
                    <div className="flex items-center gap-2">
                      <FormLabel>Contact Person Name*</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        className="w-full"
                        placeholder="Enter Customer Name"
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
                      <FormLabel>Contact Person Phone*</FormLabel>
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
                  : 'grid grid-cols-2 gap-2',
              )}
            >
              <h3 className="font-bold col-span-full mb-2">
                Delivery Time Window
              </h3>
              <FormField
                control={jobForm.control}
                name="deliveryStartDate"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Delivery Date*</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChangeAction={field.onChange}
                        placeholder="Pick a date"
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
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>

                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>

                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = String(i).padStart(2, '0');
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                const selectedCustomer = customers.find(
                  (c) => c.id === jobForm.watch('customerId'),
                );
                // Get the customer email to use as a fixed value
                const customerEmail = selectedCustomer?.contactPersonEmail;
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

          {/* Form Actions */}
          {isDesktop && (
            <div className="flex justify-end space-x-2 col-span-2 mb-6">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                form="add-new-job-form"
                className="cursor-pointer"
                type="submit"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Job...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Job'}
              </Button>
            </div>
          )}

          {!isDesktop && (
            <div className="flex flex-col col-span-2 gap-3 mb-6">
              <Button type="submit" className="cursor-pointer">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? isEditing
                    ? 'Saving Changes...'
                    : 'Adding Job...'
                  : isEditing
                    ? 'Save Changes'
                    : 'Add Job'}
              </Button>
              <Button
                form="add-new-job-form"
                type="button"
                variant="outline"
                className="cursor-pointer"
                disabled={isPending}
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          )}

          {isEditing && <Separator className="my-4" />}

          {isEditing && (
            <div className="w-full flex min-w-0 mb-10">
              <Tab
                tabs={tabs}
                className="w-full min-w-0"
                tabsClassName="h-10 w-full overflow-x-auto flex-nowrap rounded-md"
                tabsTriggerClassName="h-8 flex-1 justify-center"
                enableDropdownOnMobile={true}
              />
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
