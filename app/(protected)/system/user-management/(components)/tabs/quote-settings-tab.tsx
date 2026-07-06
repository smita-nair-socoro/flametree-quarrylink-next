'use client';

import React from 'react';
import { FileText, Link2, ChevronDown, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { DataTableClient } from '@/components/ui/data-table-client';
import { notifyInfo, notifySuccess } from '@/lib/toast';
import { createQuoteSettingsColumns } from '../(data-tables)/quote-settings/columns';
import {
  QuoteSettingItem,
  QuoteSettingItemType,
} from '../(data-tables)/quote-settings/types';

const initialItems: QuoteSettingItem[] = [
  {
    id: '1',
    name: 'Standard Supply Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '2',
    name: 'Credit Account Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '3',
    name: 'Pre-Paid / COD Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '4',
    name: 'Customer Collection Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '5',
    name: 'TESTING',
    type: QuoteSettingItemType.EXTERNAL_LINK,
    url: '#',
    isDefault: true,
    updatedAt: '2026-07-03',
  },
  {
    id: '6',
    name: 'Delivery Policy',
    type: QuoteSettingItemType.UPLOADED_DOCUMENT,
    fileName: 'delivery-policy.pdf',
    fileSizeLabel: '242.5 KB',
    url: '#',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
];

const addItemMessages: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'Adding a text template is coming soon.',
  [QuoteSettingItemType.UPLOADED_DOCUMENT]:
    'Replacing the policy document is coming soon.',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'Adding an external link is coming soon.',
};

export default function QuoteSettingsTab() {
  const [items, setItems] = React.useState<QuoteSettingItem[]>(initialItems);

  const handleView = React.useCallback((item: QuoteSettingItem) => {
    notifyInfo(`Viewing "${item.name}" is coming soon.`);
  }, []);

  const handleEdit = React.useCallback((item: QuoteSettingItem) => {
    notifyInfo(`Editing "${item.name}" is coming soon.`);
  }, []);

  const handleSetDefault = React.useCallback((item: QuoteSettingItem) => {
    setItems((prev) =>
      prev.map((it) => ({ ...it, isDefault: it.id === item.id })),
    );
    notifySuccess(`"${item.name}" set as default.`);
  }, []);

  const handleDelete = React.useCallback((item: QuoteSettingItem) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    notifySuccess(`"${item.name}" deleted.`);
  }, []);

  const handleAdd = React.useCallback((type: QuoteSettingItemType) => {
    notifyInfo(addItemMessages[type]);
  }, []);

  const columns = React.useMemo(
    () =>
      createQuoteSettingsColumns({
        onView: handleView,
        onEdit: handleEdit,
        onSetDefault: handleSetDefault,
        onDelete: handleDelete,
      }),
    [handleView, handleEdit, handleSetDefault, handleDelete],
  );

  return (
    <div className="py-3 space-y-3">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Quote Settings</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage text templates, a policy document, and external links for
            customer quotes. Staff attach these in the quote editor under
            Notes &amp; Terms.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="shrink-0">
              <Plus className="h-4 w-4" />
              Add Item
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleAdd(QuoteSettingItemType.TEXT_TEMPLATE)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAdd(QuoteSettingItemType.UPLOADED_DOCUMENT)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Replace document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAdd(QuoteSettingItemType.EXTERNAL_LINK)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              External link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border border-[#E4E4E7] rounded-lg bg-white overflow-hidden p-2">
        <DataTableClient
          tableId="quote_settings_data_table"
          data={items}
          columns={columns}
          simpleTable
        />
      </div>
    </div>
  );
}
