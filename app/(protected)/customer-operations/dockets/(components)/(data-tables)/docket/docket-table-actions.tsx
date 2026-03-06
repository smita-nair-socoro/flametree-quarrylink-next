'use client';

import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDocketActions,
  type DocketMenuAction,
} from '@/hooks/use-docket-actions';
import { Docket } from '@/lib/types/docket';

interface DocketTableActionsProps {
  docket: Docket;
}

export function DocketTableActions({ docket }: DocketTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { menuItems, confirmDialogs, viewDialog } = useDocketActions(docket);

  if (!menuItems.length) {
    return null;
  }

  const handleAction = (action: DocketMenuAction) => {
    setDropdownOpen(false);
    action.onSelect();
  };

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.key}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => handleAction(item)}
                className={
                  item.destructive ? 'text-red-600 focus:text-red-600' : ''
                }
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
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
