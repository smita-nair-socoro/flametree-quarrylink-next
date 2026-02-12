'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { MoreHorizontal, Archive, Eye, ArchiveRestore } from 'lucide-react';
import { MoreHorizontal, Eye } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { CustomerDTO } from '@/lib/types/customer';
import { useAuth } from '@/hooks/use-auth';

interface CustomerActionButtonsProps {
  customer: CustomerDTO | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function CustomerActionButtons({
  customer,
  layout = 'expanded',
}: CustomerActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isArchived = customer?.customerStatus === 'ARCHIVED' ? true : false;

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  const { actions, confirmDialogs, viewDialog } = useCustomerActions(
    customer ?? undefined
  );

  // Early returns for null quotation or new quotation
  if (!customer) {
    return null;
  }

  // Don't render anything if customerId is invalid
  if (!customer.id || customer.id === 0) {
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
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isArchived && (
              <>
                {!isEssentials && (
                  <>
                    <DropdownMenuItem onClick={actions.viewJobs}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={actions.viewDockets}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Dockets
                    </DropdownMenuItem>
                  </>
                )}
                {/* <DropdownMenuItem onClick={actions.viewQuotations}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Quotations
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-red-600" />
                  Archive
                </DropdownMenuItem> */}
              </>
            )}
            {/* {isArchived && (
              <DropdownMenuItem
                onClick={actions.unarchive}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                Unarchive
              </DropdownMenuItem>
            )} */}
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
        {/* Primary button - conditional based on role */}

        {/* <Button
          variant="ghost"
          size="sm"
          onClick={actions.viewQuotations}
          className="rounded-none border-r bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Quotations
        </Button> */}
        {!isEssentials && (
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.viewDockets}
            className="rounded-none border-r bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-gray-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Dockets
          </Button>
        )}
        {/* {!isArchived && (
          <>
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
                {!isEssentials && (
                  <>
                    <DropdownMenuItem onClick={actions.viewJobs}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Jobs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={actions.viewQuotations}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Quotations
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={actions.archive}
                  className="text-destructive focus:text-destructive"
                >
                  <Archive className="h-4 w-4 mr-2 text-red-600" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        {isArchived && (
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
              <DropdownMenuItem
                onClick={actions.unarchive}
                className="text-blue-600 focus:text-blue-600"
              >
                <ArchiveRestore className="h-4 w-4 mr-2 text-blue-600" />
                Unarchive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
      </div>
    </div>
  );
}
