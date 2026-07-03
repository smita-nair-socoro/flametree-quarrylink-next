'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Receipt, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CustomerOverridesTable } from '../(data-tables)/fee-recovery/customer-overrides-table';
import { MOCK_CUSTOMER_OVERRIDES } from '../(data-tables)/fee-recovery/columns';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { SaveFeeDefaultsDialog } from './roles/fee-recovery-alert-dialogs';

type ChargeMode = 'charge' | 'absorb';

const GLOBAL_DEFAULT_CUSTOMER_COUNT = MOCK_CUSTOMER_OVERRIDES.filter(
  (row) => row.rule === 'global_default',
).length;
const CUSTOM_OVERRIDE_COUNT = MOCK_CUSTOMER_OVERRIDES.filter(
  (row) => row.rule === 'custom_rule',
).length;

export default function FeeRecoveryTab() {
  const { currencySymbol, formatCurrency } = useTenantCurrencyTax();
  const [chargeMode, setChargeMode] = React.useState<ChargeMode>('charge');
  const [savedChargeMode, setSavedChargeMode] =
    React.useState<ChargeMode>('charge');
  const [invoiceAmount, setInvoiceAmount] = React.useState('2.40');
  const [feeLabel, setFeeLabel] = React.useState('Digital Platform Fee');
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);

  const handleSaveDefaultsClick = () => {
    if (chargeMode !== savedChargeMode) {
      setSaveDialogOpen(true);
      return;
    }
    setSavedChargeMode(chargeMode);
  };

  const handleConfirmSaveDefaults = () => {
    setSavedChargeMode(chargeMode);
  };

  const feeStats = [
    { title: 'Customers', value: '6', description: 'in your account' },
    { title: 'Overrides', value: '3', description: 'custom charge / absorb' },
    {
      title: 'Absorbed',
      value: '1',
      description: 'following global or custom absorb',
    },
    {
      title: 'Actual past month recovery',
      value: formatCurrency(3051),
      description: 'Recovered from customers (invoiced dockets)',
    },
  ];

  const summaryText =
    chargeMode === 'charge'
      ? `Default: Charging ${currencySymbol}${invoiceAmount} per docket. Customer overrides: ${CUSTOM_OVERRIDE_COUNT}.`
      : `Default: Absorbing platform cost — no fee line on invoices. Customer overrides: ${CUSTOM_OVERRIDE_COUNT}.`;

  return (
    <>
      <div className="py-3 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Fee Recovery</h2>
            <Badge
              variant="outline"
              className="text-xs bg-[#FAF5FF] border-[#E9D4FF] rounded-lg text-[#8200DB]"
            >
              Tenant / Super admin only
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Configure how QuarryLink platform fees are passed through to
            customer invoices.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 rounded-lg border border-[#E9D4FF] bg-[#FAF5FF99] px-4 py-3 text-sm text-[#59168B]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#9810FA]" />
          <p>
            Fees lock at Delivered or Collected. Until then, uninvoiced dockets
            pick up tenant or customer rate changes. Once Delivered or
            Collected, the docket fee is frozen because the delivery receipt
            email will have already displayed the price.
          </p>
        </div>

        {/* Global defaults card */}
        <Card className="rounded-xl">
          <CardContent className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Global defaults</h3>
                {chargeMode !== savedChargeMode && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Applies to unlocked dockets unless a customer override or frozen
                docket fee applies.
              </p>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChargeMode('charge')}
                className={cn(
                  'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                  chargeMode === 'charge'
                    ? 'border-[#8E51FF] bg-[#FAF5FF80]'
                    : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-[#8E51FF]" />
                <div>
                  <p className="text-sm text-[#09090B] font-medium">
                    Charge customers
                  </p>
                  <p className="text-xs text-[#71717B]">
                    Add the fee line to their invoice.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChargeMode('absorb')}
                className={cn(
                  'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                  chargeMode === 'absorb'
                    ? 'border-[#8E51FF] bg-[#8E51FF]/5'
                    : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-[#8E51FF]" />
                <div>
                  <p className="text-sm text-[#09090B] font-medium">
                    Absorb the cost
                  </p>
                  <p className="text-xs text-[#71717B]">
                    No fee line; you cover platform cost.
                  </p>
                </div>
              </button>
            </div>

            {/* Amount + label inputs */}
            {chargeMode === 'charge' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">
                    Customer invoice amount (per docket)
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        className="pl-6"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-9 text-xs px-3"
                    >
                      Match subscription rate
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Fee label on Invoice</Label>
                  <Input
                    value={feeLabel}
                    onChange={(e) => setFeeLabel(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg bg-[#8E51FF]/5 px-4 py-2.5 text-sm text-[#8E51FF]">
              {summaryText}
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
                onClick={handleSaveDefaultsClick}
              >
                Save defaults
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {feeStats.map((stat) => (
            <Card key={stat.title} className="p-5 overflow-hidden">
              <CardContent className="p-2 space-y-1">
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="font-medium leading-tight text-[#737373] text-sm truncate block">
                      {stat.title}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="white">
                    <p>{stat.title}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-2xl font-bold pt-1">{stat.value}</div>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="text-sm font-normal text-muted-foreground truncate">
                      {stat.description}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent variant="white">
                    <p>{stat.description}</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customer overrides table */}
        <CustomerOverridesTable
          globalMode={savedChargeMode}
          globalAmount={invoiceAmount}
        />
      </div>

      <SaveFeeDefaultsDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onConfirm={handleConfirmSaveDefaults}
        mode={chargeMode}
        amount={invoiceAmount}
        currencySymbol={currencySymbol}
        customerCount={GLOBAL_DEFAULT_CUSTOMER_COUNT}
        overrideCount={CUSTOM_OVERRIDE_COUNT}
      />
    </>
  );
}
