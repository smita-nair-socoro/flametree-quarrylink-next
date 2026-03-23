'use client';

import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Download, Users, Mountain } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenantCompleteDetailsQueryOptions, useGetStripeProfileLink } from '@/lib/api/tenant';
import { notifyError } from '@/lib/toast';
import { centsToDollars } from '@/lib/utils/currency';
import { TableBadges } from '@/components/table-badges';
import {
  formatEpochDateDdMmYyyy,
  formatEpochMonthYear,
} from '@/lib/utils/date';

export default function BillingTab() {
  const { data: tenantCompleteDetails } = useQuery(
    TenantCompleteDetailsQueryOptions(),
  );
  const getStripeProfileLink = useGetStripeProfileLink();

  const handleManageBilling = async () => {
    try {
      const { stripeProfileLink } = await getStripeProfileLink.mutateAsync();
      window.open(stripeProfileLink, '_blank', 'noopener,noreferrer');
    } catch {
      notifyError('Failed to open billing portal. Please try again.');
    }
  };

  const currencySymbol = (currency?: string): string => {
    const c = (currency || '').toUpperCase();
    if (c === 'AUD') return 'A$';
    return '$';
  };

  const subscription =
    tenantCompleteDetails?.subscriptionAndInvoices?.subscriptions
      ?.subscriptions?.[0];

  const subscriptionItems = subscription?.items ?? [];
  const subscriptionCurrency = subscriptionItems?.[0]?.currency;

  const totalMonthlyCents =
    subscriptionItems?.reduce((sum, item) => {
      const qty = item?.quantity ?? 0;
      const unit = item?.unitAmountInCents ?? 0;
      return sum + qty * unit;
    }, 0) ?? 0;

  const invoices =
    tenantCompleteDetails?.subscriptionAndInvoices?.invoices ?? [];
  const openInvoice = invoices.find((i) => i.status === 'open');
  const nextBillingEpochSeconds =
    openInvoice?.dueDateEpochSeconds ?? invoices?.[0]?.dueDateEpochSeconds;

  const getItemQty = (productName: string): number => {
    const item = subscriptionItems.find(
      (i) => (i.productName || '').toUpperCase() === productName.toUpperCase(),
    );
    return item?.quantity ?? 0;
  };

  const usersCount = getItemQty('USER');
  const quarriesCount = getItemQty('QUARRY');

  const recentInvoices = invoices.map((invoice) => {
    const normalizedStatus =
      invoice.status === 'open'
        ? 'Pending'
        : invoice.status === 'paid'
          ? 'Paid'
          : invoice.status
            ? `${invoice.status.charAt(0).toUpperCase()}${invoice.status.slice(1)}`
            : '-';

    const dateEpochSeconds =
      invoice.status === 'paid'
        ? invoice.dueDateEpochSeconds
        : (invoice.dueDateEpochSeconds ?? invoice.createdAtEpochSeconds);

    const amountCents =
      invoice.status === 'paid'
        ? (invoice.amountPaidInCents ?? invoice.amountDueInCents)
        : (invoice.amountDueInCents ?? invoice.amountRemainingInCents ?? 0);

    const symbol = currencySymbol(invoice.currency);

    return {
      invoiceId: invoice.invoiceId,
      date: formatEpochMonthYear(dateEpochSeconds),
      amount: `${symbol}${centsToDollars(amountCents)}`,
      status: normalizedStatus,
      pdfUrl: invoice.invoicePdfUrl,
      hostedUrl: invoice.hostedInvoiceUrl,
    };
  });

  return (
    <div className="py-3 space-y-3">
      <h2 className="text-2xl font-semibold">Subscription & Billing</h2>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[20px] sm:text-[24px] font-medium">
              Current Plan
            </CardTitle>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleManageBilling}
              disabled={getStripeProfileLink.isPending}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {getStripeProfileLink.isPending ? 'Loading...' : 'Manage Billing'}
            </Button>
          </div>
        </CardHeader>
        {/* Once API is ready, we can replace the static data with the actual data. */}
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-[18px] font-medium">
                  {subscription?.subscriptionPlan ?? '-'}
                </span>
                <span className="text-[16px] text-[#4B5563]">
                  {currencySymbol(subscriptionCurrency)}
                  {centsToDollars(totalMonthlyCents)}/month
                </span>
              </div>
              <TableBadges
                names={subscription?.status === 'active' ? ['Active'] : []}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] text-[#4B5563]">
                Next billing: {formatEpochDateDdMmYyyy(nextBillingEpochSeconds)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="text-[20px] sm:text-[24px] font-medium">
          Usage & Limits
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="sm:border sm:rounded-lg sm:px-6">
            <Separator />
            <div className="flex items-center justify-between py-4 px-4 sm:px-0 sm:py-5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#111827]" />
                <span className="text-base sm:text-xl sm:font-semibold">
                  Users:
                </span>
              </div>
              <span className="text-base sm:text-xl font-semibold">
                {usersCount}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-4 px-4 sm:px-0 sm:py-5">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-[#111827]" />
                <span className="text-base sm:text-xl sm:font-semibold">
                  Quarries:
                </span>
              </div>
              <span className="text-base sm:text-xl font-semibold">
                {quarriesCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[20px] sm:text-[24px] font-medium">
              Recent Invoices
            </CardTitle>
            <Button variant="ghost" className="text-sm">
              View All Invoices
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="flex flex-col">
            <Separator />
            {recentInvoices.map((invoice, index) => (
              <div
                key={invoice.invoiceId ?? index}
                className="flex justify-between items-center px-4 py-4 sm:p-4 sm:border sm:rounded-lg sm:mb-3 border-b sm:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{invoice.date}</span>
                  <span className="text-sm text-[#4B5563]">
                    {invoice.amount}
                  </span>
                  <TableBadges
                    names={
                      invoice.status === 'Pending' ? ['Pending'] : ['Paid']
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg sm:rounded-md"
                  disabled={!invoice.pdfUrl && !invoice.hostedUrl}
                  onClick={() => {
                    const url = invoice.pdfUrl || invoice.hostedUrl;
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download </span>PDF
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
