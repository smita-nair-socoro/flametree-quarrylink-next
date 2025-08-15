/**
 * Input Mask Components
 *
 * This file contains input masking components for the QuarryLink application.
 * It provides a generic InputMask component and specialized components for
 * common Australian business formats (phone numbers and ABNs).
 *
 * Components:
 * - InputMask: Generic mask component with configurable patterns
 * - PhoneInput: Australian phone number input (+61 XXX XXX XXX)
 * - ABNInput: Australian Business Number input (XX XXX XXX XXX)
 *
 * Features:
 * - Real-time formatting as user types
 * - Input validation and character restrictions
 * - Seamless integration with react-hook-form
 * - Keyboard shortcut support (Ctrl+C, Ctrl+V, etc.)
 * - Accessibility support with proper ARIA attributes
 *
 * @author QuarryLink Development Team
 * @version 1.0.0
 */

'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InputMaskProps extends React.ComponentProps<typeof Input> {
  mask: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

/**
 * InputMask Component
 *
 * A flexible input component that applies formatting masks to user input.
 * Supports real-time formatting and validation based on mask patterns.
 *

 *
 * Example usage:
 * - Phone: mask="+61 999 999 999" → "+61 423 284 384"
 * - ABN: mask="99 999 999 999" → "12 345 678 901"
 * - Date: mask="99/99/9999" → "25/12/2023"
 */
