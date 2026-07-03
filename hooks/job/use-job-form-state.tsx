'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import {
  getJobFormSchema,
  JobFormValues,
} from '@/app/(protected)/customer-operations/jobs/(components)/forms/schemas/job-form-schema';
import {
  JobItemsQueryOptions,
  useCreateJob,
  useUpdateJob,
} from '@/lib/api/job';
import { useCustomersForForm } from '@/hooks/customer/use-customers-for-form';
import { calculateJobPricing } from '@/lib/utils/job-helpers';
import { JobDTO, JobItem } from '@/lib/types/job';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { formatCalendarDate, parseCalendarDate } from '@/lib/utils/date';
import {
  normalizeDeliveryTimeWindowEnd,
  normalizeDeliveryTimeWindowStart,
  parseDeliveryTimeWindowValue,
} from '@/lib/utils/time';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { notifyError, notifySuccess } from '@/lib/toast';
import { addNewRecordId } from '@/lib/utils';
import LineItemsTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/line-items/line-itmes-tab';
import DocketsTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/dockets/dockets-tab';
import InvoicesTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/invoices/invoices-tab';
import { useJobStore } from '@/app/stores/job-store';

export const EMPTY_JOB_FORM_VALUES = {
  customerId: 0,
  poNumber: '',
  projectName: '',
  deliveryWindowStart: '',
  deliveryWindowEnd: '',
  receiptEmail: '',
  phone: '',
  email: '',
  accountManagerSub: '',
  deliveryStartDate: undefined,
};

export const formatJobTimeString = (timeStr?: string | null) =>
  parseDeliveryTimeWindowValue(timeStr);

type UseJobFormStateProps = {
  id?: number;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
  onSuccess?: () => void;
  loadMoreEnabled?: boolean;
};

