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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Answer = 'yes' | 'no' | null;

interface Question {
  id: string;
  text: string;
  category: string;
}

const VEHICLE_INSPECTION_QUESTIONS: Question[] = [
  // Engine & Mechanical
  {
    id: 'engine_oil_level',
    category: 'Engine & Mechanical',
    text: 'Engine oil level - is it within acceptable range?',
  },
  {
    id: 'coolant_level',
    category: 'Engine & Mechanical',
    text: 'Coolant level - is it adequate and no leaks visible?',
  },
  {
    id: 'hydraulic_fluid',
    category: 'Engine & Mechanical',
    text: 'Hydraulic fluid levels - are they sufficient?',
  },
  {
    id: 'air_filter',
    category: 'Engine & Mechanical',
    text: 'Air filter - is it clean and functioning properly?',
  },
  {
    id: 'belts_hoses',
    category: 'Engine & Mechanical',
    text: 'Belts and hoses - are they in good condition with no cracks or wear?',
  },
  {
    id: 'battery',
    category: 'Engine & Mechanical',
    text: 'Battery - is it secure and terminals clean?',
  },
  {
    id: 'engine_noise',
    category: 'Engine & Mechanical',
    text: 'Engine sounds normal with no unusual noises?',
  },

  // Brakes
  {
    id: 'service_brakes',
    category: 'Brakes',
    text: 'Service brakes - do they respond correctly and hold firm?',
  },
  {
    id: 'parking_brake',
    category: 'Brakes',
    text: 'Parking brake - does it engage and hold securely?',
  },
  {
    id: 'brake_pressure',
    category: 'Brakes',
    text: 'Air brake pressure - is it building to proper PSI (if applicable)?',
  },
  {
    id: 'brake_fluid',
    category: 'Brakes',
    text: 'Brake fluid level - is it adequate with no leaks?',
  },
  {
    id: 'brake_lines',
    category: 'Brakes',
    text: 'Brake lines and hoses - are they intact with no damage?',
  },

  // Lights & Signals
  {
    id: 'headlights',
    category: 'Lights & Signals',
    text: 'Headlights and taillights - are they all functioning?',
  },
  {
    id: 'indicators',
    category: 'Lights & Signals',
    text: 'Indicators and hazard lights - are they working correctly?',
  },
  {
    id: 'reverse_lights',
    category: 'Lights & Signals',
    text: 'Reverse lights and horn - are they operational?',
  },
  {
    id: 'dashboard_lights',
    category: 'Lights & Signals',
    text: 'Dashboard warning lights - are there any active alerts?',
  },

  // Tyres & Wheels
  {
    id: 'tyres',
    category: 'Tyres & Wheels',
    text: 'Tyre tread and pressure - are they within safe limits?',
  },
  {
    id: 'wheel_nuts',
    category: 'Tyres & Wheels',
    text: 'Wheel nuts and fixings - are they tight and secure?',
  },
  {
    id: 'spare_tyre',
    category: 'Tyres & Wheels',
    text: 'Spare tyre - is it present and in good condition?',
  },

  // Body & Safety
  {
    id: 'mirrors',
    category: 'Body & Safety',
    text: 'Mirrors - are all mirrors clean and properly adjusted?',
  },
  {
    id: 'seatbelt',
    category: 'Body & Safety',
    text: 'Seatbelt - is it functioning and undamaged?',
  },
  {
    id: 'load_restraints',
    category: 'Body & Safety',
    text: 'Load restraints - are chains, straps, and binders in good condition?',
  },
  {
    id: 'fire_extinguisher',
    category: 'Body & Safety',
    text: 'Fire extinguisher - is it present and within service date?',
  },
];

const DAILY_COMPLIANCE_QUESTIONS: Question[] = [
  // Health & Wellness
  {
    id: 'sleep',
    category: 'Health & Wellness',
    text: 'Have you had adequate sleep (7+ hours)?',
  },
  {
    id: 'fit',
    category: 'Health & Wellness',
    text: 'Are you feeling physically fit to drive?',
  },
  {
    id: 'alcohol',
    category: 'Health & Wellness',
    text: 'Have you consumed alcohol in the last 24 hours?',
  },
  {
    id: 'meds',
    category: 'Health & Wellness',
    text: 'Are you taking any medications that may affect driving?',
  },

  // Documentation
  {
    id: 'license',
    category: 'Documentation',
    text: "Do you have a valid driver's license?",
  },
  {
    id: 'registration',
    category: 'Documentation',
    text: 'Do you have vehicle registration and insurance documents?',
  },

  // Route Planning
  {
    id: 'route_schedule',
    category: 'Route Planning',
    text: "Have you reviewed today's delivery schedule and route?",
  },
  {
    id: 'traffic_weather',
    category: 'Route Planning',
    text: 'Are you aware of any traffic or weather conditions?',
  },

  // Safety Protocols
  {
    id: 'safety_protocols',
    category: 'Safety Protocols',
    text: "Do you understand all safety protocols for today's deliveries?",
  },
];

