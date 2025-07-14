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

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  title?: string;
  description?: string;
  note?: string;
  onConfirmAction: () => void;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChangeAction,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to remove this item?',
  note,
  onConfirmAction,
}: ConfirmDeleteDialogProps) {
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

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChangeAction(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
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
