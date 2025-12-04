'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Send,
  Printer,
  ThumbsDown,
  Briefcase,
  Archive,
  Timer,
  Copy,
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
import { useQuotationStore } from '@/app/stores/quotation-store';
import { useAuth } from '@/hooks/use-auth';

interface QuotationTableActionsProps {
  quotation: Quotation;
}

export function QuotationTableActions({
  quotation,
}: QuotationTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    quotation.id,
    quotation
  );
  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation
  );

  const createHandler =
    (actionFn: () => void, additionalSetup?: () => void) => () => {
      additionalSetup?.();
      setDropdownOpen(false);
      actionFn();
    };

  const handleView = createHandler(actions.view, () =>
    setSelectedQuotation(quotation)
  );
  const handleArchive = createHandler(actions.archive);
  const handleSendToCustomer = createHandler(actions.sendToCustomer, () =>
    setSelectedQuotation(quotation)
  );
  const handleDecline = createHandler(actions.decline);
  const handleConvertToJob = createHandler(actions.convertToJob);
  const handleDuplicate = createHandler(actions.duplicate);
  const handleExtendExpiry = createHandler(actions.extendExpiry);
  const handlePrint = createHandler(actions.print);

  return (
    <div>
      {confirmDialogs}
      {viewDialog}
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

          {/* Status-specific actions */}
          {quotation.status === 'DRAFT' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </DropdownMenuItem>
            </>
          )}

          {quotation.status === 'PENDING' && (
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

          {quotation.status === 'APPROVED' && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleDecline}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </DropdownMenuItem>

              {!isEssentials && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleConvertToJob}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Create Job
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}

          {quotation.status === 'CONVERTED_TO_JOB' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDuplicate}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </DropdownMenuItem>
            </>
          )}

          {quotation.status === 'EXPIRED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExtendExpiry}>
                <Timer className="h-4 w-4 mr-2" />
                Extend Expiry Date
              </DropdownMenuItem>
            </>
          )}

          {/* Print action - always available for non-archived */}
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Download PDF
          </DropdownMenuItem>

          {/* Always available: Duplicate */}
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate Quote
          </DropdownMenuItem>

          {/* Archive - always at the bottom for applicable statuses */}
          {quotation.status !== 'ARCHIVED' && (
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
