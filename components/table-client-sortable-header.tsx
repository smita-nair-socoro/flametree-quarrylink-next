import React from 'react';
import type { Column } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortableHeaderProps<TData> {
  column: Column<TData>;
  title: string;
}

export function TableClientSortableHeader<TData>({
  column,
  title,
}: SortableHeaderProps<TData>) {
  const sortState = column.getIsSorted();

  let Icon = ArrowUpDown;
  if (sortState === 'asc') Icon = ArrowUp;
  if (sortState === 'desc') Icon = ArrowDown;

  const handleClick = () => {
    if (!sortState) {
      // no sort → ascending
      column.toggleSorting(false);
    } else if (sortState === 'asc') {
      // asc → descending
      column.toggleSorting(true);
    } else {
      // desc → clear sort (back to unsorted)
      column.clearSorting();
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="
    flex w-full h-full justify-start items-center text-left !px-0 !py-0" // Override the button padding
    >
      {title}
      <Icon className="ml-2 h-4 w-4" />
    </Button>
  );
}
