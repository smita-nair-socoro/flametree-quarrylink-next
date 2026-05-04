import { TRUCK_INSPECTION_STATUS } from './truck-inspection-enums';

export interface TruckInspection {
  submissionId: number;
  submissionNumber: string;
  submittedAt: string;
  status: TRUCK_INSPECTION_STATUS;
  summaryNotes: string;
  viewDetailsAvailable: boolean;
}

export interface TruckInspectionsPage {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: TruckInspection[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}
