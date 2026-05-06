'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { CustomerDTO } from '@/lib/types/customer';

interface CustomerActionButtonsProps {
  customer: CustomerDTO | null | undefined;
  layout?: 'compact' | 'expanded';
}

export function CustomerActionButtons({
  customer,
  layout = 'expanded',
}: CustomerActionButtonsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isArchived = customer?.customerStatus === 'ARCHIVED';

  const { actions, confirmDialogs, viewDialog } = useCustomerActions(customer);

  if (!customer) return null;
  if (!customer.id || customer.id === 0) return null;

  // Mobile / compact — single action per state, direct button
  if (!isDesktop || layout === 'compact') {
    return (
      <div>
        {confirmDialogs}
        {viewDialog}

        {!isArchived && (
          <Button
            variant="outline"
            size="sm"
            onClick={actions.archive}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        )}
      </div>
    );
  }

  // Desktop expanded — direct buttons in a grouped button bar
  return (
    <div>
      {confirmDialogs}
      {viewDialog}

      {!isArchived && (
        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.archive}
            className="rounded-none bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      )}
    </div>
  );
}
