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
  validate?: (value: string) => boolean;
  label?: string;
}

export function MultipleInput({
  value = '',
  onChange,
  placeholder,
  className,
  disabled,
  type = 'text',
  validate = (s) =>
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
      s,
    ),
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
    } else if (e.key === 'Backspace' && !inputValue && valuesArray.length > 0) {
      const next = [...valuesArray];
      next.pop();
      onChange?.(next.join(', '));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addValues(inputValue, true);
    }
  };

  const addValues = (raw: string, isFromBlur = false) => {
    const cleaned = raw
      .replace(/,\s*$/, '') // Remove trailing comma
      .trim();

    if (!cleaned) return;

    const toAdd = cleaned
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let hasInvalid = false;

    const valid = toAdd.filter((s) => {
      const isUnique = !valuesArray.includes(s);
      const isValid = validate ? validate(s) : true;
      if (!isValid) hasInvalid = true;
      return isUnique && isValid;
    });

    if (valid.length > 0) {
      const next = [...valuesArray, ...valid];
      onChange?.(next.join(', '));
      // Only clear if everything was valid
      if (!hasInvalid) {
        setInputValue('');
      } else {
        // Keep the invalid parts in the input, but clear them if triggered by blur
        if (isFromBlur) {
          setInputValue('');
        } else {
          setInputValue(
            toAdd.filter((s) => !(validate ? validate(s) : true)).join(', '),
          );
        }
      }
    } else if (
      toAdd.length > 0 &&
      toAdd.every((s) => valuesArray.includes(s))
    ) {
      setInputValue('');
    } else if (hasInvalid) {
      // It couldn't add anything, and the only reason was invalid inputs.
      // Leave those inputs in the input bar so the user sees them.
      // However, if the user clicked away (blur), clear the invalid input entirely.
      if (isFromBlur) {
        setInputValue('');
      } else {
        setInputValue(toAdd.join(', '));
      }
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
          'flex flex-wrap gap-1 rounded-md border border-input bg-background px-3 py-1 min-h-[42px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className,
        )}
      >
        {valuesArray.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="inline-flex items-center gap-1 rounded-xl pl-4 my-1 pr-1 text-[14px] border-0 text-[#1F2937] font-semibold"
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
              className="-ml-2 h-auto min-h-0 bg-transparent p-0.5 -my-1 hover:bg-transparent focus:outline-none focus-visible:ring-0"
              aria-label={`Remove ${item}`}
              disabled={disabled}
            >
              <X className="h-2 w-2" />
            </Button>
          </span>
        ))}
        <Input
          type={type}
          placeholder={valuesArray.length === 0 ? placeholder : ''}
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
