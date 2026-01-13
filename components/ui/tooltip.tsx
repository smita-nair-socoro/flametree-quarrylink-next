'use client';
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

interface TooltipContentProps
  extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  variant?: 'default' | 'table' | 'purple' | 'white';
  backgroundClassName?: string;
  arrowClassName?: string;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  variant = 'default',
  backgroundClassName,
  arrowClassName,
  ...props
}: TooltipContentProps) {
  // If custom classes are provided, use them; otherwise use variant styles
  if (backgroundClassName || arrowClassName) {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip-content"
          sideOffset={sideOffset}
          className={cn(
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
            backgroundClassName || 'bg-primary text-primary-foreground',
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            className={cn(
              'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
              arrowClassName || 'bg-primary fill-primary'
            )}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  }

  // Use variant-based styling
  const variantStyles = {
    default: {
      content: 'bg-primary text-primary-foreground',
      arrow: 'bg-primary fill-primary',
    },
    table: {
      content: 'bg-gray-50 text-gray-900 border border-gray-200',
      arrow: 'bg-gray-50 fill-gray-50',
    },
    purple: {
      content: 'bg-purple-50 text-purple-900 border border-purple-100',
      arrow: 'bg-purple-50 fill-purple-50',
    },
    white: {
      content: 'bg-white text-gray-900 border border-gray-200 shadow-md',
      arrow: 'bg-white fill-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          styles.content,
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
            styles.arrow
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
