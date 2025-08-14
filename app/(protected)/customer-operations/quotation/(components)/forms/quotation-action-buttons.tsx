'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  Send,
  CheckCircle,
  MoreHorizontal,
  Trash2,
  Download,
  Share2,
  Printer,
  XCircle,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { QuotationDetails } from '@/lib/types/quotation';

interface QuotationActionButtonsProps {
  quotation: QuotationDetails | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function QuotationActionButtons({
  quotation,
  layout = 'expanded',
}: QuotationActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { actions, confirmDialogs, viewDialog } = useQuotationActions(
    quotation?.id,
    quotation,
  );

  // Early returns for null quotation or new quotation
  if (!quotation) {
    return null;
  }

  // Don't render anything if quotationId is invalid
  if (!quotation.id || quotation.id === 0) {
    return null;
  }

  // Mobile or compact version - everything in dropdown
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-3">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* Always available actions */}
            <DropdownMenuItem onClick={actions.duplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>

            {/* Status-specific actions */}
            {quotation.quote_status === 'DRAFT' && (
              <DropdownMenuItem onClick={actions.sendToCustomer}>
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </DropdownMenuItem>
            )}

            {quotation.quote_status === 'PENDING' && (
              <>
                <DropdownMenuItem onClick={actions.approve}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.decline}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline Quote
                </DropdownMenuItem>
              </>
            )}

            {quotation.quote_status === 'APPROVED' && (
              <DropdownMenuItem onClick={actions.convertToJob}>
                <Briefcase className="h-4 w-4 mr-2" />
                Convert to Job
              </DropdownMenuItem>
            )}

            {quotation.quote_status === 'EXPIRED' && (
              <DropdownMenuItem onClick={actions.extendExpiry}>
                <Calendar className="h-4 w-4 mr-2" />
                Extend Expiry
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Secondary actions */}
            <DropdownMenuItem onClick={actions.download}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={actions.print}>
              <Printer className="h-4 w-4 mr-2" />
              Print Quote
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Destructive actions */}
            <DropdownMenuItem
              onClick={actions.archieve}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Desktop expanded version - toggle group layout
  return (
    <div>
      {confirmDialogs}
      {viewDialog}

      <div className="inline-flex h-8 items-center justify-center rounded-md bg-background p-1 text-muted-foreground border">
        {/* Always visible: Duplicate */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.duplicate}
          className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Copy className="h-3.5 w-3.5 mr-1.5" />
          Duplicate
        </Button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Status-specific primary actions */}
        {quotation.quote_status === 'DRAFT' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.sendToCustomer}
              className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send to Customer
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </>
        )}

        {quotation.quote_status === 'PENDING' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.approve}
              className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground text-green-600 "
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
              Approve Quote
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground text-red-600"
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Decline Quote
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </>
        )}

        {quotation.quote_status === 'APPROVED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.convertToJob}
              className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground text-blue-600"
            >
              <Briefcase className="h-3.5 w-3.5 mr-1.5" />
              Convert to Job
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </>
        )}

        {quotation.quote_status === 'EXPIRED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.extendExpiry}
              className="h-6 px-3 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground text-orange-600 "
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Extend Expiry
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
          </>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-sm font-normal rounded-sm hover:bg-accent hover:text-accent-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={actions.download}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={actions.print}>
              <Printer className="h-4 w-4 mr-2" />
              Print Quote
            </DropdownMenuItem>

            {/* Show other status actions in dropdown if not in main buttons */}
            {quotation.quote_status !== 'DRAFT' &&
              quotation.quote_status !== 'PENDING' && (
                <>
                  <DropdownMenuSeparator />
                  {quotation.quote_status !== 'APPROVED' &&
                    quotation.quote_status !== 'EXPIRED' && (
                      <>
                        <DropdownMenuItem onClick={actions.sendToCustomer}>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={actions.approve}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Quote
                        </DropdownMenuItem>
                      </>
                    )}
                </>
              )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={actions.archieve}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Archieve Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
