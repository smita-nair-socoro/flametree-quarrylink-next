'use client';

import React from 'react';
import { parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';

import { getJobFormSchema, JobFormValues } from '@/app/(protected)/customer-operations/jobs/(components)/forms/schemas/job-form-schema';
import { JobItemsQueryOptions, useCreateJob, useUpdateJob } from '@/lib/api/job';
import { CustomersListQueryOptions } from '@/lib/api/customer';
import { UsersListQueryOptions } from '@/lib/api/user';
import { calculateJobPricing } from '@/lib/utils/job-helpers';
import { JobDTO, JobItem } from '@/lib/types/job';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { JOB_STATUS } from '@/lib/types/job-enums';
import { FormSelectOption } from '@/components/ui/form-select';
import { normalizePhoneNumber } from '@/lib/utils/phone-helper';
import { formatLocalDate } from '@/lib/utils/date';
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

export const formatJobTimeString = (timeStr?: string | null) => {
  if (!timeStr) return '';

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    return timeStr.substring(0, 5);
  }

  if (timeStr.includes('T')) {
    return timeStr.split('T')[1]?.substring(0, 5) ?? '';
  }

  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1]?.substring(0, 5) ?? '';
  }

  return timeStr.substring(0, 5);
};

type UseJobFormStateProps = {
  id?: number;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved?: () => void;
  onSuccess?: () => void;
};

export function useJobFormState({
  id,
  onDirtyChange,
  onSaved,
  onSuccess,
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

  const { data: customersData } = useQuery(CustomersListQueryOptions());
  const customers = React.useMemo(() => customersData || [], [customersData]);

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

  const customerOptions: FormSelectOption[] = React.useMemo(() => {
    return customers
      .filter(
        (customer) =>
          customer.id !== undefined &&
          customer.customerStatus !== CUSTOMER_STATUS.ARCHIVED,
      )
      .map((customer) => {
        if (customer.customerType === 'BUSINESS') {
          return {
            label: customer.businessName as string,
            value: customer.id!,
          };
        }

        return {
          label: customer.individualContactName ?? '',
          value: customer.id!,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [customers]);

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
      ? parseISO(jobDetails.estimatedStartDate)
      : currentValues.deliveryStartDate;

    const apiStartWindow = formatJobTimeString(jobDetails.startTimeWindow);
    const apiEndWindow = formatJobTimeString(jobDetails.endTimeWindow);

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
        const dateStr = formatLocalDate(values.deliveryStartDate, 'yyyy-MM-dd');

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

        const payload = {
          customerId: values.customerId,
          projectName: values.projectName,
          poNumber: values.poNumber,
          contactPersonName:
            selectedCustomer?.customerType === 'BUSINESS'
              ? selectedCustomer?.businessName
              : selectedCustomer?.individualContactName,
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
              ...(jobDetails as JobDTO),
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
    tabs,
    isPending,
    onSubmit,
  };
}