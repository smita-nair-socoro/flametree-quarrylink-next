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
  Plus,
  Send,
  MoreHorizontal,
  Trash2,
  Download,
  Printer,
  Briefcase,
  Calendar,
  ThumbsDown,
  BadgeCheck,
  Eye,
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

  if (quotation.quote_status === 'ARCHIVED') {
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
            {/* Always available: Duplicate */}
            <DropdownMenuItem onClick={actions.duplicate}>
              <Plus className="h-4 w-4 mr-2" />
              Duplicate Quote
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Status-specific actions */}
            {quotation.quote_status === 'DRAFT' && (
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

            {quotation.quote_status === 'PENDING' && (
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
                  Decline Quote
                </DropdownMenuItem>
              </>
            )}

            {quotation.quote_status === 'APPROVED' && (
              <>
                <DropdownMenuItem onClick={actions.decline}>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Decline Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.convertToJob}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Job
                </DropdownMenuItem>
              </>
            )}

            {quotation.quote_status === 'CONVERTED_TO_JOB' && (
              <DropdownMenuItem onClick={actions.duplicate}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </DropdownMenuItem>
            )}

            {quotation.quote_status === 'EXPIRED' && (
              <>
                <DropdownMenuItem onClick={actions.extendExpiry}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Extend Expiry
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Archive Quote
                </DropdownMenuItem>
              </>
            )}

            {quotation.quote_status === 'DECLINED' && (
              <DropdownMenuItem
                onClick={actions.archive}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Archive Quote
              </DropdownMenuItem>
            )}

            {/* Secondary actions for non-archived statuses */}
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={actions.download}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.print}>
                <Printer className="h-4 w-4 mr-2" />
                Print Quote
              </DropdownMenuItem>
            </>

            {/* Archive for other statuses */}
            {quotation.quote_status !== 'EXPIRED' &&
              quotation.quote_status !== 'DECLINED' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={actions.archive}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Archive Quote
                  </DropdownMenuItem>
                </>
              )}
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
          className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Duplicate Quote
        </Button>

        {/* Status-specific primary actions */}
        {quotation.quote_status === 'DRAFT' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.sendToCustomer}
              className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.approve}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
            >
              <BadgeCheck className="h-4 w-4 mr-2" />
              Approve Quote
            </Button>
          </>
        )}

        {quotation.quote_status === 'PENDING' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.sendToCustomer}
              className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
            >
              <Send className="h-4 w-4 mr-2" />
              Re-Send To Customer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.approve}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
            >
              <BadgeCheck className="h-4 w-4 mr-2" />
              Approve Quote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="rounded-none border-r border-gray-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Decline Quote
            </Button>
          </>
        )}

        {quotation.quote_status === 'APPROVED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="rounded-none border-r border-gray-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Decline Quote
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.convertToJob}
              className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </>
        )}

        {quotation.quote_status === 'CONVERTED_TO_JOB' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.duplicate}
            className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Job
          </Button>
        )}

        {quotation.quote_status === 'EXPIRED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.extendExpiry}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Extend Expiry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.archive}
              className="rounded-none border-r border-gray-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Archive Quote
            </Button>
          </>
        )}

        {quotation.quote_status === 'DECLINED' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.archive}
            className="rounded-none border-r border-gray-200 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Archive Quote
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
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

            {/* only show if not EXPIRED or DECLINED */}
            {quotation.quote_status !== 'EXPIRED' &&
              quotation.quote_status !== 'DECLINED' && (
                <div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={actions.archive}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Archive Quote
                  </DropdownMenuItem>
                </div>
              )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
