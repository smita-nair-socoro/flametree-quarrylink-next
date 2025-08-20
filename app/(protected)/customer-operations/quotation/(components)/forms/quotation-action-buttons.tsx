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
  Printer,
  Briefcase,
  Calendar,
  ThumbsDown,
  BadgeCheck,
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
    quotation
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
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Approve Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.decline}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
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
              onClick={actions.archive}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Archive Quote
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

      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {/* Always visible: Duplicate */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.duplicate}
          className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-black"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>

        {/* Status-specific primary actions */}
        {quotation.quote_status === 'DRAFT' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.sendToCustomer}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-black"
          >
            <Send className="h-4 w-4 mr-2 text-blue-600" />
            Send to Customer
          </Button>
        )}

        {quotation.quote_status === 'PENDING' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.approve}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-black"
            >
              <BadgeCheck className="h-4 w-4 mr-2 text-green-600" />
              Approve Quote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="rounded-none border-r border-gray-200 bg-red-50 hover:bg-red-100 text-black"
            >
              <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
              Decline
            </Button>
          </>
        )}

        {quotation.quote_status === 'APPROVED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.convertToJob}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-black"
          >
            <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
            Convert to Job
          </Button>
        )}

        {quotation.quote_status === 'EXPIRED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.extendExpiry}
            className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-black"
          >
            <Calendar className="h-4 w-4 mr-2 text-green-600" />
            Extend Expiry Date
          </Button>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none bg-white hover:bg-gray-50 text-black"
            >
              <MoreHorizontal className="h-4 w-4" />
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
              onClick={actions.archive}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Archive Quote
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
