'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Send,
  // Printer,
  ThumbsDown,
  Briefcase,
  Archive,
  Timer,
  FileSearch,
  Copy,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { Quotation } from '@/lib/types/quotation';
import { useSubscriptionPlan } from '@/app/stores/client-store';

interface QuotationTableActionsProps {
  quotation: Quotation;
}

export function QuotationTableActions({
  quotation,
}: QuotationTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const { actions, confirmDialogs, viewDialog, duplicateDialog } =
    useQuotationActions(quotation);

  const createHandler =
    (actionFn: () => void, additionalSetup?: () => void) => () => {
      additionalSetup?.();
      setDropdownOpen(false);
      actionFn();
    };

  const handleView = createHandler(actions.view);
  const handlePreview = createHandler(actions.preview);
  const handleArchive = createHandler(actions.archive);
  const handleSendToCustomer = createHandler(actions.sendToCustomer);
  const handleDecline = createHandler(actions.decline);
  const handleConvertToJob = createHandler(actions.convertToJob);
  const handleDuplicate = createHandler(actions.duplicate);
  const handleConvertToDraft = createHandler(actions.convertToDraft);
  const handleExtendExpiry = createHandler(actions.extendExpiry);
  // const handlePrint = createHandler(actions.print);

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
      {duplicateDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Always available: View Details */}
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>

          {/* Preview Quote - available for all statuses */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePreview}>
            <FileSearch className="h-4 w-4 mr-2" />
            Preview Quote
          </DropdownMenuItem>

          {/* Status-specific actions */}
          {quotation.quoteStatus === 'DRAFT' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </DropdownMenuItem>
            </>
          )}

          {quotation.quoteStatus === 'PENDING' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Re-Send To Customer
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDecline}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </DropdownMenuItem>
            </>
          )}

          {quotation.quoteStatus === 'DECLINED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleConvertToDraft}>
                <Pencil className="h-4 w-4 mr-2" />
                Convert to Draft
              </DropdownMenuItem>
            </>
          )}

          {quotation.quoteStatus === 'APPROVED' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDecline}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </DropdownMenuItem>

              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleConvertToJob}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Convert to Job
                </DropdownMenuItem>
              </>
            </>
          )}

          {quotation.quoteStatus === 'CONVERTED_TO_JOB' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </DropdownMenuItem>
            </>
          )}

          {quotation.quoteStatus === 'EXPIRED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExtendExpiry}>
                <Timer className="h-4 w-4 mr-2" />
                Extend Expiry Date
              </DropdownMenuItem>
            </>
          )}

          {/* Print action - always available for non-archived
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem> */}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Quote
          </DropdownMenuItem>

          {/* Archive - always at the bottom for applicable statuses */}
          {quotation.quoteStatus !== 'ARCHIVED' &&
            quotation.quoteStatus !== 'CONVERTED_TO_JOB' &&
            quotation.quoteStatus !== 'APPROVED' &&
            quotation.quoteStatus !== 'PENDING' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-destructive" />
                  Archive
                </DropdownMenuItem>
              </>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