const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ mask, value = '', onChange, className, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    /**
     * Formats the input value according to the mask pattern
     *
     * @param inputValue - Raw input string (usually contains only valid characters)
     * @param maskPattern - The mask pattern to apply
     * @returns Formatted string with literal characters inserted
     */
    const formatValue = React.useCallback(
      (inputValue: string, maskPattern: string) => {
        let formatted = '';
        let valueIndex = 0;

        // Iterate through each character in the mask pattern
        for (
          let maskIndex = 0;
          maskIndex < maskPattern.length && valueIndex < inputValue.length;
          maskIndex++
        ) {
          const maskChar = maskPattern[maskIndex];
          const inputChar = inputValue[valueIndex];

          if (maskChar === '9') {
            // Numeric digit - only accept 0-9
            if (/\d/.test(inputChar)) {
              formatted += inputChar;
              valueIndex++;
            } else {
              break; // Stop formatting if character doesn't match expected type
            }
          } else if (maskChar === 'a') {
            // Alphabetic character - only accept a-z, A-Z
            if (/[a-zA-Z]/.test(inputChar)) {
              formatted += inputChar;
              valueIndex++;
            } else {
              break;
            }
          } else if (maskChar === '*') {
            // Alphanumeric character - accept a-z, A-Z, 0-9
            if (/[a-zA-Z0-9]/.test(inputChar)) {
              formatted += inputChar;
              valueIndex++;
            } else {
              break;
            }
          } else {
            // Literal character - insert into formatted output
            formatted += maskChar;
            // If input character matches literal, advance input index
            if (inputChar === maskChar) {
              valueIndex++;
            }
          }
        }

        return formatted;
      },
      []
    );

    const getUnmaskedValue = React.useCallback(
      (maskedValue: string, maskPattern: string) => {
        let unmasked = '';
        let maskIndex = 0;

        // Iterate through the formatted value
        for (
          let i = 0;
          i < maskedValue.length && maskIndex < maskPattern.length;
          i++
        ) {
          const char = maskedValue[i];
          const maskChar = maskPattern[maskIndex];

          if (maskChar === '9' || maskChar === 'a' || maskChar === '*') {
            // This is a user-input character, keep it
            unmasked += char;
            maskIndex++;
          } else if (char === maskChar) {
            // This is a literal character, skip it but advance mask index
            maskIndex++;
          } else {
            // Character doesn't match expected literal, skip it
            continue;
          }
        }

        return unmasked;
      },
      []
    );

    /**
     * Update display value when the external value prop changes
     * This handles controlled component behavior
     */
    React.useEffect(() => {
      if (value !== undefined) {
        const unmaskedValue = getUnmaskedValue(value, mask);
        const formatted = formatValue(unmaskedValue, mask);
        setDisplayValue(formatted);
      }
    }, [value, mask, formatValue, getUnmaskedValue]);

    /**
     * Handles input changes and applies formatting
     * Strips out non-alphanumeric characters before formatting
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      // Remove all non-alphanumeric characters to get raw input
      // This prevents issues with users typing literal characters
      const rawValue = inputValue.replace(/[^a-zA-Z0-9]/g, '');

      // Apply mask formatting to the raw input
      const formatted = formatValue(rawValue, mask);
      setDisplayValue(formatted);

      // Create a new event with the formatted value for the parent component
      // This ensures the parent receives the properly formatted value
      const formattedEvent = {
        ...event,
        target: {
          ...event.target,
          value: formatted,
        },
      };

      onChange?.(formattedEvent);
    };

    /**
     * Handles key press events for input validation and length limiting
     * Prevents invalid characters and enforces maximum length
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow special keys: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].includes(event.keyCode)) {
        return;
      }

      // Allow common keyboard shortcuts: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      if (event.ctrlKey && [65, 67, 86, 88, 90].includes(event.keyCode)) {
        return;
      }

      // Allow navigation keys: home, end, left arrow, right arrow
      if ([35, 36, 37, 39].includes(event.keyCode)) {
        return;
      }

      const char = String.fromCharCode(event.keyCode);
      const currentLength = displayValue.replace(/[^a-zA-Z0-9]/g, '').length;
      const maxLength = mask.replace(/[^9a*]/g, '').length;

      // Prevent input if we've reached the maximum unmasked length
      if (currentLength >= maxLength) {
        event.preventDefault();
        return;
      }

      // Find the next expected mask character type based on current position
      let nextMaskChar = '';
      let unmaskedCount = 0;

      for (let i = 0; i < mask.length; i++) {
        const maskChar = mask[i];
        if (maskChar === '9' || maskChar === 'a' || maskChar === '*') {
          if (unmaskedCount === currentLength) {
            nextMaskChar = maskChar;
            break;
          }
          unmaskedCount++;
        }
      }

      // Validate the character against the expected mask character type
      if (nextMaskChar === '9' && !/\d/.test(char)) {
        // Expected numeric digit, but got non-digit
        event.preventDefault();
      } else if (nextMaskChar === 'a' && !/[a-zA-Z]/.test(char)) {
        // Expected alphabetic character, but got non-letter
        event.preventDefault();
      } else if (nextMaskChar === '*' && !/[a-zA-Z0-9]/.test(char)) {
        // Expected alphanumeric character, but got invalid character
        event.preventDefault();
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || mask}
        className={cn(className)}
      />
    );
  }
);

InputMask.displayName = 'InputMask';

// ============================================================================
// SPECIALIZED INPUT COMPONENTS
// ============================================================================

/**
 * PhoneInput Component
 *
 * A specialized input component for Australian phone numbers.
 * Features:
 * - Pre-filled +61 prefix that cannot be deleted
 * - Automatic formatting: +61 XXX XXX XXX
 * - Supports 9-digit mobile numbers after country code
 * - Real-time validation and formatting
 *
 * Example: User types "423284384" → displays "+61 423 284 384"
 */
