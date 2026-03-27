'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ActionDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  customWidth?: string;
  title?: string;
  titleIcon?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  cancelText?: string;
  cancelButtonClass?: string;
  cancelActionNeeded?: boolean;
  confirmText?: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
  confirmIcon?: React.ReactNode;
  onConfirmAction?: () => void;
  confirmActionNeeded?: boolean;
  confirmDisabled?: boolean;
  textbelowbutton?: React.ReactNode;
  hideSeparator?: boolean;
  preventOutsideClose?: boolean;
  padding?: string;
  titlePadding?: string;
}

export function ActionDialog({
  open,
  onOpenChangeAction,
  customWidth,
  title,
  titleIcon,
  description,
  content,
  cancelText = 'Cancel',
  cancelButtonClass,
  cancelActionNeeded = true,
  confirmText,
  confirmVariant = 'default',
  confirmCustomColor,
  confirmCustomClass,
  confirmIcon,
  onConfirmAction,
  confirmActionNeeded = true,
  confirmDisabled = false,
  textbelowbutton,
  hideSeparator = false,
  preventOutsideClose = false,
  padding = '',
  titlePadding = '',
}: ActionDialogProps) {
  // Create custom styles if color is provided
  const customButtonStyle = React.useMemo(
    () =>
      confirmCustomColor
        ? {
            backgroundColor: confirmCustomColor,
            borderColor: confirmCustomColor,
            color: 'white',
          }
        : undefined,
    [confirmCustomColor],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent
        className={cn(
          customWidth ? customWidth : 'w-[512px]',
          'max-w-full  max-h-[90vh] overflow-y-auto ',
          padding ? `${padding}` : 'p-[24.62px] gap-6',
        )}
        style={{ scrollbarGutter: 'auto' }}
        onInteractOutside={(event) => {
          if (preventOutsideClose) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (preventOutsideClose) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader
          className={cn(
            title ? '' : 'hidden',
            titlePadding && `${titlePadding}`,
          )}
        >
          <DialogTitle>
            <div className="flex items-center gap-2">
              {titleIcon && titleIcon}
              {title}
            </div>
          </DialogTitle>
        </DialogHeader>

        {description && <>{description}</>}

        {content && <>{content}</>}

        {!hideSeparator && <div className="border-t border-gray-200"></div>}
        <div
          className={cn(
            'flex flex-col-reverse gap-3 md:grid md:gap-2',
            cancelActionNeeded ? 'md:grid-cols-2' : 'md:grid-cols-1',
          )}
        >
          {cancelActionNeeded && (
            <Button
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              className={cn(
                confirmActionNeeded
                  ? ''
                  : cancelButtonClass
                    ? cancelButtonClass
                    : 'md:col-span-2',
              )}
            >
              {cancelText}
            </Button>
          )}

          {confirmActionNeeded && (
            <Button
              variant={confirmCustomColor ? undefined : confirmVariant}
              className={cn(confirmCustomClass)}
              style={customButtonStyle}
              disabled={confirmDisabled}
              onClick={() => {
                onConfirmAction?.();
                onOpenChangeAction(false);
              }}
            >
              {confirmIcon && (
                <span className="pr-[7px] h-4 w-4 flex items-center justify-center">
                  {confirmIcon}
                </span>
              )}
              {confirmText}
            </Button>
          )}
        </div>
        {textbelowbutton && textbelowbutton}
      </DialogContent>
    </Dialog>
  );
}
