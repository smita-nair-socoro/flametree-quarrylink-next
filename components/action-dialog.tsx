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
  title: string;
  titleIcon?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  cancelText?: string;
  confirmText: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
  confirmIcon?: React.ReactNode;
  onConfirmAction: () => void;
  confirmActionNeeded?: boolean;
}

export function ActionDialog({
  open,
  onOpenChangeAction,
  title,
  titleIcon,
  description,
  content,
  cancelText = 'Cancel',
  confirmText,
  confirmVariant = 'default',
  confirmCustomColor,
  confirmCustomClass,
  confirmIcon,
  onConfirmAction,
  confirmActionNeeded = true,
}: ActionDialogProps) {
  // Create custom styles if color is provided
  const customButtonStyle = confirmCustomColor
    ? {
        backgroundColor: confirmCustomColor,
        borderColor: confirmCustomColor,
        color: 'white',
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="w-[512px] max-w-full gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              {titleIcon && titleIcon}
              {title}
            </div>
          </DialogTitle>
        </DialogHeader>

        {description && <>{description}</>}

        {content && <>{content}</>}

        <div className="border-t border-gray-200"></div>
        <div className="grid grid-cols-2 space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChangeAction(false)}
            className={cn(confirmActionNeeded ? 'h-10' : 'col-span-2 h-11')}
          >
            {cancelText}
          </Button>
          {confirmActionNeeded && (
            <Button
              variant={confirmCustomColor ? undefined : confirmVariant}
              className={cn('h-10', confirmCustomClass)}
              style={customButtonStyle}
              onClick={() => {
                onConfirmAction();
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
      </DialogContent>
    </Dialog>
  );
}
