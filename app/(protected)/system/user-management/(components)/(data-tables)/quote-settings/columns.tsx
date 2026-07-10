'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FileText, Link2, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCalendarDate } from '@/lib/utils/date';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { QuoteSettingItem } from '@/lib/types/terms-conditions';
import { QuoteSettingsTableActions } from './quote-settings-table-actions';

const typeLabels: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'Text template',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'External link',
  [QuoteSettingItemType.UPLOADED_DOCUMENT]: 'Uploaded document',
};

const typeBadgeClasses: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'border-[#DDD6FF] bg-[#F5F3FF] text-[#7008E7]',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'border-[#BEDBFF] bg-[#EFF6FF] text-[#1447E6]',
  [QuoteSettingItemType.UPLOADED_DOCUMENT]: 'border-[#FFC9C9] bg-[#FEF2F2] text-[#C10007]',
};

const typeIcons: Record<QuoteSettingItemType, typeof FileText> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: FileText,
  [QuoteSettingItemType.EXTERNAL_LINK]: Link2,
  [QuoteSettingItemType.UPLOADED_DOCUMENT]: Paperclip,
};

interface CreateQuoteSettingsColumnsArgs {
  onView: (item: QuoteSettingItem) => void;
  onEdit: (item: QuoteSettingItem) => void;
  onSetDefault: (item: QuoteSettingItem) => void;
  onDelete: (item: QuoteSettingItem) => void;
}

export const createQuoteSettingsColumns = ({
  onView,
  onEdit,
  onSetDefault,
  onDelete,
}: CreateQuoteSettingsColumnsArgs): ColumnDef<QuoteSettingItem>[] => [
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
    accessorFn: (row) => row.type,
    header: 'Type',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={typeBadgeClasses[row.original.type]}
      >
        {typeLabels[row.original.type]}
      </Badge>
    ),
  },
  {
    id: 'default',
    accessorFn: (row) => row.isDefault,
    header: 'Default',
    cell: ({ row }) =>
      row.original.isDefault ? (
        <Badge>Default</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: 'updatedAt',
    accessorFn: (row) => row.updatedAt,
    header: 'Last updated',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatCalendarDate(row.original.updatedAt, 'd MMM yyyy')}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <QuoteSettingsTableActions
        item={row.original}
        onView={onView}
        onEdit={onEdit}
        onSetDefault={onSetDefault}
        onDelete={onDelete}
      />
    ),
  },
];
