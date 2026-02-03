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

// Context to share touch device state and open control between Tooltip and TooltipTrigger
const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileClickable: boolean;
}>({
  open: false,
  setOpen: () => {},
  mobileClickable: true,
});

// Check for touch device - runs once on module load to avoid hydration issues
const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

interface TooltipProps extends React.ComponentProps<
  typeof TooltipPrimitive.Root
> {
  /**
   * When true, tooltip will show/hide on click instead of hover on touch devices.
   * Default is true - set to false for navigation items that should not intercept clicks.
   */
  mobileClickable?: boolean;
}

function Tooltip({
  mobileClickable = true,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  ...props
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled mode when mobileClickable is enabled on touch devices
  const shouldControlInternally = mobileClickable && isTouchDevice;

  const open = shouldControlInternally ? internalOpen : controlledOpen;
  const onOpenChange = shouldControlInternally
    ? setInternalOpen
    : controlledOnOpenChange;

  return (
    <TooltipContext.Provider
      value={{ open: internalOpen, setOpen: setInternalOpen, mobileClickable }}
    >
      <TooltipProvider>
        <TooltipPrimitive.Root
          data-slot="tooltip"
          open={open}
          onOpenChange={onOpenChange}
          {...props}
        />
      </TooltipProvider>
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  onClick,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const { open, setOpen, mobileClickable } = React.useContext(TooltipContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (mobileClickable && isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    }
    onClick?.(e);
  };

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onClick={handleClick}
      {...props}
    />
  );
}

interface TooltipContentProps extends React.ComponentProps<
  typeof TooltipPrimitive.Content
> {
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
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            className={cn(
              'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
              arrowClassName || 'bg-primary fill-primary',
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
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
            styles.arrow,
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
