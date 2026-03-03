'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  type DocketMenuAction,
  useDocketActions,
} from '@/hooks/use-docket-actions';
import { Docket } from '@/lib/types/docket';

interface DocketActionButtonsProps {
  docket: Docket | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function DocketActionButtons({
  docket,
  layout = 'expanded',
}: DocketActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { menuItems, confirmDialogs, viewDialog } = useDocketActions(docket);

  if (!docket || !docket.id || menuItems.length === 0) {
    return null;
  }

  const renderMenuItems = (items: DocketMenuAction[]) =>
    items.map((item) => (
      <DropdownMenuItem
        key={item.key}
        onClick={item.onSelect}
        className={item.destructive ? 'text-red-600 focus:text-red-600' : ''}
      >
        <item.icon
          className={`mr-2 h-4 w-4 ${
            item.destructive ? 'text-red-600' : ''
          }`}
        />
        <span className={item.destructive ? 'text-red-600' : ''}>
          {item.label}
        </span>
      </DropdownMenuItem>
    ));

  if (!isDesktop || layout === 'compact') {
    return (
      <div className="flex">
        {confirmDialogs}
        {viewDialog}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {renderMenuItems(menuItems)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const [primaryAction, ...secondaryActions] = menuItems;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {confirmDialogs}
      {viewDialog}
      {primaryAction ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={primaryAction.onSelect}
          className="rounded-none border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <primaryAction.icon className="mr-2 h-4 w-4" />
          {primaryAction.label}
        </Button>
      ) : null}
      {secondaryActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {renderMenuItems(secondaryActions)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
