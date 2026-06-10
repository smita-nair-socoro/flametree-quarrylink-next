'use client';

import { BaseChecklist, Question, BaseChecklistAnswer } from './base-checklist';
import { useSubmitChecklist } from '@/lib/api/checklist';
import { Spinner } from '@/components/ui/spinner';
import { CHECKLIST_TYPE, ANSWER_VALUE } from '@/lib/types/checklist-template-enums';
import { TRUCK_TYPE } from '@/lib/types/truck-enums';
import { useChecklistTemplateStore } from '@/app/stores/checklist-template-store';
import { useTruckInspectionStatusStore } from '@/app/stores/truck-inspection-status-store';

export default function TruckInspectionChecklist({
  onSubmit,
  onBack,
  truckLicensePlate,
  truckId,
  truckType,
  driverId,
  docketId,
}: {
  onSubmit?: () => void;
  onBack?: () => void;
  truckLicensePlate?: string;
  truckId: number;
  truckType?: TRUCK_TYPE;
  driverId?: number;
  docketId?: number;
}) {
  const template = useChecklistTemplateStore((s) => s.truckTemplate);
  const setTruckInspectionPassed = useTruckInspectionStatusStore(
    (s) => s.setTruckInspectionPassed,
  );
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
          failOnAnswer: q.failOnAnswer,
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

  const handleSubmit = async (answers: BaseChecklistAnswer[], additionalNotes: string) => {
    if (!template) return;
    const failOnAnswerMap = new Map(questions.map((q) => [Number(q.id), q.failOnAnswer]));

    const photos: File[] = [];
    const mappedAnswers = answers.map((a) => {
      const photoRefs: { fileIndex: number; displayOrder: number }[] = [];
      if (a.image) {
        photoRefs.push({ fileIndex: photos.length, displayOrder: 1 });
        photos.push(a.image);
      }
      const failOn = failOnAnswerMap.get(a.questionId);
      return {
        questionId: a.questionId,
        answerValue: a.answer === 'yes' ? ANSWER_VALUE.YES : ANSWER_VALUE.NO,
        failed: failOn === ANSWER_VALUE.YES ? a.answer === 'yes' : a.answer === 'no',
        comment: a.notes?.trim() || null,
        photos: photoRefs,
      };
    });

    await submitChecklist.mutateAsync({
      request: {
        templateId: template.id,
        checklistType: CHECKLIST_TYPE.TRUCK,
        truckId,
        truckType,
        driverId,
        docketId,
        confirmed: false,
        submittedAt: new Date().toISOString(),
        additionalNotes: additionalNotes.trim() || undefined,
        answers: mappedAnswers,
      },
      photos,
    });
    if (docketId != null) {
      setTruckInspectionPassed(docketId);
    }
    onSubmit?.();
  };

  return (
    <BaseChecklist
      title={template?.name ?? 'Vehicle Inspection Checklist'}
      showBackButton={true}
      questions={questions}
      alertMessage={truckLicensePlate
        ? `Complete vehicle inspection for ${truckLicensePlate} before starting deliveries`
        : 'Complete vehicle inspection before starting deliveries'}
      submitButtonText="Confirm & Start Delivery"
      onBack={onBack}
      onSubmit={handleSubmit}
      needPhotoAndDetails={true}
      maxPhotoSize={8 * 1024 * 1024}
    />
  );
}
