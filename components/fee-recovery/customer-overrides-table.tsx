'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TableBadges } from '@/components/table-badges';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { RemoveCustomOverrideDialog } from '@/app/(protected)/system/user-management/(components)/tabs/roles/fee-recovery-alert-dialogs';
import { FeeRecoveryScreenQueryOptions } from '@/lib/api/fee-recovery';
import type { FeeRecoveryScreenCustomerDto } from '@/lib/types/fee-recovery';
import {
  EFFECTIVE_SOURCE,
  RECOVERY_MODE,
} from '@/lib/types/fee-recovery-enums';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useCustomerFeeOverrides } from './use-customer-fee-overrides';
import {
  getCustomerOverrideColumns,
  getEffectiveFee,
  getEffectiveStatus,
} from './columns';

interface CustomerOverridesTableProps {
  globalMode: 'charge' | 'absorb';
  globalAmount: string;
}

const FACET_DEFS: FacetDefinition[] = [
  {
    column: 'rule',
    title: 'Rule',
    options: [
      { value: EFFECTIVE_SOURCE.GLOBAL_DEFAULT, label: 'Global default' },
      { value: EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE, label: 'Custom rule' },
    ],
  },
  {
    column: 'status',
    title: 'Status',
    options: [
      { value: RECOVERY_MODE.RECOVER, label: 'Charging' },
      { value: RECOVERY_MODE.ABSORB, label: 'Absorbed' },
    ],
  },
];

export function CustomerOverridesTable({
  globalMode,
  globalAmount,
}: Readonly<CustomerOverridesTableProps>) {
  const { currencySymbol, formatCurrency } = useTenantCurrencyTax();
  const { data, isLoading } = useQuery(FeeRecoveryScreenQueryOptions());
  const customers = useMemo(() => data?.customers ?? [], [data?.customers]);
  const globalFeeLabel = data?.settings?.invoiceLineDescription ?? '';

  const {
    isOn,
    overrideForms,
    handleToggle,
    handleFormChange,
    handleSave,
    isRowDirty,
    isSaving,
    revertTarget,
    clearRevertTarget,
    handleConfirmRevert,
  } = useCustomerFeeOverrides(customers, globalFeeLabel);

  const formatFee = React.useCallback(
    (amount: number) => formatCurrency(amount),
    [formatCurrency],
  );

  const columns = useMemo(
    () =>
      getCustomerOverrideColumns({
        globalMode,
        globalAmount,
        currencySymbol,
        formatFee,
        isOn,
        overrideForms,
        isRowDirty,
        isSaving,
        onToggle: handleToggle,
        onFormChange: handleFormChange,
        onSave: handleSave,
      }),
    [
      globalMode,
      globalAmount,
      currencySymbol,
      formatFee,
      isOn,
      overrideForms,
      isRowDirty,
      isSaving,
      handleToggle,
      handleFormChange,
      handleSave,
    ],
  );

  const renderMobileCard = React.useCallback(
    (customer: FeeRecoveryScreenCustomerDto) => {
      const on = isOn(customer.customerId);
      const form = overrideForms[customer.customerId];
      const dirty = isRowDirty(customer.customerId);
      const effectiveStatus = getEffectiveStatus(
        customer,
        on,
        form,
        globalMode,
      );
      const effectiveFee = getEffectiveFee(on, form, globalMode, globalAmount);

      return (
        <div
          key={customer.customerId}
          className="rounded-lg border border-[#E9D4FF] p-4 space-y-2.5"
        >
          <div>
            <p className="font-semibold">{customer.customerName}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TableBadges
              names={[on ? 'Custom rule' : 'Global default']}
              visibleCount={1}
            />
            <TableBadges
              names={[
                effectiveStatus === RECOVERY_MODE.RECOVER
                  ? 'Charging'
                  : 'Absorbed',
              ]}
              visibleCount={1}
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Fee / docket</p>
            <p className="font-medium">{formatFee(effectiveFee)}</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm">Custom override</span>
            <Switch
              checked={on}
              onCheckedChange={(checked) => handleToggle(customer, checked)}
              className="data-[state=checked]:bg-[#8E51FF]"
            />
          </div>

          {on && form && (
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Override rule</Label>
                <Select
                  value={form.overrideRule}
                  onValueChange={(val) =>
                    handleFormChange(customer.customerId, 'overrideRule', val)
                  }
                >
                  <SelectTrigger className="w-full h-11 text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RECOVERY_MODE.RECOVER}>
                      Charge customer
                    </SelectItem>
                    <SelectItem value={RECOVERY_MODE.ABSORB}>
                      Absorb cost
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.overrideRule === RECOVERY_MODE.RECOVER && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Fee per docket</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      className="pl-6 h-11 w-full text-sm bg-white"
                      value={form.fee}
                      onChange={(e) =>
                        handleFormChange(
                          customer.customerId,
                          'fee',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  className="h-11 flex-1 bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
                  onClick={() => handleSave(customer.customerId)}
                  disabled={!dirty || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                {dirty && (
                  <span className="text-sm font-medium text-orange-600">
                    Unsaved
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      );
    },
    [
      isOn,
      overrideForms,
      isRowDirty,
      globalMode,
      globalAmount,
      formatFee,
      currencySymbol,
      handleToggle,
      handleFormChange,
      handleSave,
      isSaving,
    ],
  );

  return (
    <>
      <Card className="rounded-xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Customer overrides</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customers on global default follow the setting above
              automatically. Turn on Custom to set an exception. Changes apply
              to uninvoiced, unlocked dockets only.
            </p>
          </div>

          <DataTableClient
            tableId="fee_recovery_customer_overrides"
            data={customers}
            columns={columns}
            facetDefinition={FACET_DEFS}
            searchPlaceHolder="Search customers..."
            mobileCardRenderer={renderMobileCard}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <RemoveCustomOverrideDialog
        open={revertTarget !== null}
        onOpenChange={(next) => {
          if (!next) clearRevertTarget();
        }}
        onConfirm={handleConfirmRevert}
        customerName={revertTarget?.customerName ?? ''}
        globalMode={globalMode}
        amount={globalAmount}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
