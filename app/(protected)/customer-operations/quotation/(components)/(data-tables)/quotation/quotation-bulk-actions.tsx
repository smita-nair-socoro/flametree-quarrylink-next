'use client';

import React, { useMemo } from 'react';
import { Archive, AlertTriangle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Quotation } from '@/lib/types/quotation';
import { TableBadges } from '@/components/table-badges';
import { cn } from '@/lib/utils';
import { useQuotationStore } from '@/app/stores/quotation-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

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
        <DialogContent className="max-w-md p-0 gap-0">
          {/* Header with padding */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Bulk Archive Quotations</DialogTitle>
          </DialogHeader>

          {/* Full-width separator below title */}
          <div className="border-b border-gray-200" />

          {/* Tabs - full width */}
          <div className="flex border-b w-full">
            <button
              onClick={() => setActiveTab('archivable')}
              className={cn(
                'flex-1 py-2 px-6 text-sm font-medium border-b-2 transition-colors',
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
                'flex-1 py-2 px-6 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'non-archivable'
                  ? 'border-red-500 text-red-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Cannot be Archived ({nonArchivable.length})
            </button>
          </div>

          {/* Content with padding */}
          <div className="px-6 min-h-[200px] max-h-[400px] overflow-y-auto">
            {activeTab === 'archivable' && (
              <div className="space-y-3 py-4">
                {archivable.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600">
                      The following quotations will be archived:
                    </p>
                    {archivable.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="flex items-center justify-between rounded-md border p-3 bg-[#F9FAFB]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-base font-[geist]">
                            {quotation.quote_number}
                          </span>
                          <span className="text-[#364153] text-base">•</span>
                          <span className="text-base text-[#364153] font-[geist]">
                            {quotation.customer_name}
                          </span>
                          <span className="text-gray-600 text-base">•</span>
                          <TableBadges
                            names={[quotation.status]}
                            visibleCount={1}
                          />
                        </div>
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
              <div className="space-y-3 py-4">
                {nonArchivable.length > 0 ? (
                  <>
                    <div className="flex items-start gap-2 rounded-md bg-[#FFF4E6] border border-[#FF8C00] p-3">
                      <AlertTriangle className="h-5 w-5 text-[#FF8C00] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[#364153]">
                        The following quotations cannot be archived because they
                        have active statuses (Pending or Approved). Please
                        update their status manually before archiving.
                      </p>
                    </div>
                    {nonArchivable.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="flex items-center justify-between rounded-md border p-3 bg-[#F9FAFB]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-base font-[geist]">
                            {quotation.quote_number}
                          </span>
                          <span className="text-gray-600 text-base">•</span>
                          <span className="text-base text-[#364153] font-[geist]">
                            {quotation.customer_name}
                          </span>
                          <span className="text-gray-600 text-base">•</span>
                          <TableBadges
                            names={[quotation.status]}
                            visibleCount={1}
                          />
                        </div>
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

          {/* Full-width separator above buttons */}
          <div className="border-t border-gray-200" />

          {/* Buttons with padding */}
          <div
            className={cn(
              'px-6 pb-6 pt-4',
              activeTab === 'archivable' && archivable.length > 0
                ? 'grid grid-cols-2 gap-2'
                : ''
            )}
          >
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className={cn(
                'h-10',
                !(activeTab === 'archivable' && archivable.length > 0) &&
                  'w-full h-11'
              )}
            >
              {archivable.length > 0 ? 'Cancel' : 'Close'}
            </Button>
            {activeTab === 'archivable' && archivable.length > 0 && (
              <Button
                className="h-10"
                style={{
                  backgroundColor: '#6B7280',
                  borderColor: '#6B7280',
                  color: 'white',
                }}
                onClick={handleArchive}
              >
                <span className="pr-[7px] h-4 w-4 flex items-center justify-center">
                  <Archive className="h-4 w-4" />
                </span>
                Archive
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Toolbar */}
      <div className="flex items-center justify-between gap-4 rounded-md border p-3 bg-[#EFF6FF] border-[#BEDBFF]">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">
            {selectedQuotations.length}{' '}
            {selectedQuotations.length === 1 ? 'item' : 'items'} selected
          </p>
          <button
            onClick={onClearSelection}
            className="text-sm text-[#155DFC] underline"
          >
            Clear Selection
          </button>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={selectedQuotations.length === 0}
                className="bg-[#8E51FF] text-white text-sm p-4"
              >
                Actions ({selectedQuotations.length} selected)
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleBulkArchiveClick}
                className="text-red-600"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Quotations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
