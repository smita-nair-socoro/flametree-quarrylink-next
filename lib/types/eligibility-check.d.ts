import { DocketDTO } from './docket';
import { JobDTO, JobItem } from './job';
import { QuotationDTO } from './quotation';

export interface PostEligibilityCheckResponse {
  blockingQuotations?: QuotationDTO[];
  blockingJobs?: JobDTO[];
  blockingDockets?: DocketDTO[];
  blockingJobItems?: JobItem[];
}

export interface EligibilityBlockingDependencies
  extends PostEligibilityCheckResponse {
  hasBlockingDependencies: boolean;
}