export function useJobFormState({
  id,
  onDirtyChange,
  onSaved,
  onSuccess,
  loadMoreEnabled = false,
}: UseJobFormStateProps) {
  const isEditing = Boolean(id);
  const jobId = id ?? 0;

  const hasHydratedJobRef = React.useRef(false);

  const selectedJob = useJobStore((state) => state.selectedJob);

  const jobForm = useForm<JobFormValues>({
    resolver: zodResolver(getJobFormSchema(isEditing)),
    mode: 'onChange',
    defaultValues: EMPTY_JOB_FORM_VALUES,
  });

  const { data: jobDetails } = useQuery({
    ...JobItemsQueryOptions(jobId),
    enabled: isEditing && jobId > 0,
  });

  // Put detailed jobs into store to make form-dialog can get QuoteNumber from store
  React.useEffect(() => {
    if (jobDetails) {
      useJobStore.getState().setSelectedJob(jobDetails);
    }
  }, [jobDetails]);

  const selectedCustomerId = jobForm.watch('customerId');

  const {
    customers,
    customerOptions,
    hasMoreCustomerOptions,
    isLoadingMoreCustomerOptions,
    onCustomerOptionsScrollEnd,
    customerSearch,
    onCustomerSearchChange,
    isSearchingCustomers,
  } = useCustomersForForm({
    isEditing,
    customerId: jobDetails?.customerId,
    loadMoreEnabled,
    selectedCustomerId,
  });

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const isPending = createJob.isPending || updateJob.isPending;

  const jobItems: JobItem[] = React.useMemo(() => {
    return jobDetails?.jobItems ?? [];
  }, [jobDetails?.jobItems]);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !jobItems.length) {
      return calculateJobPricing(null);
    }

    return calculateJobPricing(jobItems);
  }, [isEditing, jobItems]);

  React.useEffect(() => {
    hasHydratedJobRef.current = false;
  }, [jobId]);

  /**
   * Edit hydration:
   * - First load: reset full form from jobDetails.
   * - Later refetches: only patch missing time values.
   * This avoids wiping user edits and avoids empty time-window resets.
   */
  React.useEffect(() => {
    if (!isEditing || !jobDetails) return;

    const currentValues = jobForm.getValues();

    const deliveryDate = jobDetails.estimatedStartDate
      ? parseCalendarDate(jobDetails.estimatedStartDate)
      : currentValues.deliveryStartDate;

    const apiStartWindow = normalizeDeliveryTimeWindowStart(
      formatJobTimeString(jobDetails.startTimeWindow),
    );
    const apiEndWindow = normalizeDeliveryTimeWindowEnd(
      formatJobTimeString(jobDetails.endTimeWindow),
    );

    const startWindow =
      apiStartWindow || currentValues.deliveryWindowStart || '';

    const endWindow = apiEndWindow || currentValues.deliveryWindowEnd || '';

    if (hasHydratedJobRef.current) {
      if (apiStartWindow && !currentValues.deliveryWindowStart) {
        jobForm.setValue('deliveryWindowStart', apiStartWindow, {
          shouldDirty: false,
        });
      }

      if (apiEndWindow && !currentValues.deliveryWindowEnd) {
        jobForm.setValue('deliveryWindowEnd', apiEndWindow, {
          shouldDirty: false,
        });
      }

      return;
    }

    jobForm.reset({
      ...currentValues,
      customerId: jobDetails.customerId,
      poNumber: jobDetails.poNumber || '',
      projectName: jobDetails.projectName || '',
      deliveryStartDate: deliveryDate,
      deliveryWindowStart: startWindow,
      deliveryWindowEnd: endWindow,
      contactPersonName: jobDetails.contactPersonName || '',
      phone: normalizePhoneNumber(jobDetails.contactPersonPhone || '') || '',
      receiptEmail: (jobDetails.emailRecipients || []).join(','),
      accountManagerSub: currentValues.accountManagerSub || '',
    });

    hasHydratedJobRef.current = true;
  }, [isEditing, jobDetails, jobForm]);

  /**
   * Account manager depends on customers list, which may arrive after jobDetails.
   */
  React.useEffect(() => {
    if (!isEditing || !jobDetails || !customers.length) return;

    const accountManagerSub =
      customers.find((customer) => customer.id === jobDetails.customerId)
        ?.accountManagerSub || '';

    if (
      accountManagerSub &&
      jobForm.getValues('accountManagerSub') !== accountManagerSub
    ) {
      jobForm.setValue('accountManagerSub', accountManagerSub, {
        shouldDirty: false,
      });
    }
  }, [isEditing, jobDetails, customers, jobForm]);

  /**
   * Create/edit customer selection autofill.
   */
  React.useEffect(() => {
    const subscription = jobForm.watch((value, { name }) => {
      if (name !== 'customerId' || !value.customerId) return;

      const selectedCustomer = customers.find(
        (customer) => customer.id === value.customerId,
      );

      if (!selectedCustomer) return;

      jobForm.setValue(
        'phone',
        normalizePhoneNumber(selectedCustomer.contactPersonPhone || '') || '',
      );

      jobForm.setValue(
        'accountManagerSub',
        selectedCustomer.accountManagerSub || '',
      );

      jobForm.setValue('receiptEmail', '');
    });

    return () => subscription.unsubscribe();
  }, [customers, jobForm]);

  React.useEffect(() => {
    onDirtyChange?.(jobForm.formState.isDirty);
  }, [jobForm.formState.isDirty, onDirtyChange]);

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

  const onSubmit = React.useCallback(
    async (values: JobFormValues) => {
      try {
        const dateStr = formatCalendarDate(
          values.deliveryStartDate,
          'yyyy-MM-dd',
        );

        const selectedCustomer = customers.find(
          (customer) => customer.id === values.customerId,
        );

        const receiptEmails = values.receiptEmail
          ? values.receiptEmail
              .split(',')
              .map((email) => email.trim())
              .filter(Boolean)
          : [];

        const customerEmail = selectedCustomer?.contactPersonEmail;

        const emailRecipients = [
          ...(customerEmail ? [customerEmail] : []),
          ...receiptEmails.filter((email) => email !== customerEmail),
        ];

        let newContactPersonName: string | undefined;

        if (isEditing) {
          newContactPersonName = values.contactPersonName;
        } else if (selectedCustomer?.customerType === 'BUSINESS') {
          newContactPersonName =
            `${selectedCustomer.contactPersonFirstName ?? ''} ${selectedCustomer.contactPersonLastName ?? ''}`.trim();
        } else if (selectedCustomer?.customerType === 'INDIVIDUAL') {
          newContactPersonName = selectedCustomer.individualContactName ?? '';
        }

        const payload = {
          customerId: values.customerId,
          projectName: values.projectName,
          poNumber: values.poNumber,
          contactPersonName: newContactPersonName,
          contactPersonPhone: values.phone,
          emailRecipients,
          jobStatus:
            isEditing && jobDetails ? jobDetails.jobStatus : JOB_STATUS.ACTIVE,
          estimatedStartDate: `${dateStr}T00:00:00`,
          startTimeWindow: `${dateStr}T${values.deliveryWindowStart}:00`,
          endTimeWindow: `${dateStr}T${values.deliveryWindowEnd}:00`,
        };

        if (isEditing && jobId) {
          const updated = await updateJob.mutateAsync({
            id: jobId,
            data: {
              ...jobDetails,
              ...payload,
            } as JobDTO,
          });

          if (updated) {
            useJobStore.getState().setSelectedJob(updated);
          }

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
    },
    [
      customers,
      createJob,
      isEditing,
      jobDetails,
      jobId,
      onSaved,
      onSuccess,
      updateJob,
    ],
  );

  return {
    jobForm,
    isEditing,
    jobId,
    jobDetails,
    jobItems,
    pricingBreakdown,
    selectedJob,
    customers,
    customerOptions,
    hasMoreCustomerOptions,
    isLoadingMoreCustomerOptions,
    onCustomerOptionsScrollEnd,
    customerSearch,
    onCustomerSearchChange,
    isSearchingCustomers,
    tabs,
    isPending,
    onSubmit,
  };
}
