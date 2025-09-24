import React from 'react';
import { cn } from '@/lib/utils';

export interface TableTwoDataInOneCellProps {
  primaryData: React.ReactNode;
  secondaryData: React.ReactNode;
  primaryClassName?: string;
  secondaryClassName?: string;
  containerClassName?: string;
}

export function TableTwoDataInOneCell({
  primaryData,
  secondaryData,
  primaryClassName,
  secondaryClassName,
  containerClassName,
}: TableTwoDataInOneCellProps) {
  return (
    <div className={cn('flex flex-col', containerClassName)}>
      <div className={cn('font-medium text-sm', primaryClassName)}>
        {primaryData}
      </div>
      <div
        className={cn('text-xs text-muted-foreground mt-1', secondaryClassName)}
      >
        {secondaryData}
      </div>
    </div>
  );
}
