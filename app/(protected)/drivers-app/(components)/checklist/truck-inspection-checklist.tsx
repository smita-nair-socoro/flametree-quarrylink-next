'use client';

import { useQuery } from '@tanstack/react-query';
import { BaseChecklist, Question } from './base-checklist';
import { TruckChecklistTemplateQueryOptions } from '@/lib/api/checklist';
import { Spinner } from '@/components/ui/spinner';

export default function TruckInspectionChecklist({
  onSubmit,
  onBack,
  truckLicensePlate,
}: {
  onSubmit?: () => void;
  onBack?: () => void;
  truckLicensePlate?: string;
}) {
  const { data: template, isLoading } = useQuery(TruckChecklistTemplateQueryOptions());

  const questions: Question[] = (template?.sections ?? [])
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .flatMap((section) =>
      section.questions
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
      onSubmit={onSubmit}
      needPhotoAndDetails={true}
    />
  );
}
