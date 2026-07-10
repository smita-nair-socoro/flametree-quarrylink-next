'use client';

import * as React from 'react';
import { MoreHorizontal, Pencil, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { QuoteSettingItem } from '@/lib/types/terms-conditions';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';

interface QuoteSettingsTableActionsProps {
  item: QuoteSettingItem;
  onEdit: (item: QuoteSettingItem) => void;
  onSetDefault: (item: QuoteSettingItem) => void;
  onDelete: (item: QuoteSettingItem) => void;
}

export function QuoteSettingsTableActions({
  item,
  onEdit,
  onSetDefault,
  onDelete,
}: Readonly<QuoteSettingsTableActionsProps>) {
  const [open, setOpen] = React.useState(false);
  const isUploadedDocument =
    item.type === QuoteSettingItemType.UPLOADED_DOCUMENT;

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
      <DropdownMenuContent align="end" className="w-56">
        {isUploadedDocument ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit(item);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            View / Replace PDF
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit(item);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            View / Edit
          </DropdownMenuItem>
        )}
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
