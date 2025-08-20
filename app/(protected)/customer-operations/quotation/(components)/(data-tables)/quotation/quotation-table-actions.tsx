'use client';
import * as React from 'react';
import {
  MoreHorizontal,
  Eye,
  Send,
  Printer,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Briefcase,
  Calendar,
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
import { QuotationDetails } from '@/lib/types/quotation';
import { useQuotationStore } from '@/app/stores/quotation-store';

interface QuotationTableActionsProps {
  quotation: QuotationDetails;
}

export function QuotationTableActions({
  quotation,
}: QuotationTableActionsProps) {
  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    quotation.id,
    quotation,
  );

  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );

  const handleView = () => {
    setSelectedQuotation(quotation);
    actions.view();
  };

  return (
    <div>
      {confirmDialogs}
      {viewDialog}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          {/* Status-specific actions */}
          {quotation.quote_status === 'DRAFT' && (
            <DropdownMenuItem onClick={actions.sendToCustomer}>
              <Send className="mr-2 h-4 w-4" />
              Send to Customer
            </DropdownMenuItem>
          )}

          {quotation.quote_status === 'PENDING' && (
            <>
              <DropdownMenuItem onClick={actions.approve}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Quote
              </DropdownMenuItem>

              <DropdownMenuItem onClick={actions.decline}>
                <XCircle className="mr-2 h-4 w-4" />
                Decline Quote
              </DropdownMenuItem>

              <DropdownMenuItem onClick={actions.sendToCustomer}>
                <Send className="mr-2 h-4 w-4" />
                Re-Send to Customer
              </DropdownMenuItem>
            </>
          )}

          {quotation.quote_status === 'APPROVED' && (
            <DropdownMenuItem onClick={actions.convertToJob}>
              <Briefcase className="mr-2 h-4 w-4" />
              Convert to Job
            </DropdownMenuItem>
          )}

          {quotation.quote_status === 'EXPIRED' && (
            <DropdownMenuItem onClick={actions.extendExpiry}>
              <Calendar className="mr-2 h-4 w-4" />
              Extend Expiry
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Secondary actions */}
          <DropdownMenuItem onClick={actions.print}>
            <Printer className="mr-2 h-4 w-4" />
            Print Quote
          </DropdownMenuItem>

          <DropdownMenuItem onClick={actions.duplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Quote
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Destructive actions */}
          <DropdownMenuItem
            onClick={actions.archive}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Archive Quote
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
