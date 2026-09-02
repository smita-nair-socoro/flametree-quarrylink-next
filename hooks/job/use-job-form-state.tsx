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
import {
  calculateJobPricing,
  calculateJobPricingFromTotals,
} from '@/lib/utils/job-helpers';
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
import { addNewRecord } from '@/lib/utils/pinned-records';
import LineItemsTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/line-items/line-items-tab';
import DocketsTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/dockets/dockets-tab';
import InvoicesTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/invoices/invoices-tab';
import CashSalesTab from '@/app/(protected)/customer-operations/jobs/(components)/forms/tabs/cash-sales/cash-sales-tab';
import { useJobStore } from '@/app/stores/job-store';

export const EMPTY_JOB_FORM_VALUES = {
  customerId: 0,
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
      const previous = useJobStore.getState().selectedJob;
      useJobStore.getState().setSelectedJob({
        ...previous,
        ...jobDetails,
        // Preserve IT fields if a stale job-items payload omits them.
        jobType: jobDetails.jobType ?? previous?.jobType,
        fromSiteId: jobDetails.fromSiteId ?? previous?.fromSiteId,
        fromSiteName: jobDetails.fromSiteName ?? previous?.fromSiteName,
        toSiteId: jobDetails.toSiteId ?? previous?.toSiteId,
        toSiteName: jobDetails.toSiteName ?? previous?.toSiteName,
        docketCount: jobDetails.docketCount ?? previous?.docketCount,
      });
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
    return jobDetails?.jobItems?.content ?? [];
  }, [jobDetails?.jobItems]);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !jobDetails) {
      return calculateJobPricing(null);
    }

    // Job items are paginated, so derive pricing from the backend-computed
    // job totals rather than summing the current page of line items.
    return calculateJobPricingFromTotals(jobDetails);
  }, [isEditing, jobDetails]);

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

      jobForm.setValue(
        'receiptEmail',
        selectedCustomer.contactPersonEmail || '',
      );
    });

    return () => subscription.unsubscribe();
  }, [customers, jobForm]);

  React.useEffect(() => {
    onDirtyChange?.(jobForm.formState.isDirty);
  }, [jobForm.formState.isDirty, onDirtyChange]);

  const isInternalTransfer =
    jobDetails?.jobType === 'INTERNAL_TRANSFER' ||
    selectedJob?.jobType === 'INTERNAL_TRANSFER';

  const tabs = React.useMemo(
    () => [
      ...(!isInternalTransfer
        ? [
            {
              name: 'Products',
              content: <LineItemsTab jobId={jobId} jobTotals={jobDetails} />,
            },
          ]
        : []),
      {
        name: 'Dockets',
        content: <DocketsTab selectedJob={jobDetails ?? selectedJob ?? null} />,
      },
      ...(!isInternalTransfer
        ? [
            {
              name: 'Invoices',
              content: <InvoicesTab jobId={jobId} />,
            },
            {
              name: 'Cash Sales',
              content: <CashSalesTab jobId={jobId} />,
            },
          ]
        : []),
    ],
    [jobDetails, jobId, isInternalTransfer, selectedJob],
  );

  const onSubmit = React.useCallback(
    async (values: JobFormValues) => {
      try {
        const dateStr = values.deliveryStartDate
          ? formatCalendarDate(values.deliveryStartDate, 'yyyy-MM-dd')
          : undefined;

        const selectedCustomer = customers.find(
          (customer) => customer.id === values.customerId,
        );

        const emailRecipients = values.receiptEmail
          ? values.receiptEmail
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean)
          : [];

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
          contactPersonName: newContactPersonName,
          contactPersonPhone: values.phone,
          emailRecipients,
          jobStatus:
            isEditing && jobDetails ? jobDetails.jobStatus : JOB_STATUS.ACTIVE,
          ...(dateStr ? { estimatedStartDate: `${dateStr}T00:00:00` } : {}),
          ...(dateStr && values.deliveryWindowStart
            ? { startTimeWindow: `${dateStr}T${values.deliveryWindowStart}:00` }
            : {}),
          ...(dateStr && values.deliveryWindowEnd
            ? { endTimeWindow: `${dateStr}T${values.deliveryWindowEnd}:00` }
            : {}),
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
          jobForm.reset(jobForm.getValues());
        } else {
          const createdJob = await createJob.mutateAsync(payload);

          if (createdJob?.id) {
            // The create response doesn't reliably embed customerDto, so
            // fall back to the customer already selected in the form.
            addNewRecord('job_main_data_table', {
              ...createdJob,
              customerDto: createdJob.customerDto ?? selectedCustomer,
            });
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
    isInternalTransfer,
  };
}
