'use client';

import React from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/ui/data-table-bulk-actions';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { Quotation } from '@/lib/types/quotation';

interface QuotationBulkActionsProps {
  selectedQuotations: Quotation[];
  onClearSelection: () => void;
}

export function QuotationBulkActions({
  selectedQuotations,
  onClearSelection,
}: QuotationBulkActionsProps) {
  const { actions, bulkArchiveDialog } = useQuotationActions(
    undefined,
    null,
    selectedQuotations
  );

  const handleBulkArchiveClick = () => {
    if (selectedQuotations.length > 0) {
      actions.bulkArchive();
    }
  };

  return (
    <>
      {bulkArchiveDialog}
      <DataTableBulkActions
        selectedCount={selectedQuotations.length}
        onClearSelection={onClearSelection}
      >
        <Button
          variant="default"
          size="sm"
          onClick={handleBulkArchiveClick}
          disabled={selectedQuotations.length === 0}
        >
          <Archive className="mr-2 h-4 w-4" />
          Actions ({selectedQuotations.length} selected)
        </Button>
      </DataTableBulkActions>
    </>
  );
}
