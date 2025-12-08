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
  Printer,
  Briefcase,
  Calendar,
  ThumbsDown,
  BadgeCheck,
  Eye,
  GitPullRequestCreateArrow,
  Timer,
  Archive,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuotationActions } from '@/hooks/use-quotations-actions';
import { Quotation } from '@/lib/types/quotation';
import { useAuth } from '@/hooks/use-auth';

interface QuotationActionButtonsProps {
  quotation: Quotation | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function QuotationActionButtons({
  quotation,
  layout = 'expanded',
}: QuotationActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  const { actions, confirmDialogs, viewDialog, duplicateDialog } =
    useQuotationActions(quotation?.id, quotation);

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
        {duplicateDialog}

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
              Duplicate
            </DropdownMenuItem>

            {/* Status-specific actions */}
            {quotation.status === 'DRAFT' && (
              <>
                <DropdownMenuItem onClick={actions.approve}>
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  Approve Quote
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.sendToCustomer}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Customer
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
                {!isEssentials && (
                  <DropdownMenuItem onClick={actions.convertToJob}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Create Job
                  </DropdownMenuItem>
                )}
              </>
            )}

            {quotation.status === 'CONVERTED_TO_JOB' && (
              <DropdownMenuItem onClick={actions.duplicate}>
                <Eye className="h-4 w-4 mr-2" />
                View Job
              </DropdownMenuItem>
            )}

            {quotation.status === 'EXPIRED' && (
              <>
                <DropdownMenuItem onClick={actions.extendExpiry}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Extend Expiry Date
                </DropdownMenuItem>
              </>
            )}

            {quotation.status === 'DECLINED' && (
              <DropdownMenuItem
                onClick={actions.archive}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="h-4 w-4 mr-2 text-destructive" />
                Archive
              </DropdownMenuItem>
            )}

            {/* Secondary actions for non-archived statuses */}
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={actions.print}>
                <Printer className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            </>

            <>
              <DropdownMenuSeparator />
              {quotation.status !== 'ARCHIVED' && (
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-destructive" />
                  Archive
                </DropdownMenuItem>
              )}
            </>
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
      {duplicateDialog}

      <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
        {/* Always visible: Duplicate */}
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.duplicate}
          className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Duplicate
        </Button>

        {/* Status-specific primary actions */}
        {quotation.status === 'DRAFT' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.sendToCustomer}
              className="rounded-none border-r border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Customer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.approve}
              className="rounded-none border-r border-gray-200 bg-green-50 hover:bg-green-100 text-green-900 hover:text-green-800"
            >
              <BadgeCheck className="h-4 w-4 mr-2" />
              Approve Quote
            </Button>
          </>
        )}

        {quotation.status === 'PENDING' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.sendToCustomer}
              className="rounded-none border-r border-gray-200 bg-purple-50 hover:bg-purple-100 text-purple-900 hover:text-purple-800"
            >
              <Send className="h-4 w-4 mr-2" />
              Re-Send To Customer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="rounded-none border-r border-gray-200 bg-red-100 hover:bg-red-200 text-red-900 hover:text-red-800"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Decline
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

        {quotation.status === 'APPROVED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.decline}
              className="rounded-none border-r border-gray-200 bg-red-100 hover:bg-red-150 text-red-900 hover:text-red-800"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Decline
            </Button>
            {!isEssentials && (
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.convertToJob}
                className="rounded-none border-r border-gray-200 bg-blue-50 hover:bg-blue-100 text-blue-900 hover:text-blue-800"
              >
                <GitPullRequestCreateArrow className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            )}
          </>
        )}

        {quotation.status === 'CONVERTED_TO_JOB' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.duplicate}
            className="rounded-none border-r border-gray-200 bg-purple-50 hover:bg-purple-100 text-purple-900 hover:text-purple-800"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Job
          </Button>
        )}

        {quotation.status === 'EXPIRED' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.extendExpiry}
              className="rounded-none border-r border-gray-200 bg-green-100 hover:bg-green-150 text-green-900 hover:text-green-800"
            >
              <Timer className="h-4 w-4 mr-2" />
              Extend Expiry Date
            </Button>
          </>
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
            <DropdownMenuItem onClick={actions.print}>
              <Printer className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>

            <div>
              <DropdownMenuSeparator />

              {quotation.status !== 'ARCHIVED' && (
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-destructive" />
                  Archive
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
