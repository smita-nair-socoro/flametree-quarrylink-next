'use client';

import React, { useMemo } from 'react';
import { Archive, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Quotation } from '@/lib/types/quotation';
import { TableBadges } from '@/components/table-badges';
import { cn } from '@/lib/utils';
import { useQuotationStore } from '@/app/stores/quotation-store';

interface QuotationBulkActionsProps {
  selectedQuotations: Quotation[];
  onClearSelection: () => void;
}

export function QuotationBulkActions({
  selectedQuotations,
  onClearSelection,
}: QuotationBulkActionsProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    'archivable' | 'non-archivable'
  >('archivable');

  const bulkArchiveQuotations = useQuotationStore(
    (state) => state.bulkArchiveQuotations
  );

  const { archivable, nonArchivable } = useMemo(() => {
    const archivableStatuses = [
      'DRAFT',
      'EXPIRED',
      'DECLINED',
      'CONVERTED_TO_JOB',
    ];

    const archivable = selectedQuotations.filter((q) =>
      archivableStatuses.includes(q.status as string)
    );
    const nonArchivable = selectedQuotations.filter(
      (q) => !archivableStatuses.includes(q.status as string)
    );

    return { archivable, nonArchivable };
  }, [selectedQuotations]);

  const handleBulkArchiveClick = () => {
    if (selectedQuotations.length > 0) {
      setDialogOpen(true);
    }
  };

  const handleArchive = () => {
    if (archivable.length > 0) {
      const ids = archivable.map((q) => q.id);
      bulkArchiveQuotations(ids);
      setDialogOpen(false);
      onClearSelection();
    }
  };

  if (selectedQuotations.length === 0) return null;

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Bulk Archive Quotations
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('archivable')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'archivable'
                  ? 'border-green-500 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Can be Archived ({archivable.length})
            </button>
            <button
              onClick={() => setActiveTab('non-archivable')}
              className={cn(
                'flex-1 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'non-archivable'
                  ? 'border-red-500 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Cannot be Archived ({nonArchivable.length})
            </button>
          </div>

          {/* Content */}
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
            {activeTab === 'archivable' && (
              <div className="space-y-3 pt-3">
                {archivable.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">
                      The following quotations will be archived:
                    </p>
                    {archivable.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">
                            {quotation.quote_number}
                          </span>
                          <span className="text-gray-600 text-sm">•</span>
                          <span className="text-sm text-gray-600">
                            {quotation.customer_name}
                          </span>
                        </div>
                        <TableBadges
                          names={[quotation.status]}
                          visibleCount={1}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 pt-1">
                      {archivable.length} quotation
                      {archivable.length !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                    No quotations can be archived
                  </div>
                )}
              </div>
            )}

            {activeTab === 'non-archivable' && (
              <div className="space-y-3 pt-3">
                {nonArchivable.length > 0 ? (
                  <>
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        The following quotations cannot be archived because they
                        have active statuses (Pending or Approved). Please
                        update their status manually before archiving.
                      </p>
                    </div>
                    {nonArchivable.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">
                            {quotation.quote_number}
                          </span>
                          <span className="text-gray-600 text-sm">•</span>
                          <span className="text-sm text-gray-600">
                            {quotation.customer_name}
                          </span>
                        </div>
                        <TableBadges
                          names={[quotation.status]}
                          visibleCount={1}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 pt-1">
                      {nonArchivable.length} quotation
                      {nonArchivable.length !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                    All selected quotations can be archived
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="flex gap-2 sm:gap-2">
            {archivable.length > 0 ? (
              <>
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={handleArchive}
                  className="flex-1 bg-gray-700 hover:bg-gray-800"
                >
                  Archive
                </Button>
              </>
            ) : (
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/50 p-3">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">
            {selectedQuotations.length}{' '}
            {selectedQuotations.length === 1 ? 'item' : 'items'} selected
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear Selection
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleBulkArchiveClick}
            disabled={selectedQuotations.length === 0}
          >
            <Archive className="mr-2 h-4 w-4" />
            Actions ({selectedQuotations.length} selected)
          </Button>
        </div>
      </div>
    </>
  );
}
