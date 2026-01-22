'use client';

import * as React from 'react';
import { MoreHorizontal, Eye } from 'lucide-react';
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
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';

export interface CustomerCardProps {
  id?: number;
  businessName?: string;
  contactName: string;
  customerType: string;
  customerStatus: string;
  email: string;
  creditLimit: number;
  paymentType: string;
  accountManagerName?: string;
  onViewDetails?: () => void;
}

export function CustomerCard({
  businessName,
  contactName,
  customerType,
  customerStatus,
  email,
  creditLimit,
  paymentType,
  accountManagerName,
  onViewDetails,
}: CustomerCardProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Format credit limit as currency
  const formattedCreditLimit = React.useMemo(() => {
    if (paymentType !== 'CREDIT') return 'N/A';
    const dollars = creditLimit / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  }, [creditLimit, paymentType]);

  // Format status for display
  const formattedStatus = formatCustomerStatus(
    customerStatus as CUSTOMER_STATUS,
  );

  // For BUSINESS type, show businessName; for INDIVIDUAL, show contactName
  const displayName =
    customerType === 'BUSINESS'
      ? (businessName?.trim() || contactName)
      : contactName;

  const handleViewDetails = () => {
    setDropdownOpen(false);
    onViewDetails?.();
  };

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0 gap-0">
        <CardTitle className="text-base font-semibold text-gray-900">
          {displayName}
        </CardTitle>
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
          <TableBadges names={[customerType]} visibleCount={1} />
          <TableBadges names={[formattedStatus]} visibleCount={1} />
        </div>

        {/* Fields */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contact</span>
            <span className="text-gray-900 font-medium">{contactName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credit Limit</span>
            <span className="text-gray-900 font-medium">
              {formattedCreditLimit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Manager</span>
            <span className="text-gray-900 font-medium">
              {accountManagerName || '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
