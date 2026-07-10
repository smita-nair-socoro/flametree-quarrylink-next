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
import { DataTableClientBasic } from '@/components/ui/data-table-client-basic';
import { useQuoteSettingsActions } from '@/hooks/use-quote-settings-action';
import { createQuoteSettingsColumns } from '../(data-tables)/quote-settings/columns';
import { AddQuoteSettingDialog } from '../(data-tables)/quote-settings/add-quote-setting-dialog';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';

export default function QuoteSettingsTab() {
  const {
    items,
    actions,
    addDialogType,
    documentItem,
    editingTextTemplate,
    closeAddDialog,
    submitTextTemplate,
    submitExternalLink,
    submitReplaceDocument,
  } = useQuoteSettingsActions();

  const columns = React.useMemo(
    () =>
      createQuoteSettingsColumns({
        onView: actions.view,
        onEdit: actions.edit,
        onSetDefault: actions.setDefault,
        onDelete: actions.remove,
      }),
    [actions],
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
              onClick={() => actions.add(QuoteSettingItemType.TEXT_TEMPLATE)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                actions.add(QuoteSettingItemType.UPLOADED_DOCUMENT)
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Add document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => actions.add(QuoteSettingItemType.EXTERNAL_LINK)}
            >
              <Link2 className="h-4 w-4 mr-2" />
              External link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border border-[#E4E4E7] rounded-lg bg-white p-4">
        <DataTableClientBasic
          tableId="quote_settings_data_table"
          data={items}
          columns={columns}
          onRowClick={actions.view}
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      </div>

      <AddQuoteSettingDialog
        type={addDialogType}
        currentDocument={documentItem}
        editingTextTemplate={editingTextTemplate}
        onOpenChange={(open) => {
          if (!open) closeAddDialog();
        }}
        onSubmitTextTemplate={submitTextTemplate}
        onSubmitExternalLink={submitExternalLink}
        onSubmitReplaceDocument={submitReplaceDocument}
      />
    </div>
  );
}
