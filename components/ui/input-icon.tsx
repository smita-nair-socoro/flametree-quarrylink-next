import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onStartIconClick?: React.MouseEventHandler<HTMLButtonElement>;
  onEndIconClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

/**
 * An input with optional clickable icons at the start and/or end.
 * Automatically adds padding to accommodate the icon(s).
 */
export const InputIcon = forwardRef<HTMLInputElement, InputIconProps>(
  (
    {
      startIcon,
      endIcon,
      onStartIconClick,
      onEndIconClick,
      className,
      ...props
    },
    ref
  ) => {
    const hasStart = Boolean(startIcon);
    const hasEnd = Boolean(endIcon);
    const padLeft = hasStart ? 'pl-10' : '';
    const padRight = hasEnd ? 'pr-10' : '';

    return (
      <div className={cn('relative w-full', className)}>
        <input
          ref={ref}
          {...props}
          className={cn(
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
            padLeft,
            padRight
          )}
        />
        {hasStart && (
          <button
            type="button"
            onClick={onStartIconClick}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {startIcon}
          </button>
        )}
        {hasEnd && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {endIcon}
          </button>
        )}
      </div>
    );
  }
);

InputIcon.displayName = 'InputIcon';