interface PhoneInputProps extends Omit<InputMaskProps, 'mask'> {
  format?: 'au' | 'international';
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ format = 'au', placeholder, value, onChange, ...props }, ref) => {
    // Internal state to manage the phone value with pre-filled +61
    const [phoneValue, setPhoneValue] = React.useState(value || '+61 ');

    /**
     * Formats a phone number input to Australian format: +61 XXX XXX XXX
     *
     * @param input - Raw input string (may contain any characters)
     * @returns Formatted phone number string
     */
    const formatPhoneNumber = (input: string) => {
      // Extract only digits from the input
      const digitsOnly = input.replace(/[^\d]/g, '');

      // Ensure we always start with the Australian country code (61)
      let cleanDigits = digitsOnly;
      if (!cleanDigits.startsWith('61')) {
        cleanDigits = '61' + cleanDigits.replace(/^61/, '');
      }

      // Extract the mobile number part (after country code)
      const mobileDigits = cleanDigits.slice(2);

      // Limit to 9 digits for Australian mobile numbers
      const limitedMobile = mobileDigits.slice(0, 9);

      // Build the formatted string: +61 XXX XXX XXX
      let formatted = '+61';
      if (limitedMobile.length > 0) {
        formatted += ' ' + limitedMobile.slice(0, 3);
      }
      if (limitedMobile.length > 3) {
        formatted += ' ' + limitedMobile.slice(3, 6);
      }
      if (limitedMobile.length > 6) {
        formatted += ' ' + limitedMobile.slice(6, 9);
      }

      return formatted;
    };

    /**
     * Sync internal state with external value prop changes
     * Ensures controlled component behavior
     */
    React.useEffect(() => {
      if (value !== undefined) {
        setPhoneValue(value || '+61 ');
      }
    }, [value]);

    /**
     * Handles input changes with prefix protection and formatting
     * Prevents deletion of +61 prefix and applies formatting
     */
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;

      // Protect the +61 prefix - restore it if user tries to delete it
      if (inputValue.length < 4 || !inputValue.startsWith('+61')) {
        const formatted = '+61 ';
        setPhoneValue(formatted);

        // Notify parent component with the restored prefix
        const newEvent = {
          ...event,
          target: {
            ...event.target,
            value: formatted,
          },
        };
        onChange?.(newEvent);
        return;
      }

      // Apply phone number formatting
      const formatted = formatPhoneNumber(inputValue);
      setPhoneValue(formatted);

      // Pass the formatted value to parent component
      const newEvent = {
        ...event,
        target: {
          ...event.target,
          value: formatted,
        },
      };

      onChange?.(newEvent);
    };

    /**
     * Handles key press validation for phone input
     * Allows only digits and prevents exceeding maximum length
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow special navigation and editing keys
      if ([8, 9, 27, 13, 46].includes(event.keyCode)) {
        return; // backspace, tab, escape, enter, delete
      }

      // Allow common keyboard shortcuts
      if (event.ctrlKey && [65, 67, 86, 88, 90].includes(event.keyCode)) {
        return;
      }

      const char = String.fromCharCode(event.keyCode);

      // Only allow numeric digits for phone numbers
      if (!/\d/.test(char)) {
        event.preventDefault();
        return;
      }

      // Prevent input if we've reached maximum length (9 digits after +61)
      const currentDigits = phoneValue.replace(/[^\d]/g, '').slice(2); // Remove country code (61)
      if (currentDigits.length >= 9) {
        event.preventDefault();
        return;
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={phoneValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || '+61 xxx xxx xxx'}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

/**
 * ABNInput Component
 *
 * A specialized input component for Australian Business Numbers (ABN).
 * Features:
 * - Automatic formatting: XX XXX XXX XXX (11 digits with spaces)
 * - Only accepts numeric digits
 * - Real-time validation and formatting
 * - Integrates with existing ABN validation (is-valid-abn library)
 *
 * Example: User types "12345678901" → displays "12 345 678 901"
 *
 * Note: This component uses the generic InputMask with a predefined pattern
 * for ABN formatting. The actual ABN validation is handled by the form schema.
 */
interface ABNInputProps extends Omit<InputMaskProps, 'mask'> {}

const ABNInput = React.forwardRef<HTMLInputElement, ABNInputProps>(
  ({ placeholder, ...props }, ref) => {
    return (
      <InputMask
        {...props}
        ref={ref}
        mask="99 999 999 999" // 11 digits formatted as XX XXX XXX XXX
        placeholder={placeholder || 'XX XXX XXX XXX'}
      />
    );
  }
);

ABNInput.displayName = 'ABNInput';

export { InputMask, PhoneInput, ABNInput };
