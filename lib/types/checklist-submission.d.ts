import { CHECKLIST_TYPE, ANSWER_VALUE } from './checklist-template-enums';
import { CHECKLIST_STATUS } from './checklist-enums';

export interface ChecklistSubmissionAnswer {
  questionId: number;
  questionCode: string;
  questionText: string;
  answerValue: ANSWER_VALUE;
  failed: boolean;
  comment: string;
  photoKeys: string[];
}

export interface ChecklistSubmissionSection {
  title: string;
  answeredCount: number;
  totalQuestions: number;
  answers: ChecklistSubmissionAnswer[];
}

export interface ChecklistSubmitPhotoRequest {
  photoKey: string;
  displayOrder: number;
}

export interface ChecklistSubmitAnswerRequest {
  questionId: number;
  answerValue: ANSWER_VALUE;
  comment: string | null;
  failed: boolean;
  photos: ChecklistSubmitPhotoRequest[];
}

export interface ChecklistSubmitRequest {
  templateId: number;
  checklistType: CHECKLIST_TYPE;
  truckId?: number;
  driverId?: number;
  docketId?: number;
  confirmed: boolean;
  snapshotJson?: string;
  answers: ChecklistSubmitAnswerRequest[];
  submittedAt: string;
}

export interface ChecklistSubmission {
  id?: number;
  submissionId: number;
  submissionNumber: string;
  checklistType: CHECKLIST_TYPE;
  status: CHECKLIST_STATUS;
  driverName: string;
  truckIdentifier: string;
  submittedAt: string;
  summaryNotes: string;
  sections: ChecklistSubmissionSection[];
}
