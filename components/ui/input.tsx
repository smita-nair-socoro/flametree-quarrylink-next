import * as React from 'react';

import { cn } from '@/lib/utils';
import { getCurrencyLocale } from '@/lib/utils/tenant-config-helper';

interface ExtendedInputProps extends React.ComponentProps<'input'> {
  isNumber?: boolean;
  allowDecimal?: boolean;
  maxDecimals?: number;
  minDecimals?: number;
  suffix?: React.ReactNode;
  suffixPositionClassName?: string;
}

function Input({
  className,
  type,
  isNumber,
  allowDecimal,
  maxDecimals,
  minDecimals,
  suffix,
  onChange,
  onFocus,
  onBlur,
  onMouseUp,
  value,
  inputMode,
  pattern,
  suffixPositionClassName = '',
  ...props
}: ExtendedInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const displayValue = React.useMemo(() => {
    if (
      !isNumber ||
      isFocused ||
      value === '' ||
      value === undefined ||
      value === null
    ) {
      return value;
    }
    const num = Number(value);
    if (isNaN(num)) return value;
    const locale = getCurrencyLocale();
    return allowDecimal
      ? num.toLocaleString(locale, {
        minimumFractionDigits: minDecimals ?? 0,
        maximumFractionDigits: maxDecimals ?? 10,
      })
      : num.toLocaleString(locale, { maximumFractionDigits: 0 });
  }, [isNumber, isFocused, value, allowDecimal, maxDecimals, minDecimals]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber) {
        const raw = e.target.value;
        // Allow empty while typing
        if (raw === '') {
          onChange?.(e);
          return;
        }
        if (allowDecimal) {
          // Keep digits and a single decimal point
          let sanitized = raw.replace(/[^0-9.]/g, '');
          const parts = sanitized.split('.');
          if (parts.length > 2) {
            sanitized = `${parts[0]}.${parts.slice(1).join('')}`;
          }

          // If user starts with ".", normalize to "0." (e.g. ".5" -> "0.5")
          if (sanitized.startsWith('.')) {
            sanitized = `0${sanitized}`;
          }
          if (sanitized === '.') {
            sanitized = '0.';
          }

          if (maxDecimals !== undefined && sanitized.includes('.')) {
            const [intPart, fracPart] = sanitized.split('.');
            sanitized = `${intPart}.${fracPart.slice(0, maxDecimals)}`;
          }

          // Strip leading zeros when more than one digit before dot (e.g. 00012.3 -> 12.3)
          if (sanitized.includes('.')) {
            const [intPart, fracPart] = sanitized.split('.');
            const safeIntPart = intPart === '' ? '0' : intPart;
            const normalizedInt =
              safeIntPart.length > 1
                ? safeIntPart.replace(/^0+(?=\d)/, '')
                : safeIntPart;
            sanitized = `${normalizedInt}.${fracPart ?? ''}`;
          } else if (sanitized.length > 1) {
            sanitized = sanitized.replace(/^0+(?=\d)/, '');
          }
          e.target.value = sanitized;
        } else {
          // Keep only digits (integer)
          let digits = raw.replace(/\D/g, '');
          // Strip leading zeros when more than one digit
          if (digits.length > 1) {
            digits = digits.replace(/^0+(?=\d)/, '');
          }
          // Mutate the value so consumers receive the sanitized content
          e.target.value = digits;
        }
      }
      onChange?.(e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNumber, allowDecimal, onChange],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (isNumber) {
        const input = e.currentTarget;
        setTimeout(() => input.select(), 0);
      }
      onFocus?.(e);
    },
    [isNumber, onFocus],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const handleMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (isNumber) {
        // Prevent default to avoid deselecting text on mouse up
        e.preventDefault();
      }
      onMouseUp?.(e);
    },
    [isNumber, onMouseUp],
  );

  const inputElement = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-11 md:h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20  aria-invalid:border-destructive',
        suffix && 'pr-12',
        className,
      )}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseUp={handleMouseUp}
      // Provide helpful defaults for numeric entry without overriding explicit props
      inputMode={isNumber ? (inputMode ?? 'decimal') : inputMode}
      pattern={
        isNumber
          ? (pattern ?? (allowDecimal ? '[0-9,]*[.]?[0-9]*' : '[0-9,]*'))
          : pattern
      }
      {...props}
    />
  );

  if (suffix) {
    return (
      <div className={cn("relative", suffixPositionClassName)}>
        {inputElement}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          {suffix}
        </div>
      </div>
    );
  }

  return inputElement;
}

export { Input };
