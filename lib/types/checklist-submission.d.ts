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

export interface ChecklistSubmission {
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
