import { DRIVER_COMPLIANCE_STATUS } from './driver-compliance-enums';

export interface DriverPreStartChecklist {
  submissionId: number;
  submissionNumber: string;
  submittedAt: string;
  status: DRIVER_COMPLIANCE_STATUS;
  summaryNotes: string;
  viewDetailsAvailable: boolean;
}

export interface DriverPreStartChecklistsPage {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: DriverPreStartChecklist[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}
