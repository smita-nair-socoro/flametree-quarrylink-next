'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronUp,
  ChevronDown,
  CircleCheck,
  CircleCheckBig,
  CircleX,
  FileText,
  Truck,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  TruckSubmissionQueryOptions,
  DriverSubmissionQueryOptions,
} from '@/lib/api/checklist';
import {
  ANSWER_VALUE,
  CHECKLIST_TYPE,
} from '@/lib/types/checklist-template-enums';
import { CHECKLIST_STATUS } from '@/lib/types/checklist-enums';

export { CHECKLIST_TYPE };

interface ChecklistReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CHECKLIST_TYPE;
  submissionId: number;
  truckLicensePlate?: string;
  truckModel?: string;
}

export function ChecklistReportModal({
  open,
  onOpenChange,
  type,
  submissionId,
  truckLicensePlate,
  truckModel,
}: ChecklistReportModalProps) {
  const truckSubmissionQuery = useQuery({
    ...TruckSubmissionQueryOptions(submissionId),
    enabled: open && type === CHECKLIST_TYPE.TRUCK && submissionId > 0,
  });
  const driverSubmissionQuery = useQuery({
    ...DriverSubmissionQueryOptions(submissionId),
    enabled: open && type === CHECKLIST_TYPE.DRIVER && submissionId > 0,
  });

  const { data, isLoading } =
    type === CHECKLIST_TYPE.TRUCK ? truckSubmissionQuery : driverSubmissionQuery;

  const allAnswers = data?.sections.flatMap((s) => s.answers) ?? [];
  const totalQuestions =
    data?.sections.reduce((acc, s) => acc + s.totalQuestions, 0) ?? 0;
  const yesCount = allAnswers.filter(
    (a) => a.answerValue === ANSWER_VALUE.YES,
  ).length;
  const noCount = allAnswers.filter(
    (a) => a.answerValue === ANSWER_VALUE.NO,
  ).length;
  const unansweredCount = totalQuestions - allAnswers.length;
  const isPass = data?.status === CHECKLIST_STATUS.PASS;
  const passPercent = isPass
    ? totalQuestions > 0 ? Math.round((yesCount / totalQuestions) * 100) : 0
    : 0;

  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
    new Set(),
  );
  const [expandedPhotos, setExpandedPhotos] = React.useState<Set<number>>(
    new Set(),
  );
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const togglePhotos = (questionId: number) => {
    setExpandedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const submittedAt = data?.submittedAt
    ? format(new Date(data.submittedAt), 'EEE, d MMM yyyy, h:mm aa')
    : '—';

  const vehicleLabel =
    data?.truckIdentifier ||
    [truckModel, truckLicensePlate].filter(Boolean).join(' · ') ||
    '—';

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-h-[95vh] overflow-y-auto flex flex-col gap-6 p-6"
        style={{ maxWidth: 'min(95vw, 1100px)' }}
      >
        {/* Title */}
        <div className="pb-4 -mx-6 px-6 border-b">
          <DialogTitle className="text-2xl font-bold">
            {type === CHECKLIST_TYPE.DRIVER ? 'Checklist Report' : 'Inspection Report'}
          </DialogTitle>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="medium" />
          </div>
        ) : !data ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No checklist data available.
          </div>
        ) : (
          <>
            {/* Section 1 — Header Card */}
            <div className="border rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {type === CHECKLIST_TYPE.TRUCK ? (
                    <Truck className="w-5 h-5 text-[#7C3AED]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#7C3AED]" />
                  )}
                  <span className="font-semibold text-base">
                    {data.submissionNumber}
                  </span>
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full border ${isPass
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-red-400 text-red-600 bg-red-50'
                    }`}
                >
                  {isPass ? (
                    <CircleCheck className="w-3.5 h-3.5" />
                  ) : (
                    <CircleX className="w-3.5 h-3.5" />
                  )}
                  {isPass ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F9FAFB] rounded-md p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                    Driver
                  </span>
                  <span className="text-sm font-semibold">
                    {data.driverName || '—'}
                  </span>
                </div>
                {type === CHECKLIST_TYPE.TRUCK && (
                  <div className="bg-[#F9FAFB] rounded-md p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                      Vehicle
                    </span>
                    <span className="text-sm font-semibold">{vehicleLabel}</span>
                  </div>
                )}
                <div className="bg-[#F9FAFB] rounded-md p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                    Submitted
                  </span>
                  <span className="text-sm font-semibold">{submittedAt}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {yesCount} Yes · {noCount} No · {unansweredCount} Unanswered
                  </span>
                  <span
                    className={`font-semibold ${isPass ? 'text-[#7C3AED]' : 'text-red-600'}`}
                  >
                    {passPercent}% pass
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPass ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${passPercent}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Yes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    No
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                    Unanswered
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2 — Additional Notes (Truck only) */}
            {type === CHECKLIST_TYPE.TRUCK && data.additionalNotes && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 pl-1">
                  <div className="w-1 h-5 rounded-full bg-[#7C3AED]" />
                  <span className="font-bold text-base">Additional Notes</span>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-[#364153] whitespace-pre-wrap">{data.additionalNotes}</p>
                </div>
              </div>
            )}

            {/* Section 3 — Inspection / Checklist Answers */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 pl-1">
                <div className="w-1 h-5 rounded-full bg-[#7C3AED]" />
                <span className="font-bold text-base">
                  {type === CHECKLIST_TYPE.DRIVER
                    ? 'Checklist Answers'
                    : 'Inspection Answers'}
                </span>
              </div>

              {data.sections.map((section) => {
                const isCollapsed = collapsedSections.has(section.title);
                const yesInSection = section.answers.filter(
                  (a) => a.answerValue === ANSWER_VALUE.YES,
                ).length;

                return (
                  <div
                    key={section.title}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => toggleSection(section.title)}
                    >
                      <span className="text-sm font-semibold text-[#7C3AED]">
                        {section.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {yesInSection}
                          <CircleCheck className="w-3 h-3" />
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {section.totalQuestions} total
                        </span>
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {!isCollapsed && (
                      <div className="flex flex-col divide-y border-t">
                        {section.answers.map((answer) => {
                          const hasPhotos = answer.photoKeys?.length > 0;
                          const photosExpanded = expandedPhotos.has(answer.questionId);
                          return (
                            <div
                              key={answer.questionId}
                              className="px-4 py-3 flex flex-col gap-2"
                            >
                              {/* Question text + photo toggle */}
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm text-[#364153]">
                                  {answer.questionText}
                                </span>
                                {hasPhotos && (
                                  <button
                                    type="button"
                                    onClick={() => togglePhotos(answer.questionId)}
                                    className="text-xs text-[#7C3AED] font-medium shrink-0 hover:underline"
                                  >
                                    {photosExpanded
                                      ? `Hide ${answer.photoKeys.length} photo${answer.photoKeys.length > 1 ? 's' : ''}`
                                      : `Show ${answer.photoKeys.length} photo${answer.photoKeys.length > 1 ? 's' : ''}`}
                                  </button>
                                )}
                              </div>
                              {/* Badge */}
                              {answer.answerValue === ANSWER_VALUE.YES ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-medium w-fit">
                                  <CircleCheck className="w-3.5 h-3.5" />
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-medium w-fit">
                                  <CircleX className="w-3.5 h-3.5" />
                                  No
                                </span>
                              )}
                              {/* Comment + Photos aligned */}
                              {(!!answer.comment || (hasPhotos && photosExpanded)) && (
                                <div className="flex gap-3 items-start justify-between">
                                  {!!answer.comment ? (
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-muted-foreground">Notes:</p>
                                      <p className="text-sm text-[#364153] whitespace-pre-wrap">{answer.comment}</p>
                                    </div>
                                  ) : <div className="flex-1" />}
                                  {hasPhotos && photosExpanded && (
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                      {answer.photoKeys.map((key, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => setPreviewSrc(key)}
                                          className="relative w-[200px] h-[150px] rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                                        >
                                          <Image
                                            src={key}
                                            alt={`Photo ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <span className="flex items-center gap-1.5 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
                                              <CircleCheckBig className="w-3.5 h-3.5 text-green-400" />
                                              Photo Captured
                                            </span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    <ImagePreviewDialog
      open={!!previewSrc}
      onOpenChange={(open) => { if (!open) setPreviewSrc(null); }}
      src={previewSrc ?? ''}
    />
    </>
  );
}
