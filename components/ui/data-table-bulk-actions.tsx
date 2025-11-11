'use client';

import React from 'react';
import { Button } from './button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function DataTableBulkActions({
  selectedCount,
  onClearSelection,
  children,
  className,
}: DataTableBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-md border bg-muted/50 p-3',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-7 px-2 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Clear Selection
        </Button>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
