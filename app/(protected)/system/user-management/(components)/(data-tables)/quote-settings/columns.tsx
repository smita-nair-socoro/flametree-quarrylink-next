'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FileText, Link2, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { QuoteSettingItem } from '@/lib/types/terms-conditions';
import { QUOTE_SETTING_TYPE_BADGE_CLASSES } from '@/lib/utils';
import { isPolicyDocument } from '@/hooks/use-quote-settings-action';
import { QuoteSettingsTableActions } from './quote-settings-table-actions';

const typeLabels: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'Text template',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'External link',
  [QuoteSettingItemType.POLICY_DOCUMENT]: 'Policy document',
};

const typeIcons: Record<QuoteSettingItemType, typeof FileText> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: FileText,
  [QuoteSettingItemType.EXTERNAL_LINK]: Link2,
  [QuoteSettingItemType.POLICY_DOCUMENT]: Paperclip,
};

interface CreateQuoteSettingsColumnsArgs {
  onEdit: (item: QuoteSettingItem) => void;
  onSetDefault: (item: QuoteSettingItem) => void;
  onDelete: (item: QuoteSettingItem) => void;
}

export const createQuoteSettingsColumns = ({
  onEdit,
  onSetDefault,
  onDelete,
}: CreateQuoteSettingsColumnsArgs): ColumnDef<QuoteSettingItem>[] => [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: 'Name',
    cell: ({ row }) => {
      const Icon = isPolicyDocument(row.original)
        ? Paperclip
        : typeIcons[row.original.type];
      return (
        <div className="flex items-center gap-2 py-2">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-[#09090B]">
            {row.original.name}
          </span>
        </div>
      );
    },
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = isPolicyDocument(row.original)
        ? QuoteSettingItemType.POLICY_DOCUMENT
        : row.original.type;
      return (
        <Badge
          variant="outline"
          className={QUOTE_SETTING_TYPE_BADGE_CLASSES[type]}
        >
          {typeLabels[type]}
        </Badge>
      );
    },
  },
  {
    id: 'default',
    header: 'Default',
    accessorFn: (row) => row.defaultItem,
    cell: ({ row }) =>
      row.original.defaultItem ? (
        <Badge>Default</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <QuoteSettingsTableActions
        item={row.original}
        onEdit={onEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
      />
    ),
  },
];
