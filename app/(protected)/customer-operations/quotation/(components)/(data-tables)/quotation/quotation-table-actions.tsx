'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Send,
  Printer,
  Plus,
  BadgeCheck,
  ThumbsDown,
  Briefcase,
  Archive,
  Timer,
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

interface QuotationTableActionsProps {
  quotation: Quotation;
}

export function QuotationTableActions({
  quotation,
}: QuotationTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    quotation.id,
    quotation
  );
  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation
  );

  const handleView = () => {
    setSelectedQuotation(quotation);
    setDropdownOpen(false); // Close dropdown before opening modal
    actions.view();
  };

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

          <DropdownMenuSeparator />

          {/* Always available: Duplicate */}
          <DropdownMenuItem onClick={actions.duplicate}>
            <Plus className="h-4 w-4 mr-2" />
            Duplicate Quote
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Status-specific actions */}
          {quotation.status === 'DRAFT' && (
            <>
              <DropdownMenuItem onClick={actions.sendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.approve}>
                <BadgeCheck className="h-4 w-4 mr-2" />
                Approve Quote
              </DropdownMenuItem>
            </>
          )}

          {quotation.status === 'PENDING' && (
            <>
              <DropdownMenuItem onClick={actions.sendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Re-Send To Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.approve}>
                <BadgeCheck className="h-4 w-4 mr-2" />
                Approve Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.decline}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </DropdownMenuItem>
            </>
          )}

          {quotation.status === 'APPROVED' && (
            <>
              <DropdownMenuItem onClick={actions.decline}>
                <ThumbsDown className="h-4 w-4 mr-2" />
                Decline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.convertToJob}>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Job
              </DropdownMenuItem>
            </>
          )}

          {quotation.status === 'CONVERTED_TO_JOB' && (
            <DropdownMenuItem onClick={actions.duplicate}>
              <Eye className="h-4 w-4 mr-2" />
              View Job
            </DropdownMenuItem>
          )}

          {quotation.status === 'EXPIRED' && (
            <DropdownMenuItem onClick={actions.extendExpiry}>
              <Timer className="h-4 w-4 mr-2" />
              Extend Expiry Date
            </DropdownMenuItem>
          )}

          {/* Print action - always available for non-archived */}
          <DropdownMenuItem onClick={actions.print}>
            <Printer className="h-4 w-4 mr-2" />
            Print Quote
          </DropdownMenuItem>

          {/* Archive - always at the bottom for applicable statuses */}
          {quotation.status !== 'ARCHIVED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={actions.archive}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Quote
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
