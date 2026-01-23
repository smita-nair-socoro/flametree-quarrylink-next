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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  title?: string;
  description?: string;
  note?: string;
  btnVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  onConfirmAction: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChangeAction,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to remove this item?',
  btnVariant = 'default',
  note,
  onConfirmAction,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-1">{description}</DialogDescription>
        </DialogHeader>

        {note && (
          <div className="mt-4 mb-6 rounded-md bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
            {note}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end md:gap-2">
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            Cancel
          </Button>
          <Button
            variant={btnVariant}
            onClick={() => {
              onConfirmAction();
              onOpenChangeAction(false);
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
