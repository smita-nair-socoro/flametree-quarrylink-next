'use client';

import * as React from 'react';
import { Eye, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { QuoteSettingItem } from './types';

interface QuoteSettingsTableActionsProps {
  item: QuoteSettingItem;
  onView: (item: QuoteSettingItem) => void;
  onEdit: (item: QuoteSettingItem) => void;
  onSetDefault: (item: QuoteSettingItem) => void;
  onDelete: (item: QuoteSettingItem) => void;
}

export function QuoteSettingsTableActions({
  item,
  onView,
  onEdit,
  onSetDefault,
  onDelete,
}: QuoteSettingsTableActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onView(item);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onEdit(item);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        {!item.isDefault && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onSetDefault(item);
            }}
          >
            <Star className="h-4 w-4 mr-2" />
            Set as default
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDelete(item);
          }}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2 text-red-600" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
