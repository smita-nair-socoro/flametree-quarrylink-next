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
import { MoreHorizontal, Archive, Eye } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { CustomerDetails } from '@/lib/types/customer';

interface CustomerActionButtonsProps {
  customer: CustomerDetails | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function CustomerActionButtons({
  customer,
  layout = 'expanded',
}: CustomerActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const { actions, confirmDialogs, viewDialog } = useCustomerActions(
    customer?.id,
    customer
  );

  // Early returns for null quotation or new quotation
  if (!customer) {
    return null;
  }

  // Don't render anything if quotationId is invalid
  if (!customer.id || customer.id === 0) {
    return null;
  }

  if (customer.customer_status === 'ARCHIVED') {
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
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {customer.customer_status !== 'ARCHIVED' && (
              <>
                <DropdownMenuItem onClick={actions.viewJobs}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Jobs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.viewDockets}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Dockets
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.viewQuotations}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Quotations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-red-600" />
                  Archive
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
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.viewDockets}
            className="rounded-none border-r bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200 "
          >
            <Eye className="h-4 w-4 mr-2" />
            View Dockets
          </Button>
        </>
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
            {customer.customer_status !== 'ARCHIVED' && (
              <div>
                <DropdownMenuItem onClick={actions.viewJobs}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Jobs
                </DropdownMenuItem>

                <DropdownMenuItem onClick={actions.viewQuotations}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Quotations
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-red-600" />
                  Archive
                </DropdownMenuItem>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
