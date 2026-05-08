'use client';

import React from 'react';
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
import { Loader2, Info } from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useJobFormState } from '@/hooks/job/use-job-form-state';
import { PhoneInput } from '@/components/ui/phone-input';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { MultipleInput } from '@/components/ui/multiple-input';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from 'react-aria-components';
import { Tab } from '@/components/ui/tabs';
import { formatLocalDateTime } from '@/lib/utils/date';
import { AuditInformation } from '@/components/audit-information';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { FormSelect } from '@/components/ui/form-select';

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

  const {
    jobForm,
    isEditing,
    jobDetails,
    selectedJob,
    customers,
    customerOptions,
    tabs,
    isPending,
    onSubmit,
  } = useJobFormState({
    id,
    onDirtyChange,
    onSaved,
    onSuccess,
  });

  const statusBanner = React.useMemo(() => {
    if (!isEditing || !jobDetails) return null;

    const liveJob = selectedJob ?? jobDetails;
    if (liveJob.jobStatus !== JOB_STATUS.CANCELLED) return null;

    const actorName = liveJob.lastModifiedBy || 'Unknown';
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
  }, [isEditing, jobDetails, selectedJob]);

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
                <FormItem className="col-span-2 col-start-1">
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

            <FormField
              control={jobForm.control}
              name="accountManagerSub"
              render={() => {
                const accountManagerName =
                  customers.find((c) => c.id === jobForm.watch('customerId'))
                    ?.accountManagerName || '';
                return (
                  <FormItem
                    className={
                      isEditing && isDesktop
                        ? 'col-span-1 col-start-2'
                        : 'col-span-2'
                    }
                  >
                    <FormLabel>Account Manager*</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full"
                        value={accountManagerName}
                        placeholder="Select Customer First"
                        disabled
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={jobForm.control}
              name="projectName"
              render={({ field }) => (
                <FormItem className="col-span-2 col-start-1">
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
                    <FormLabel>Contact Person Name*</FormLabel>
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
                    <FormLabel>Contact Person Phone*</FormLabel>
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
                        key={`start-${field.value || 'empty'}`}
                        value={field.value || ''}
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
                        key={`end-${field.value || 'empty'}`}
                        value={field.value || ''}
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
                  (customer) => customer.id === jobForm.watch('customerId'),
                );

                const customerEmail = selectedCustomer?.contactPersonEmail;
                const fixedValues = customerEmail ? [customerEmail] : [];

                return (
                  <FormItem className="col-span-2 col-start-1">
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
              <Button
                type="submit"
                className="cursor-pointer"
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

          {isEditing && (
            <AuditInformation
              createdBy={jobDetails?.createdBy}
              lastModifiedBy={jobDetails?.lastModifiedBy}
              createdAt={jobDetails?.createdAt}
              updatedAt={jobDetails?.updatedAt}
            />
          )}
        </form>
      </Form>
    </div>
  );
}