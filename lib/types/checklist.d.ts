import { CHECKLIST_STATUS } from './checklist-enums';

export interface ChecklistItem {
  submissionId: number;
  submissionNumber: string;
  submittedAt: string;
  status: CHECKLIST_STATUS;
  summaryNotes: string;
  viewDetailsAvailable: boolean;
}

export interface ChecklistItemsPage {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ChecklistItem[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}
