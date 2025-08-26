'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface EnhancedConfirmDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  title: string;
  description?: string;
  details?: string[];
  content?: string;
  additionalInfo?: {
    label: string;
    value: string;
  }[];
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
  titleIcon?: React.ReactNode;
  onConfirmAction: () => void;
}

export function EnhancedConfirmDialog({
  open,
  onOpenChangeAction,
  title,
  description,
  content,
  details = [],
  additionalInfo = [],
  cancelText = 'Cancel',
  confirmText,
  confirmVariant = 'default',
  confirmCustomColor,
  confirmCustomClass,
  confirmIcon,
  titleIcon,
  onConfirmAction,
}: EnhancedConfirmDialogProps) {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              {titleIcon && titleIcon}
              {title}
            </div>
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {content && (
          <>
            <div className="border-t border-gray-200 -mx-6"></div>
            <div className="text-sm text-gray-600">{content}</div>
          </>
        )}

        {details.length > 0 && (
          <>
            <div className="border-t border-gray-200 -mx-6"></div>
            <div>
              <p className="text-md font-semibold mb-2">Warnings:</p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-outside pl-4">
                {details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        {additionalInfo.length > 0 && (
          <>
            <div className="border-t border-gray-200 -mx-6"></div>
            <div className="space-y-1">
              {additionalInfo.map((info, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-600">{info.label}: </span>
                  <span className="text-gray-900">{info.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="border-t border-gray-200 -mx-6"></div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            {cancelText}
          </Button>
          <Button
            variant={confirmCustomColor ? undefined : confirmVariant}
            className={confirmCustomClass}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
