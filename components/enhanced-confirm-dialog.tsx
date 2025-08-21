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
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {content && <div className="mt-3 text-sm text-gray-600">{content}</div>}

        {details.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">This will:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {details.map((detail, index) => (
                <li key={index}>- {detail}</li>
              ))}
            </ul>
          </div>
        )}
        {additionalInfo.length > 0 && (
          <div className="mt-4 space-y-1">
            {additionalInfo.map((info, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-600">{info.label}: </span>
                <span className="text-gray-900">{info.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-6">
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
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
