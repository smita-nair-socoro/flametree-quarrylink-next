import * as React from 'react';

import { cn } from '@/lib/utils';

interface ExtendedInputProps extends React.ComponentProps<'input'> {
  isNumber?: boolean;
}

function Input({
  className,
  type,
  isNumber,
  onChange,
  onFocus,
  onMouseUp,
  inputMode,
  pattern,
  ...props
}: ExtendedInputProps) {
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber) {
        const raw = e.target.value;
        // Allow empty while typing
        if (raw === '') {
          onChange?.(e);
          return;
        }
        // Keep only digits
        let digits = raw.replace(/\D/g, '');
        // Strip leading zeros when more than one digit
        if (digits.length > 1) {
          digits = digits.replace(/^0+(?=\d)/, '');
        }
        // Mutate the value so consumers receive the sanitized content
        e.target.value = digits;
      }
      onChange?.(e);
    },
    [isNumber, onChange]
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (isNumber) {
        e.currentTarget.select();
      }
      onFocus?.(e);
    },
    [isNumber, onFocus]
  );

  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (isNumber) {
        // Prevent default to avoid deselecting text on mouse up
        e.preventDefault();
      }
      onMouseUp?.(e);
    },
    [isNumber, onMouseUp]
  );

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20  aria-invalid:border-destructive',
        className
      )}
      onChange={handleChange}
      onFocus={handleFocus}
      onMouseUp={handleMouseUp}
      // Provide helpful defaults for numeric entry without overriding explicit props
      inputMode={isNumber ? inputMode ?? 'numeric' : inputMode}
      pattern={isNumber ? pattern ?? '[0-9]*' : pattern}
      {...props}
    />
  );
}

export { Input };
