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
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  fixedValues?: string[];
}

export function MultipleInput({
  value = [],
  onChange,
  placeholder,
  className,
  disabled,
  type = 'text',
  fixedValues = [],
}: MultipleInputProps) {
  const [inputValue, setInputValue] = React.useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValues(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      const next = [...value];
      next.pop();
      onChange?.(next);
    }
  };

  const handleBlur = () => {
    addValues(inputValue);
  };

  const addValues = (raw: string) => {
    const cleaned = raw
      .replace(/,\s*$/, '') // Remove trailing comma
      .trim();

    if (!cleaned) return;

    const toAdd = cleaned.split(/[\s,]+/).filter(Boolean);

    // Filter out duplicates if needed (check both value and fixedValues)
    const valid = toAdd.filter(
      (s) => !value.includes(s) && !fixedValues.includes(s)
    );

    if (valid.length > 0) {
      onChange?.([...value, ...valid]);
      setInputValue('');
    } else if (
      toAdd.length > 0 &&
      toAdd.every((s) => value.includes(s) || fixedValues.includes(s))
    ) {
      setInputValue('');
    }
  };

  const removeValue = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-1 min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      {fixedValues.map((item, idx) => (
        <span
          key={`fixed-${item}-${idx}`}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-0.5 text-[14px] font-normal border-0 text-[#1F2937] font-semibold bg-gray-200"
        >
          {item}
        </span>
      ))}
      {value.map((item, idx) => {
        if (fixedValues.includes(item)) return null;
        return (
          <span
            key={`${item}-${idx}`}
            className="inline-flex items-center gap-1 rounded-xl pl-2.5 text-[14px] font-normal border-0 text-[#1F2937] font-semibold"
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
          value.length === 0 && fixedValues.length === 0 ? placeholder : ''
        }
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[120px] text-[14px] bg-transparent border-0 outline-none placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:border-none p-0 h-auto"
        disabled={disabled}
      />
    </div>
  );
}
