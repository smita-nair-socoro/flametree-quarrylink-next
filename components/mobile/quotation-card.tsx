'use client';

import * as React from 'react';
import { User, DollarSign, Calendar, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { TableBadges } from '../table-badges';
import { centsToDollars } from '@/lib/utils/currency';
import { format, parseISO } from 'date-fns';
import { Quotation } from '@/lib/types/quotation';
import { QuotationTableActions } from '@/app/(protected)/customer-operations/quotation/(components)/(data-tables)/quotation/quotation-table-actions';

export interface QuotationCardProps {
  quotation: Quotation;
}

export function QuotationCard({ quotation }: QuotationCardProps) {
  const {
    projectName,
    quoteNumber,
    quoteStatus,
    quoteType,
    customerName,
    totalSellPrice,
    expiryDate,
    accountManagerName,
  } = quotation;

  // Format total as currency
  const formattedTotal = React.useMemo(() => {
    if (!totalSellPrice) return '$0.00';
    return `$${centsToDollars(totalSellPrice)}`;
  }, [totalSellPrice]);

  // Format expiry date
  const formattedExpiryDate = React.useMemo(() => {
    if (!expiryDate) return '-';
    try {
      return format(parseISO(expiryDate), 'd MMM yyyy');
    } catch {
      return '-';
    }
  }, [expiryDate]);

  return (
    <Card className="gap-3 py-4 w-full">
      <CardHeader className="pb-0 gap-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle className="text-base font-semibold text-gray-900 truncate">
            {projectName || 'Untitled Project'}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
            <Hash className="h-3.5 w-3.5" />
            <span className="truncate">{quoteNumber}</span>
          </div>
        </div>
        <CardAction>
          <QuotationTableActions quotation={quotation} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {quoteStatus && (
            <TableBadges names={[quoteStatus]} visibleCount={1} />
          )}
          {quoteType && (
            <TableBadges names={[quoteType]} visibleCount={1} />
          )}
        </div>

        {/* Fields with icons */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Customer</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {customerName}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {formattedTotal}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expiry</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {formattedExpiryDate}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Account Manager</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {accountManagerName || '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
