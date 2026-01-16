'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DollarSignIcon } from 'lucide-react';

interface InputMaskProps
  extends Omit<React.ComponentProps<typeof Input>, 'type' | 'prefix'> {
  type: 'currency' | 'number' | 'abn';
  onValueChange?: (value: number | '') => void;
  onRawChange?: (rawValue: string) => void;
  thousandSeparator?: boolean;
  decimalPlaces?: number | false;
  allowNegative?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const formatNumber = (
  value: string,
  thousandSeparator: boolean = true
): string => {
  if (!value) {
    return '';
  }
  const parts = value.split('.');
  parts[0] = thousandSeparator
    ? parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : parts[0];
  return parts.join('.');
};

const formatABN = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  // Format the ABN as user types
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 5) {
    return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(
    5,
    8
  )} ${digits.slice(8)}`;
};

const handleNegative = (value: string): string => {
  return value.replace(/-/g, '');
};

const handleDecimalPlaces = (value: string, decimalPlaces: number): string => {
  const parts = value.split('.');
  if (parts[1] && parts[1].length > decimalPlaces) {
    parts[1] = parts[1].slice(0, decimalPlaces);
    return parts.join('.');
  }
  return value;
};

const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  (
    {
      type,
      value = '',
      onChange,
      onValueChange,
      onRawChange,
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      prefix,
      suffix,
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Initialize display value
    React.useEffect(() => {
      const stringValue = String(value || '');

      if (type === 'abn') {
        setDisplayValue(formatABN(stringValue));
      } else {
        // Remove non-numeric characters
        // " $1,234.50 abc " -> "1234.50"
        const cleanValue = stringValue.replace(/[^\d.-]/g, '');
        setDisplayValue(formatNumber(cleanValue, thousandSeparator));
      }
    }, [value, type, thousandSeparator]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (type === 'abn') {
        const rawDigits = inputValue.replace(/\D/g, '').slice(0, 11);
        const formatted = formatABN(rawDigits);
        setDisplayValue(formatted);
        onRawChange?.(rawDigits);
      } else {
        // Handle currency/number
        let cleanValue = inputValue.replace(/[^\d.-]/g, '');

        // Handle negative
        if (!allowNegative) {
          cleanValue = handleNegative(cleanValue);
        }

        // Handle decimal places
        if (decimalPlaces !== false && cleanValue.includes('.')) {
          cleanValue = handleDecimalPlaces(cleanValue, decimalPlaces);
        } else if (decimalPlaces === false) {
          cleanValue = cleanValue.replace(/\./g, '');
        }

        // Format the number
        const formatted = formatNumber(cleanValue, thousandSeparator);
        setDisplayValue(formatted);

        // Get the numeric value
        const numericValue =
          cleanValue === '' ? '' : parseFloat(cleanValue) || 0;
        onValueChange?.(numericValue);
      }

      onChange?.(e);
    };

    // Set appropriate inputMode for mobile keyboards
    const getInputMode =
      (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
        if (type === 'abn') {
          // Number pad for ABN
          return 'numeric';
        }
        if (type === 'currency' || type === 'number') {
          // Number pad for currency and number
          return decimalPlaces === false ? 'numeric' : 'decimal';
        }
        // Default to text for other types
        return 'text';
      };

    const inputProps = {
      ...props,
      ref,
      value: displayValue,
      onChange: handleChange,
      inputMode: getInputMode(),
      className: cn(prefix || suffix ? 'px-3' : '', className),
    };

    // If prefix or suffix is provided, we need to wrap the input in a div with a relative position
    if (prefix || suffix) {
      return (
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefix}
            </div>
          )}
          <Input
            {...inputProps}
            className={cn(
              prefix ? 'pl-10' : '',
              suffix ? 'pr-10' : '',
              className
            )}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return <Input {...inputProps} />;
  }
);

InputMask.displayName = 'InputMask';

// Specialised Components
type ABNInputProps = Omit<InputMaskProps, 'type'>;

const ABNInput = React.forwardRef<HTMLInputElement, ABNInputProps>(
  ({ placeholder = 'XX XXX XXX XXX', ...props }, ref) => (
    <InputMask {...props} ref={ref} type="abn" placeholder={placeholder} />
  )
);

ABNInput.displayName = 'ABNInput';

type CurrencyInputProps = Omit<InputMaskProps, 'type' | 'prefix'>;

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      placeholder = '0.00',
      ...props
    },
    ref
  ) => (
    <InputMask
      {...props}
      ref={ref}
      type="currency"
      thousandSeparator={thousandSeparator}
      decimalPlaces={decimalPlaces}
      allowNegative={allowNegative}
      placeholder={placeholder}
      prefix={<DollarSignIcon size={19} />}
    />
  )
);

CurrencyInput.displayName = 'CurrencyInput';

type QuantityUnit = 'TN' | 'm3' | 'Bags' | 'HOURLY' | 'LOAD' | 'KM' | '';
type QuantityInputProps = Omit<InputMaskProps, 'type' | 'suffix'> & {
  unit: QuantityUnit;
};

const QuantityInput = React.forwardRef<HTMLInputElement, QuantityInputProps>(
  (
    {
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      placeholder = '0',
      unit,
      ...props
    },
    ref
  ) => (
    <InputMask
      {...props}
      ref={ref}
      type="number"
      thousandSeparator={thousandSeparator}
      decimalPlaces={decimalPlaces}
      allowNegative={allowNegative}
      placeholder={placeholder}
      suffix={
        unit === 'm3'
          ? '/m³'
          : unit === 'TN'
          ? '/TN'
          : unit === 'Bags'
          ? '/Bags'
          : unit === 'HOURLY'
          ? '/Hourly'
          : unit === 'LOAD'
          ? '/Load'
          : unit === 'KM'
          ? '/km'
          : undefined
      }
    />
  )
);

QuantityInput.displayName = 'QuantityInput';

type NumberInputProps = Omit<InputMaskProps, 'type'>;

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      thousandSeparator = true,
      decimalPlaces = 2,
      allowNegative = false,
      placeholder = '0',
      ...props
    },
    ref
  ) => (
    <InputMask
      {...props}
      ref={ref}
      type="number"
      thousandSeparator={thousandSeparator}
      decimalPlaces={decimalPlaces}
      allowNegative={allowNegative}
      placeholder={placeholder}
    />
  )
);

NumberInput.displayName = 'NumberInput';

// Add more compoenets here
// eg. Quatnity like 5 TN, 2 kg and so on

export { InputMask, ABNInput, CurrencyInput, QuantityInput, NumberInput };
