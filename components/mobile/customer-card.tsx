'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { TableBadges } from '../table-badges';
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { CustomerDTO } from '@/lib/types/customer';
import { CustomerTableActions } from '@/app/(protected)/customer-operations/customers/(components)/(data-tables)/customer/customer-table-actions';

export interface CustomerCardProps {
  customer: CustomerDTO;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const {
    businessName,
    contactName,
    customerType,
    customerStatus,
    email,
    creditLimit,
    paymentType,
    accountManagerName,
  } = customer;

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
      ? businessName?.trim() || contactName
      : contactName;

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0 gap-0">
        <CardTitle className="text-base font-semibold text-gray-900">
          {displayName}
        </CardTitle>
        <CardAction>
          <CustomerTableActions customer={customer} />
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
