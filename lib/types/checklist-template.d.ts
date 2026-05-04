import {
  CHECKLIST_TYPE,
  ANSWER_TYPE,
  FAIL_ON_ANSWER,
} from './checklist-template-enums';

export interface ChecklistTemplateQuestion {
  id: number;
  questionCode: string;
  questionText: string;
  answerType: ANSWER_TYPE;
  displayOrder: number;
  mandatory: boolean;
  allowsComment: boolean;
  allowsPhoto: boolean;
  failureLabel: string;
  failOnAnswer: FAIL_ON_ANSWER;
}

export interface ChecklistTemplateSection {
  id: number;
  title: string;
  displayOrder: number;
  questions: ChecklistTemplateQuestion[];
}

export interface ChecklistTemplate {
  id: number;
  code: string;
  name: string;
  checklistType: CHECKLIST_TYPE;
  sections: ChecklistTemplateSection[];
}
