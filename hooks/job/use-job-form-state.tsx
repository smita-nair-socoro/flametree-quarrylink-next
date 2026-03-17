import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { JobItemsQueryOptions } from '@/lib/api/job';
import { calculateJobPricing } from '@/lib/utils/job-helpers';
import { JobItem } from '@/lib/types/job';

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

export function useJobFormState(jobId: number, isEditing: boolean = false) {
  const { data: jobDetails } = useQuery({
    ...JobItemsQueryOptions(jobId),
    enabled: isEditing && jobId > 0,
  });

  const mappedJobItems: JobItem[] = React.useMemo(() => {
    if (!jobDetails?.jobItems) return [];
    return jobDetails.jobItems
  }, [jobDetails?.jobItems]);

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !mappedJobItems.length) {
      return calculateJobPricing(null);
    }
    return calculateJobPricing(mappedJobItems);
  }, [isEditing, mappedJobItems]);

  return {
    jobDetails,
    jobItems: mappedJobItems,
    pricingBreakdown,
  };
}
