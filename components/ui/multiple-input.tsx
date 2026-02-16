'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Rainbow chip colours for tags
const CHIP_COLORS = [
  { bgColour: '#DBEAFE', textColour: '#193CB8' },
  { bgColour: '#FEF9C2', textColour: '#894B00' },
  { bgColour: '#CEFAFE', textColour: '#005F78' },
  { bgColour: '#FCE7F3', textColour: '#A3004C' },
];

interface MultipleInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  fixedValues?: string[];
  validate?: (value: string) => boolean;
  label?: string
}

export function MultipleInput({
  value = '',
  onChange,
  placeholder,
  className,
  disabled,
  type = 'text',
  fixedValues = [],
  validate,
  label,
}: MultipleInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const valuesArray = React.useMemo(() => {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValues(inputValue);
    } else if (
      e.key === 'Backspace' &&
      !inputValue &&
      valuesArray.length > 0
    ) {
      const next = [...valuesArray];
      next.pop();
      onChange?.(next.join(', '));
    }
  };

  const handleBlur = () => {
    // If the user clicks away without pressing Enter or Comma, clear the input
    // This enforces the "only press enter or connect with ','" rule strictly
    setInputValue('');
  };

  const addValues = (raw: string) => {
    const cleaned = raw
      .replace(/,\s*$/, '') // Remove trailing comma
      .trim();

    if (!cleaned) return;

    const toAdd = cleaned.split(',').map((s) => s.trim()).filter(Boolean);

    // Filter out duplicates if needed (check both value and fixedValues)
    const valid = toAdd.filter((s) => {
      const isUnique = !valuesArray.includes(s) && !fixedValues.includes(s);
      const isValid = validate ? validate(s) : true;
      return isUnique && isValid;
    });

    if (valid.length > 0) {
      const next = [...valuesArray, ...valid];
      onChange?.(next.join(', '));
      setInputValue('');
    } else if (
      toAdd.length > 0 &&
      toAdd.every((s) => valuesArray.includes(s) || fixedValues.includes(s))
    ) {
      setInputValue('');
    }
  };

  const removeValue = (idx: number) => {
    const next = valuesArray.filter((_, i) => i !== idx);
    onChange?.(next.join(', '));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          'flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-1 min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className,
        )}
      >
        {fixedValues.map((item, idx) => (
          <span
            key={`fixed-${item}-${idx}`}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-[14px] border-0 text-[#1F2937] font-semibold bg-gray-200"
          >
            {item}
          </span>
        ))}
        {valuesArray.map((item, idx) => {
          if (fixedValues.includes(item)) return null;
          return (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-1 rounded-xl pl-2.5 text-[14px] border-0 text-[#1F2937] font-semibold"
              style={{
                backgroundColor: CHIP_COLORS[idx % CHIP_COLORS.length].bgColour,
                color: CHIP_COLORS[idx % CHIP_COLORS.length].textColour,
              }}
            >
              {item}
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeValue(idx)}
                className="-ml-2 h-auto min-h-0 bg-transparent p-0.5 hover:bg-transparent focus:outline-none focus-visible:ring-0"
                aria-label={`Remove ${item}`}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </span>
          );
        })}
        <Input
          type={type}
          placeholder={
            valuesArray.length === 0 && fixedValues.length === 0
              ? placeholder
              : ''
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] text-[14px] bg-transparent border-0 outline-none placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:border-none p-0 h-auto"
          disabled={disabled}
        />
      </div>
      {label && <span className="text-[12px] text-[#6B7280]">{label}</span>}
    </div>
  );
}
