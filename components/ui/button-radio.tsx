'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ButtonRadioOption {
  label: string;
  value: string;
}

interface ButtonRadioProps {
  options: ButtonRadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const ButtonRadio = ({
  options,
  value,
  defaultValue,
  onChange,
  className,
}: ButtonRadioProps) => {
  const [selectedValue, setSelectedValue] = React.useState(
    defaultValue || options[0]?.value || ''
  );

  // Update internal state when controlled value changes
  React.useEffect(() => {
    if (value !== undefined && value !== '') {
      setSelectedValue(value);
    }
  }, [value]);

  // Call onChange with initial defaultValue if provided
  React.useEffect(() => {
    if (defaultValue && onChange && value === undefined) {
      onChange(defaultValue);
    }
  }, [defaultValue, onChange, value]);

  const handleSelect = (optionValue: string) => {
    // Always update internal state for immediate UI feedback
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  return (
    <div className={cn('inline-flex w-full gap-2', className)}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? 'default' : 'ghost'}
            onClick={() => handleSelect(option.value)}
            className="border border-input flex-1 rounded-lg"
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ButtonRadio;
