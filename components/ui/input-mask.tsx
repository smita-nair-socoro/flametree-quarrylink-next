'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DollarSignIcon } from 'lucide-react';

/*
 * Notes:
 * - For currency/number: `onChange` receives the native event where `event.target.value`
 *   is the *formatted string* (e.g., "1,234.50"). Use `onValueChange` to get the clean numeric value.
 * - For ABN: `onChange` receives the native/synthesized event whose value is the *formatted ABN*
 *   (e.g., "12 345 678 901"). Use `onRawChange` to get the 11 raw digits.
 */

interface InputMaskProps
  extends Omit<React.ComponentProps<typeof Input>, 'prefix' | 'type'> {
  type: 'currency' | 'number' | 'abn'; // Add more types here
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  thousandSeparator?: boolean;
  decimalPlaces?: false | 2 | 3;
  allowNegative?: boolean;
  prefix?: React.ReactNode | string;
  suffix?: React.ReactNode | string;
  // For ABN: callback to get raw digits for validation
  onRawChange?: (rawValue: string) => void;
  // For currency/number: callback to get clean numeric value
  onValueChange?: (value: number | '') => void;
}

/*
 * InputMask Component
 *
 * A production-ready input component with type-based formatting and validation.
 * Supports currency, number, and ABN input types with customizable formatting.
 *
 * Features:
 * - Type-safe with value?: string | number support
 * - Clean onValueChange callback (no synthetic events)
 * - Modern event.key instead of deprecated keyCode
 * - Proper zero value handling (doesn't hide zeros)
 * - Right-anchored caret positioning for comma handling
 * - Live decimal place clamping while typing
 * - Paste protection with length limits for ABN
 * - Raw value extraction for ABN validation
 * - Smart inputMode (numeric for integers, decimal for floats)
 * - Normalized formatting on blur
 * - Cross-browser compatible
 *
 * Example usage:
 * - Currency: type="currency" onValueChange={(num) => setAmount(num)}
 * - Number: type="number" thousandSeparator={false} decimalPlaces={false}
 * - ABN: type="abn" onRawChange={(raw) => validateABN(raw)}
 * - With prefix: prefix={<DollarSignIcon />} → shows icon on left
 * - With suffix: suffix="%" → shows "%" on right
 */