interface QuestionCardProps {
  question: Question;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  image: string | null;
  onImageChange: (image: string | null) => void;
}

function QuestionCard({
  question,
  answer,
  onAnswer,
  notes,
  onNotesChange,
  image,
  onImageChange,
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
            'bg-[#00A63E] text-white border-[#00A63E] hover:bg-[#009036] hover:text-white hover:border-[#009036]'
          )}
          onClick={() => onAnswer('yes')}
        >
          <CircleCheckBig
            className={cn('h-5 w-5', answer === 'yes' ? 'text-white' : 'text-gray-400')}
          />
          <span className="font-medium">Yes</span>
        </Button>

        <Button
          variant="outline"
          className={cn(
            'h-12 justify-center gap-2 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all',
            answer === 'no' &&
            'bg-[#EF4444] text-white border-[#EF4444] hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626]'
          )}
          onClick={() => onAnswer('no')}
        >
          <CircleX
            className={cn('h-5 w-5', answer === 'no' ? 'text-white' : 'text-gray-400')}
          />
          <span className="font-medium">No</span>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1 mr-4">
          <div className="flex items-center justify-between mb-3">
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
            {answer === 'no' && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
                <span className="font-medium">
                  Some items were marked No — supervisor may need to be notified.
                </span>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface ChecklistProps {
  questions: Question[];
  alertMessage: string;
  submitButtonText: string;
}

function Checklist({
  questions,
  alertMessage,
  submitButtonText,
}: ChecklistProps) {
  const [answers, setAnswers] = React.useState<Record<string, Answer>>({});
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [images, setImages] = React.useState<Record<string, string | null>>({});
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round(
    (answeredCount / totalQuestions) * 100
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

  return (
    <div className="flex flex-col gap-1 p-4 w-[430px] bg-white min-h-screen border border-gray-200 rounded-lg">
      {/* Header Alert */}
      <div className="flex items-start gap-3 border border-[#B9F8CF] bg-[#F0FDF4] rounded-xl p-4 shadow-sm">
        <CircleCheck className="h-6 w-6 text-[#00A63E] shrink-0 mt-0.5" />
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
      <div className="flex flex-col gap-4 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
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
              {questions.filter((q) => q.category === category).map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  answer={answers[q.id] ?? null}
                  onAnswer={(ans) => handleAnswer(q.id, ans)}
                  notes={notes[q.id] ?? ''}
                  onNotesChange={(text) => handleNotes(q.id, text)}
                  image={images[q.id] ?? null}
                  onImageChange={(img) => handleImage(q.id, img)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      <div className="flex flex-col gap-2 pb-8">
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

      {/* Fixed Bottom Action Bar */}
      <div className="w-full pb-4">
        {remainingCount > 0 ? (
          <Button
            variant="secondary"
            className="w-full bg-gray-100 text-gray-400 hover:bg-gray-200 h-12 rounded-xl font-medium"
            disabled
          >
            Complete All {remainingCount} Remaining Questions
          </Button>
        ) : (
          <Button className="w-full bg-[#8E51FF] hover:bg-[#7c46e0] text-white h-12 rounded-xl text-lg font-semibold shadow-lg shadow-purple-200 active:scale-[0.98] transition-all">
            {submitButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DeliveriesPage() {
  const [selectedChecklist, setSelectedChecklist] = React.useState<
    'daily' | 'vehicle'
  >('daily');

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-50 min-h-screen">
      <div className="w-[430px] bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <RadioGroup
          defaultValue="daily"
          value={selectedChecklist}
          onValueChange={(v) => setSelectedChecklist(v as 'daily' | 'vehicle')}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily" className="cursor-pointer">
              Daily Compliance Checklist
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vehicle" id="vehicle" />
            <Label htmlFor="vehicle" className="cursor-pointer">
              Vehicle Inspection Checklist
            </Label>
          </div>
        </RadioGroup>
      </div>

      {selectedChecklist === 'daily' ? (
        <Checklist
          questions={DAILY_COMPLIANCE_QUESTIONS}
          alertMessage="Complete this checklist before starting your deliveries"
          submitButtonText="Submit Checklist"
        />
      ) : (
        <Checklist
          questions={VEHICLE_INSPECTION_QUESTIONS}
          alertMessage="Complete vehicle inspection for EXT-10042 before starting deliveries"
          submitButtonText="Confirm & Start Delivery"
        />
      )}
    </div>
  );
}
