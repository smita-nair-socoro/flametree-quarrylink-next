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
import { QuoteContentLibraryItem } from '@/lib/types/terms-conditions';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { useQuoteSettingsActions } from '@/hooks/use-quote-settings-action';

interface QuoteSettingsTableActionsProps {
  item: QuoteContentLibraryItem;
}

export function QuoteSettingsTableActions({
  item,
}: Readonly<QuoteSettingsTableActionsProps>) {
  const [open, setOpen] = React.useState(false);
  const isDocument = item.type === QuoteSettingItemType.POLICY_DOCUMENT;

  const {
    actions,
    textTemplateDialog,
    externalLinkDialog,
    policyDocumentDialog,
  } = useQuoteSettingsActions();

  return (
    <div>
      {textTemplateDialog}
      {externalLinkDialog}
      {policyDocumentDialog}
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
          {isDocument ? (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                actions.edit(item);
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
                actions.edit(item);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              View / Edit
            </DropdownMenuItem>
          )}
          {!item.defaultItem && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                actions.setDefault(item);
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
              actions.remove(item);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