const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  (
    {
      type,
      value = '',
      onChange,
      className,
      placeholder,
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      prefix,
      suffix,
      onRawChange,
      onValueChange,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Determine behavior based on type
    const isCurrency = type === 'currency' || type === 'number';
    const isABN = type === 'abn';
    const useThousandSeparator = thousandSeparator && isCurrency;

    // format number with thousand separators for currency display
    const formatCurrency = React.useCallback(
      (numValue: number): string => {
        if (isNaN(numValue)) return '';
        const actualDecimalPlaces = decimalPlaces === false ? 0 : decimalPlaces;

        if (useThousandSeparator) {
          return numValue.toLocaleString('en-US', {
            minimumFractionDigits: actualDecimalPlaces,
            maximumFractionDigits: actualDecimalPlaces,
          });
        } else {
          return numValue.toFixed(actualDecimalPlaces);
        }
      },
      [decimalPlaces, useThousandSeparator]
    );

    // format currency input with thousand separators while typing
    const formatCurrencyInput = React.useCallback(
      (inputValue: string): string => {
        if (!inputValue) return '';

        // Remove existing thousand separators and non-numeric chars except decimal and minus
        const cleanValue = inputValue.replace(/[^\d.-]/g, '');

        // Handle negative sign
        const isNegative = cleanValue.startsWith('-');
        const absoluteValue = isNegative ? cleanValue.substring(1) : cleanValue;

        // Split by decimal point
        const parts = absoluteValue.split('.');
        const integerPart = parts[0];
        let decimalPart = parts[1];

        // Restrict decimal digits while typing
        if (decimalPart !== undefined && decimalPlaces !== false) {
          decimalPart = decimalPart.slice(0, decimalPlaces);
        }

        // Add thousand separators to integer part if enabled
        const formattedInteger = useThousandSeparator
          ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          : integerPart;

        // Reconstruct the value
        let formatted = formattedInteger;
        if (decimalPart !== undefined && decimalPlaces !== false) {
          formatted += '.' + decimalPart;
        }

        return isNegative ? '-' + formatted : formatted;
      },
      [useThousandSeparator, decimalPlaces]
    );

    // Parse a formatted currency string into a number.
    // Strips commas, currency symbols, etc.
    // Returns NaN if the value cannot be parsed (instead of coercing to 0).
    const parseCurrency = React.useCallback((value: string): number => {
      const cleanValue = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      return Number.isFinite(parsed) ? parsed : NaN;
    }, []);

    // Simple helpers for ABN formatting
    const unmaskDigits = React.useCallback(
      (s: string) => s.replace(/\D/g, ''),
      []
    );

    const formatABN = React.useCallback(
      (digits: string) => {
        // Strip all non-digits and limit to 11 characters (ABN max length)
        const clean = unmaskDigits(digits).slice(0, 11);

        // Regex breakdown: ^(\d{2})(\d{3})(\d{3})(\d{0,3})?$
        // - (\d{2})   → first 2 digits
        // - (\d{3})   → next 3 digits
        // - (\d{3})   → next 3 digits
        // - (\d{0,3}) → optional last 0–3 digits (makes total up to 11)
        //
        // Replace callback: insert spaces between groups
        // → "12 345 678 901" when all 11 digits entered
        // → "12 345 678" if fewer than 11 digits
        return clean.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{0,3})?$/,
          (_, a, b, c, d = '') => (d ? `${a} ${b} ${c} ${d}` : `${a} ${b} ${c}`)
        );
      },
      [unmaskDigits]
    );

    // Update display value when the external value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        if (isCurrency) {
          // Handle empty values properly
          if (value === '' || value === null || value === undefined) {
            setDisplayValue('');
          } else {
            const numValue =
              typeof value === 'string' ? parseCurrency(value) : Number(value);

            // Don't hide zero values - format them properly
            if (!isNaN(numValue)) {
              setDisplayValue(formatCurrencyInput(String(numValue)));
            } else {
              setDisplayValue('');
            }
          }
        } else if (isABN) {
          const formatted = formatABN(String(value));
          setDisplayValue(formatted);
        }
      }
    }, [
      value,
      isCurrency,
      isABN,
      formatCurrencyInput,
      parseCurrency,
      formatABN,
    ]);

    // Handle input changes and apply formatting
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      if (isCurrency) {
        // Handle currency/number input with optional thousand separator formatting
        let cleanValue = inputValue;

        // Handle negative values
        if (!allowNegative && cleanValue.startsWith('-')) {
          cleanValue = cleanValue.substring(1);
        }

        // Remove existing formatting to get raw input and strip extra minus signs
        const rawValue = cleanValue
          .replace(/[^\d.-]/g, '')
          .replace(/(?!^)-/g, ''); // remove any '-' not at start

        // Build regex based on decimal settings
        let regex: RegExp;
        if (decimalPlaces === false) {
          regex = allowNegative ? /^-?\d*$/ : /^\d*$/;
        } else {
          regex = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;
        }

        if (rawValue === '' || regex.test(rawValue)) {
          // Store cursor position before formatting (anchor from right for better comma handling)
          const start = event.target.selectionStart ?? inputValue.length;
          const rightOffset = inputValue.length - start;

          // Format the input based on settings
          const formattedValue = formatCurrencyInput(rawValue);
          setDisplayValue(formattedValue);

          // Calculate and set cursor position after formatting (right-anchored)
          setTimeout(() => {
            if (inputRef.current && isFocused) {
              const newPos = Math.max(0, formattedValue.length - rightOffset);
              inputRef.current.setSelectionRange(newPos, newPos);
            }
          }, 0);

          // Clean numeric value for callback (handle in-progress states)
          const numValue: number | '' =
            rawValue === '' || rawValue === '-' || rawValue === '.'
              ? ''
              : Number(rawValue);

          // Call clean value callback and pass through original event unchanged
          onValueChange?.(numValue);
          onChange?.(event);
        }
      } else if (isABN) {
        // Handle ABN input - extract digits and format
        const rawValue = unmaskDigits(inputValue).slice(0, 11);
        const formatted = formatABN(rawValue);
        setDisplayValue(formatted);

        // Create event with formatted value and call callbacks
        const formattedEvent = {
          ...event,
          target: {
            ...event.target,
            value: formatted,
          },
        };

        onRawChange?.(rawValue);
        onChange?.(formattedEvent);
      }
    };

    // Handle focus for currency inputs - maintain formatting
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        setIsFocused(true);
      }
      props.onFocus?.(event);
    };

    // Handle blur for currency inputs - normalise formatting with proper decimal places
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (isCurrency) {
        setIsFocused(false);

        // Normalize decimal places on blur (e.g., "0" becomes "0.00", "2" becomes "2.00" if decimalPlaces=2)
        const trimmed = displayValue.trim();
        if (trimmed !== '') {
          const numValue = parseCurrency(displayValue);
          if (!isNaN(numValue)) {
            const normalizedValue = formatCurrency(numValue);
            setDisplayValue(normalizedValue);
          }
        }
      }
      props.onBlur?.(event);
    };

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLInputElement) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Always render with wrapper for consistent behavior
    return (
      <div className={cn('relative w-full', className)}>
        <Input
          {...props}
          ref={combinedRef}
          type="text"
          inputMode={
            isCurrency
              ? decimalPlaces === false
                ? 'numeric'
                : 'decimal'
              : props.inputMode
          }
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={
            placeholder ||
            (isCurrency
              ? decimalPlaces === false
                ? '0'
                : '0.00'
              : 'XX XXX XXX XXX')
          }
          className={cn(prefix && 'pl-10', suffix && 'pr-10')}
        />
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            {prefix}
          </div>
        )}
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

