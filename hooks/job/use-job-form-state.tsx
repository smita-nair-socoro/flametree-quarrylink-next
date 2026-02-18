import React from "react";

import { Job } from "@/lib/types/job";
import rawJson from "@/lib/tests/jobsDetailResponseData.json";
import { calculateJobPricing } from "@/lib/utils/job-helpers";

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

export function useJobFormState(selectedJob: Job | null, isEditing?: boolean) {
  const jobDetailData = React.useMemo(() => {
    return rawJson.items.find((job) => job.id === selectedJob?.id) as Job;
  }, [selectedJob?.id]);

  const getDetailedJob = React.useMemo(() => {
    if (isEditing && jobDetailData) {
      return jobDetailData as Job;
    }
    return null;
  }, [isEditing, jobDetailData]);

  const currentJob = isEditing ? getDetailedJob : null;

  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !currentJob) {
      return calculateJobPricing(null);
    }
    return calculateJobPricing(currentJob.jobLineItems);
  }, [isEditing, currentJob]);

  return {
    currentJob,
    pricingBreakdown,
  };
}