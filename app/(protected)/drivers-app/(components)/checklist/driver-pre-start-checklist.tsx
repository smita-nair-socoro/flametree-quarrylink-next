'use client';

import { BaseChecklist, Question, BaseChecklistAnswer } from './base-checklist';
import { useSubmitChecklist } from '@/lib/api/checklist';
import { Spinner } from '@/components/ui/spinner';
import { CHECKLIST_TYPE, ANSWER_VALUE } from '@/lib/types/checklist-template-enums';
import { useChecklistTemplateStore } from '@/app/stores/checklist-template-store';

export default function DriverPreStartChecklist({
  onSubmit,
  onBack,
  driverName,
  driverId,
}: {
  onSubmit?: () => void;
  onBack?: () => void;
  driverName?: string;
  driverId: number;
}) {
  const template = useChecklistTemplateStore((s) => s.driverTemplate);
  const submitChecklist = useSubmitChecklist();
  const isLoading = !template;

  const questions: Question[] = (template?.sections ?? [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .flatMap((section) =>
      (section.questions ?? [])
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((q) => ({
          id: String(q.id),
          text: q.questionText,
          category: section.title,
        })),
    );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen gap-3">
        <Spinner size="medium" />
        <p className="text-sm text-gray-400">Loading checklist...</p>
      </div>
    );
  }

  const handleSubmit = async (answers: BaseChecklistAnswer[]) => {
    if (!template) return;
    await submitChecklist.mutateAsync({
      templateId: template.id,
      checklistType: CHECKLIST_TYPE.DRIVER,
      driverId,
      confirmed: false,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answerValue: a.answer === 'yes' ? ANSWER_VALUE.YES : ANSWER_VALUE.NO,
        failed: a.answer === 'no',
        comment: a.notes,
      })),
    });
    onSubmit?.();
  };

  return (
    <BaseChecklist
      title={template?.name ?? 'Daily Compliance Checklist'}
      questions={questions}
      alertMessage={driverName
        ? `Complete this checklist before starting your deliveries, ${driverName}`
        : 'Complete this checklist before starting your deliveries'}
      submitButtonText="Submit Checklist"
      onSubmit={handleSubmit}
      showBackButton={!!onBack}
      onBack={onBack}
      needPhotoAndDetails={false}
    />
  );
}
