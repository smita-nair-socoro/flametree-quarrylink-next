'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FileText, Link2, Paperclip } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { QuoteContentLibraryItem } from '@/lib/types/terms-conditions';
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

export const quoteSettingsColumns: ColumnDef<QuoteContentLibraryItem>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.name,
    header: 'Name',
    cell: ({ row }) => {
      const Icon = typeIcons[row.original.type];
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
    cell: ({ row }) => (
      <TableBadges names={[typeLabels[row.original.type]]} visibleCount={1} />
    ),
  },
  {
    id: 'default',
    header: 'Default',
    accessorFn: (row) => row.defaultItem,
    cell: ({ row }) =>
      row.original.defaultItem ? (
        <TableBadges names={['Default']} visibleCount={1} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <QuoteSettingsTableActions item={row.original} />,
  },
];
