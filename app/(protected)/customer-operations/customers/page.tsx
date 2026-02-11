'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';
import { CustomerDTO } from '@/lib/types/customer';
import { CUSTOMER_STATUS, CUSTOMER_TYPE } from '@/lib/types/customer-enums';
import { customerColumns } from './(components)/(data-tables)/customer/columns';
import {
  Plus,
  Users,
  UserCheck,
  Activity,
  Building2,
  Loader2,
  User,
  Mail,
  CreditCard,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  CustomersListQueryOptions,
  CustomerReportingQueryOptions,
} from '@/lib/api/customer';
import { useCustomerActions } from '@/hooks/use-customer-actions';
import { TableSkeleton } from '@/components/table-skeleton';
import { useAuth } from '@/hooks/use-auth';
import { StatsCards, StatsCardData } from '@/components/stats-cards';
import { notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { centsToDollars } from '@/lib/utils/currency';
import { formatCustomerStatus } from '@/lib/utils/customer-helper';
import { CustomerTableActions } from './(components)/(data-tables)/customer/customer-table-actions';

import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { MobileCard } from '@/components/mobile/mobile-card';
import { TableBadges } from '@/components/table-badges';

export default function CustomersPage() {
  const { actions, confirmDialogs, viewDialog } = useCustomerActions();

  // Role-based feature detection
  const { attributes } = useAuth();
  const userRole =
    attributes?.['custom:role'] || attributes?.role || 'Essentials';
  const isEssentials = userRole === 'Essentials';

  // Filter columns based on user role
  const filteredColumns = React.useMemo(() => {
    if (isEssentials) {
      // Hide remaining_credit column for Essentials users
      return customerColumns.filter(
        (column) => column.id !== 'remaining_credit'
      );
    }
    return customerColumns;
  }, [isEssentials]);

  // Use React Query to fetch customers data
  const {
    data: customersData,
    isLoading,
    isFetching,
    error,
    isError,
  } = useQuery(CustomersListQueryOptions());

  const { data: reportingData } = useQuery(CustomerReportingQueryOptions());

  // Statistics cards data
  const statsCards: StatsCardData[] = [
    {
      title: 'Total Customers',
      value: reportingData?.totalCustomers || 0,
      description: `+${reportingData?.totalCustomersChangePercentThisMonth || 0
        } this month`,
      icon: Users,
      iconBgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#193CB8]',
      descriptionColor: 'text-[#00A63E]',
    },
    {
      title: 'Active Customers',
      value: reportingData?.totalActiveCustomers || 0,
      description: `${reportingData?.activeCustomersPercentOfTotal || 0
        }% of total`,
      icon: UserCheck,
      iconBgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#016630]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Business Customers',
      value: reportingData?.totalActiveBusinessCustomers || 0,
      description: `${reportingData?.businessCustomerQuotesPercent || 0
        }% requested quotes`,
      icon: Activity,
      iconBgColor: 'bg-[#F3E8FF]',
      iconColor: 'text-[#8E51FF]',
      descriptionColor: 'text-[#737373]',
    },
    {
      title: 'Total Individual Customers',
      value: reportingData?.totalActiveIndividualCustomers || 0,
      description: `${reportingData?.individualCustomerQuotesPercent || 0
        }% requested quotes`,
      icon: Building2,
      iconBgColor: 'bg-[#FCE7F3]',
      iconColor: 'text-[#DB2777]',
      descriptionColor: 'text-[#737373]',
    },
  ];

  React.useEffect(() => {
    if (isError && error) {
      console.error('Customer API Error:', error);
      notifyError(extractErrorMessage(error));
    }
  }, [isError, error]);

  // Handle row click: pass clicked customer so store updates before dialog opens
  const handleRowClick = (customer: CustomerDTO) => {
    actions.view(customer);
  };

  // Mobile card renderer
  const renderCustomerCard = React.useCallback((customer: CustomerDTO) => {
    const formattedStatus = formatCustomerStatus(
      customer.customerStatus as CUSTOMER_STATUS
    );
    const displayName =
      customer.customerType === 'BUSINESS'
        ? customer.businessName?.trim() || customer.contactName
        : customer.contactName;
    const formattedCreditLimit = centsToDollars(customer.creditLimit);

    return (
      <MobileCard
        title={displayName}
        badges={
          <>
            <TableBadges names={[customer.customerType]} visibleCount={1} />
            <TableBadges names={[formattedStatus]} visibleCount={1} />
          </>
        }
        actions={<CustomerTableActions customer={customer} />}
        fields={[
          {
            icon: <User className="h-4 w-4" />,
            label: 'Contact',
            value: customer.contactName,
          },
          {
            icon: <Mail className="h-4 w-4" />,
            label: 'Email',
            value: customer.email,
          },
          {
            icon: <CreditCard className="h-4 w-4" />,
            label: 'Credit Limit',
            value: `$${formattedCreditLimit}`,
          },
          {
            icon: <User className="h-4 w-4" />,
            label: 'Account Manager',
            value: customer.accountManagerName || '-',
          },
        ]}
      />
    );
  }, []);

  // Transform the API data to match our component expectations
  const items: CustomerDTO[] =
    customersData?.map((customer) => {
      // Convert API response to snake_case if needed

      return {
        ...customer,
        customerType: customer.customerType as CUSTOMER_TYPE,
        customerStatus: customer.customerStatus as CUSTOMER_STATUS,
      };
    }) || [];

  const facetDefs: FacetDefinition[] = [
    { column: 'status', title: 'Status', icon: Plus },
    { column: 'customer_type', title: 'Customer Type', icon: Plus },
    { column: 'account_manager', title: 'Account Manager', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {confirmDialogs}
      {viewDialog}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Customers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Add New Customer"
            dialogDescription="Fill in the required fields to add a new customer."
            buttonTitle="Add Customer"
          >
            <CustomerForm />
          </FormDialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        cards={statsCards}
        isLoading={isLoading}
        mobileGridCols={1}
        desktopGridCols={4}
      />

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : isError ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-destructive">
              Error loading customers
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Subtle loading indicator during background refresh */}
            {isFetching && !isLoading && (
              <div className="absolute top-2 right-2 z-10">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <DataTableClient
              tableId="customer_main_data_table"
              data={items ?? []}
              columns={filteredColumns}
              facetDefination={facetDefs}
              searchPlaceHolder="Search customers..."
              onRowClick={handleRowClick}
              defaultSorting={[{ id: 'customer_name', desc: false }]}
              mobileCardRenderer={renderCustomerCard}
            />
          </div>
        )}
      </div>
    </div>
  );
}
