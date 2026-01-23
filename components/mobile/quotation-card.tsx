'use client';

import * as React from 'react';
import { MoreHorizontal, Eye, User, DollarSign, Calendar, Hash } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { TableBadges } from '../table-badges';
import { centsToDollars } from '@/lib/utils/currency';
import { format, parseISO } from 'date-fns';

export interface QuotationCardProps {
  id?: number;
  projectName: string;
  quoteNumber: string;
  quoteStatus: string;
  quoteType: string;
  customerName: string;
  totalSellPrice: number;
  expiryDate: string | null;
  accountManagerName: string;
  onViewDetails?: () => void;
}

export function QuotationCard({
  projectName,
  quoteNumber,
  quoteStatus,
  quoteType,
  customerName,
  totalSellPrice,
  expiryDate,
  accountManagerName,
  onViewDetails,
}: QuotationCardProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

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

  const handleViewDetails = () => {
    setDropdownOpen(false);
    onViewDetails?.();
  };

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0 gap-1">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-base font-semibold text-gray-900">
            {projectName || 'Untitled Project'}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Hash className="h-3.5 w-3.5" />
            <span>{quoteNumber}</span>
          </div>
        </div>
        <CardAction>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Badges */}
        <div className="flex items-center gap-2">
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
            <span className="text-gray-900 font-medium">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total</span>
            </div>
            <span className="text-gray-900 font-medium">{formattedTotal}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Expiry</span>
            </div>
            <span className="text-gray-900 font-medium">{formattedExpiryDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Account Manager</span>
            </div>
            <span className="text-gray-900 font-medium">
              {accountManagerName || '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