InputMask.displayName = 'InputMask';

// ============================================================================
// SPECIALIZED INPUT COMPONENTS
// ============================================================================

// Note: PhoneInput has been moved to /components/ui/phone-input.tsx
// This uses the Shadcn Phone Input implementation with international support

/*
 * ABNInput Component
 *
 * A specialized input component for Australian Business Numbers (ABN).
 * Features:
 * - Automatic formatting: XX XXX XXX XXX (11 digits with spaces)
 * - Only accepts numeric digits (max 11 digits)
 * - Paste protection with automatic truncation
 * - Raw digit extraction for validation
 * - Real-time validation and formatting
 * - Integrates with existing ABN validation (is-valid-abn library)
 *
 * Example: User types "12345678901" → displays "12 345 678 901"
 * Usage: <ABNInput onRawChange={(raw) => validateABN(raw)} />
 */
interface ABNInputProps extends Omit<InputMaskProps, 'type'> {
  // No additional props needed
}

const ABNInput = React.forwardRef<HTMLInputElement, ABNInputProps>(
  ({ placeholder, ...props }, ref) => {
    return (
      <InputMask
        {...props}
        ref={ref}
        type="abn"
        placeholder={placeholder || 'XX XXX XXX XXX'}
      />
    );
  }
);

ABNInput.displayName = 'ABNInput';

/*
 * CurrencyInput Component
 *
 * A specialized input component for currency amounts with thousand separators and dollar icon.
 * Features:
 * - Dollar sign icon on the left (using prefix)
 * - Real-time thousand separator formatting while typing
 * - Maintains cursor position during formatting
 * - Configurable decimal places (default: 2)
 * - Optional negative values support
 *
 * Example: User types "1234.56" → displays "$ 1,234.56" with icon
 */
interface CurrencyInputProps extends Omit<InputMaskProps, 'type' | 'prefix'> {
  // All other props inherited from InputMaskProps
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <InputMask
        {...props}
        ref={ref}
        type="currency"
        thousandSeparator={thousandSeparator}
        decimalPlaces={decimalPlaces}
        allowNegative={allowNegative}
        placeholder={placeholder || (decimalPlaces === false ? '0' : '0.00')}
        prefix={<DollarSignIcon size={19} />}
        className={className}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

/*
 * NumberInput Component
 *
 * A specialized input component for numbers with optional thousand separators (no currency symbol).
 * Features:
 * - Optional thousand separator formatting while typing
 * - Maintains cursor position during formatting
 * - Configurable decimal places (default: 2, false for integers)
 * - Optional negative values support
 * - No currency symbol or icon
 *
 * Example: User types "1234.56" → displays "1,234.56" (with thousandSeparator=true)
 */
interface NumberInputProps extends Omit<InputMaskProps, 'type'> {
  // All other props inherited from InputMaskProps
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      placeholder,
      ...props
    },
    ref
  ) => {
    return (
      <InputMask
        {...props}
        ref={ref}
        type="number"
        thousandSeparator={thousandSeparator}
        decimalPlaces={decimalPlaces}
        allowNegative={allowNegative}
        placeholder={placeholder || (decimalPlaces === false ? '0' : '0.00')}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';

export { ABNInput, CurrencyInput, NumberInput };
