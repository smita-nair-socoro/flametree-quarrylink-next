'use client';

import { useQuery } from '@tanstack/react-query';
import { BaseChecklist, Question } from './base-checklist';
import { DriverChecklistTemplateQueryOptions } from '@/lib/api/checklist';
import { Spinner } from '@/components/ui/spinner';

export default function DriverPreStartChecklist({
  onSubmit,
  onBack,
  driverName,
}: {
  onSubmit?: () => void;
  onBack?: () => void;
  driverName?: string;
}) {
  const { data: template, isLoading } = useQuery(DriverChecklistTemplateQueryOptions());

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
      title={template?.name ?? 'Daily Compliance Checklist'}
      questions={questions}
      alertMessage={driverName
        ? `Complete this checklist before starting your deliveries, ${driverName}`
        : 'Complete this checklist before starting your deliveries'}
      submitButtonText="Submit Checklist"
      onSubmit={onSubmit}
      showBackButton={!!onBack}
      onBack={onBack}
      needPhotoAndDetails={false}
    />
  );
}
