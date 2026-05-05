'use client';

import * as React from 'react';
import {
  CircleCheck,
  CircleCheckBig,
  CircleX,
  ChevronDown,
  ChevronUp,
  Camera,
  AlertTriangle,
  X,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type Answer = 'yes' | 'no' | null;

export interface Question {
  id: string;
  text: string;
  category: string;
}

export interface BaseChecklistAnswer {
  questionId: number;
  answer: 'yes' | 'no';
  notes?: string;
  image?: string | null;
}

interface QuestionCardProps {
  question: Question;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  image: string | null;
  onImageChange: (image: string | null) => void;
  needPhotoAndDetails?: boolean;
}

export function QuestionCard({
  question,
  answer,
  onAnswer,
  notes,
  onNotesChange,
  image,
  onImageChange,
  needPhotoAndDetails = true,
}: QuestionCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-expand if answer is No
  React.useEffect(() => {
    if (answer === 'no') {
      setIsOpen(true);
    }
  }, [answer]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
      <p className="text-gray-900 font-medium text-[15px]">{question.text}</p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className={cn(
            'h-12 justify-center gap-2 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all',
            answer === 'yes' &&
            'bg-[#00A63E] text-white border-[#00A63E] hover:bg-[#009036] hover:text-white hover:border-[#009036]',
          )}
          onClick={() => onAnswer('yes')}
        >
          <CircleCheckBig
            className={cn(
              'h-5 w-5',
              answer === 'yes' ? 'text-white' : 'text-gray-400',
            )}
          />
          <span className="font-medium">Yes</span>
        </Button>

        <Button
          variant="outline"
          className={cn(
            'h-12 justify-center gap-2 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all',
            answer === 'no' &&
            'bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626]',
          )}
          onClick={() => onAnswer('no')}
        >
          <CircleX
            className={cn(
              'h-5 w-5',
              answer === 'no' ? 'text-white' : 'text-gray-400',
            )}
          />
          <span className="font-medium">No</span>
        </Button>
      </div>
      {needPhotoAndDetails && (

        <div className="flex items-start justify-between">
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex-1 mr-4"
          >
            <div className="flex items-center justify-between -mb-3">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto hover:bg-transparent text-gray-500 hover:text-gray-700"
                >
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs font-medium">
                    {isOpen ? 'Hide Details' : 'Add Details'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {image ? (
                  <div className="relative group">
                    <Image
                      src={image}
                      alt="Evidence"
                      className="h-10 w-10 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                      onClick={() => fileInputRef.current?.click()}
                      width={40}
                      height={40}
                    />
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageChange(null);
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 hover:bg-gray-50 h-5 w-5"
                    >
                      <X className="h-3 w-3 text-gray-500" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent text-gray-400 hover:text-gray-600 gap-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                    <span className="text-xs">Photo</span>
                  </Button>
                )}
              </div>
            </div>
            <CollapsibleContent className="space-y-3">
              <Textarea
                placeholder="Notes (Optional)"
                className="resize-none min-h-[80px] bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

interface BaseChecklistProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  questions: Question[];
  alertMessage: string;
  needPhotoAndDetails?: boolean;
  submitButtonText: string;
  onSubmit?: (answers: BaseChecklistAnswer[]) => void;
}

export function BaseChecklist({
  title,
  subtitle,
  showBackButton,
  onBack,
  needPhotoAndDetails = true,
  questions,
  alertMessage,
  submitButtonText,
  onSubmit,
}: BaseChecklistProps) {
  const [answers, setAnswers] = React.useState<Record<string, Answer>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [images, setImages] = React.useState<Record<string, string | null>>({});
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round(
    (answeredCount / totalQuestions) * 100,
  );

  const handleAnswer = (id: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  };

  const handleNotes = (id: string, text: string) => {
    setNotes((prev) => ({ ...prev, [id]: text }));
  };

  const handleImage = (id: string, image: string | null) => {
    setImages((prev) => ({ ...prev, [id]: image }));
  };

  const handleSelectAllYes = () => {
    const newAnswers: Record<string, Answer> = {};
    questions.forEach((q) => {
      newAnswers[q.id] = 'yes';
    });
    setAnswers(newAnswers);
  };

  const categories = Array.from(new Set(questions.map((q) => q.category)));
  const remainingCount = totalQuestions - answeredCount;
  const hasNoAnswers = Object.values(answers).some((answer) => answer === 'no');

  return (
    <div className="flex flex-col w-full bg-white h-full overflow-hidden">
      {/* Fixed Header */}
      <div className="shrink-0 px-4 py-4 border-b border-gray-100 flex items-center justify-center relative bg-white z-20 min-h-[64px]">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 h-8 w-8 text-gray-700 hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex flex-col items-center text-center px-10">
          <h1 className="text-[20px] font-bold text-[#0F172A] leading-tight">{title}</h1>
          {subtitle && <span className="text-[13px] text-gray-500 font-medium mt-0.5">{subtitle}</span>}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header Alert */}
        <div className="flex items-start gap-3 border border-[#B9F8CF] bg-[#F0FDF4] rounded-xl p-4 shadow-sm">
          <CircleCheck className="h-5 w-5 text-[#00A63E] shrink-0" />
          <span className="text-[#008236] font-medium text-[15px] leading-snug">
            {alertMessage}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2 py-2">
          <div className="flex justify-between items-end">
            <span className="text-gray-500 font-medium text-sm">
              {answeredCount} / {totalQuestions} answered
            </span>
            <span className="text-[#8E51FF] font-bold text-sm">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8E51FF] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Questions Header */}
        <div className="flex flex-col gap-4 sticky bg-white z-10 py-2 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-gray-900 font-bold text-2xl tracking-tight">
              Questions
            </h1>
            <Button
              onClick={handleSelectAllYes}
              className="bg-[#00A63E] hover:bg-[#009036] text-white gap-2 h-9 px-4 rounded-lg font-medium shadow-sm active:scale-95 transition-all"
            >
              <CircleCheckBig className="h-4 w-4" />
              Select All Yes
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex flex-col gap-8 pb-8 pt-2">
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-4">
              <h2 className="text-[#8E51FF] font-extrabold text-[16px] tracking-wide px-1">
                {category}
              </h2>
              <div className="flex flex-col gap-3">
                {questions
                  .filter((q) => q.category === category)
                  .map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      answer={answers[q.id] ?? null}
                      onAnswer={(ans) => handleAnswer(q.id, ans)}
                      notes={notes[q.id] ?? ''}
                      onNotesChange={(text) => handleNotes(q.id, text)}
                      image={images[q.id] ?? null}
                      onImageChange={(img) => handleImage(q.id, img)}
                      needPhotoAndDetails={needPhotoAndDetails}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Notes */}
        <div className="flex flex-col gap-2 pb-5">
          <h2 className="text-gray-900 font-bold text-[16px]">
            Additional Notes (Optional)
          </h2>
          <Textarea
            placeholder="Add any additional notes or concerns..."
            className="resize-none min-h-[100px] bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
        </div>
      </div >

      {/* Fixed Bottom Action Bar */}
      <div className="w-full p-4 flex flex-col gap-4 border-t border-gray-200">
        {hasNoAnswers && (
          <div className="flex items-center gap-2 p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 text-[13px]">
            <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
            <span className="font-medium leading-snug">
              Some items were marked No — supervisor may need to be notified.
            </span>
          </div>
        )}
        {remainingCount > 0 ? (
          <Button
            variant="secondary"
            className="w-full bg-gray-100 text-gray-400 hover:bg-gray-200 h-12 rounded-xl font-medium"
            disabled
          >
            Complete All {remainingCount} Remaining Questions
          </Button>
        ) : (
          <Button
            className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white h-12 rounded-xl text-lg font-semibold shadow-lg shadow-purple-200 active:scale-[0.98] transition-all"
            onClick={() => {
              const formatted: BaseChecklistAnswer[] = questions
                .filter((q) => answers[q.id] != null)
                .map((q) => ({
                  questionId: Number(q.id),
                  answer: answers[q.id] as 'yes' | 'no',
                  notes: notes[q.id] || undefined,
                  image: images[q.id] ?? null,
                }));
              onSubmit?.(formatted);
            }}
          >
            {submitButtonText}
          </Button>
        )}
      </div>
    </div >
  );
}
