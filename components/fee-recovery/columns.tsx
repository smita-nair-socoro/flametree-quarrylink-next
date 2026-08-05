'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TableBadges } from '@/components/table-badges';
import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { FeeRecoveryScreenCustomerDto } from '@/lib/types/fee-recovery';
import {
  EFFECTIVE_SOURCE,
  RECOVERY_MODE,
} from '@/lib/types/fee-recovery-enums';
import type { OverrideFormState } from './use-customer-fee-overrides';

export function getEffectiveStatus(
  customer: FeeRecoveryScreenCustomerDto,
  on: boolean,
  form: OverrideFormState | undefined,
  globalMode: 'charge' | 'absorb',
): RECOVERY_MODE {
  if (on) {
    return form?.overrideRule === RECOVERY_MODE.RECOVER
      ? RECOVERY_MODE.RECOVER
      : RECOVERY_MODE.ABSORB;
  }
  return globalMode === 'charge' ? RECOVERY_MODE.RECOVER : RECOVERY_MODE.ABSORB;
}

export function getEffectiveFee(
  on: boolean,
  form: OverrideFormState | undefined,
  globalMode: 'charge' | 'absorb',
  globalAmount: string,
): number {
  if (on) {
    return form?.overrideRule === RECOVERY_MODE.RECOVER
      ? Number.parseFloat(form?.fee ?? '0') || 0
      : 0;
  }
  return globalMode === 'charge' ? Number.parseFloat(globalAmount) || 0 : 0;
}

interface GetCustomerOverrideColumnsParams {
  globalMode: 'charge' | 'absorb';
  globalAmount: string;
  currencySymbol: string;
  formatFee: (amount: number) => string;
  isOn: (customerId: number) => boolean;
  overrideForms: Record<number, OverrideFormState>;
  isRowDirty: (customerId: number) => boolean;
  isSaving: boolean;
  onToggle: (row: FeeRecoveryScreenCustomerDto, checked: boolean) => void;
  onFormChange: (
    customerId: number,
    field: keyof OverrideFormState,
    value: string,
  ) => void;
  onSave: (customerId: number) => void;
}

export function getCustomerOverrideColumns({
  globalMode,
  globalAmount,
  currencySymbol,
  formatFee,
  isOn,
  overrideForms,
  isRowDirty,
  isSaving,
  onToggle,
  onFormChange,
  onSave,
}: GetCustomerOverrideColumnsParams): ColumnDef<FeeRecoveryScreenCustomerDto>[] {
  return [
    {
      id: 'customer',
      accessorFn: (row) => row.customerName,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => (
        <div className="py-2 font-medium">{row.original.customerName}</div>
      ),
    },
    {
      id: 'rule',
      accessorFn: (row) =>
        isOn(row.customerId)
          ? EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE
          : EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Rule" />
      ),
      cell: ({ getValue }) => (
        <TableBadges
          names={[
            (getValue() as EFFECTIVE_SOURCE) ===
            EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE
              ? 'Custom rule'
              : 'Global default',
          ]}
          visibleCount={1}
        />
      ),
      enableGlobalFilter: false,
    },
    {
      id: 'status',
      accessorFn: (row) =>
        getEffectiveStatus(
          row,
          isOn(row.customerId),
          overrideForms[row.customerId],
          globalMode,
        ),
      header: ({ column }) => (
        <TableClientSortableHeader column={column} title="Status" />
      ),
      cell: ({ getValue }) => (
        <TableBadges
          names={[
            (getValue() as RECOVERY_MODE) === RECOVERY_MODE.RECOVER
              ? 'Charging'
              : 'Absorbed',
          ]}
          visibleCount={1}
        />
      ),
      enableGlobalFilter: false,
    },
    {
      id: 'fee',
      accessorFn: (row) => {
        const on = isOn(row.customerId);
        return getEffectiveFee(
          on,
          overrideForms[row.customerId],
          globalMode,
          globalAmount,
        );
      },
      header: ({ column }) => (
        <div className="text-right">
          <TableClientSortableHeader column={column} title="Fee / docket" />
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-right">{formatFee(getValue() as number)}</div>
      ),
      enableGlobalFilter: false,
    },
    {
      id: 'override',
      header: () => <div className="text-right pr-1">Override</div>,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const customer = row.original;
        const on = isOn(customer.customerId);
        const form = overrideForms[customer.customerId];
        const dirty = isRowDirty(customer.customerId);

        return (
          <div className="flex items-center justify-end gap-2">
            {on && form && (
              <Popover open onOpenChange={() => {}}>
                <PopoverTrigger asChild>
                  <span />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Override rule
                    </Label>
                    <Select
                      value={form.overrideRule}
                      onValueChange={(val) =>
                        onFormChange(customer.customerId, 'overrideRule', val)
                      }
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
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
                      <Label className="text-xs text-muted-foreground">
                        Fee per docket
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {currencySymbol}
                        </span>
                        <Input
                          className="pl-6 h-9 text-sm"
                          value={form.fee}
                          onChange={(e) =>
                            onFormChange(
                              customer.customerId,
                              'fee',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-9 flex-1 bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
                      onClick={() => onSave(customer.customerId)}
                      disabled={!dirty || isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    {dirty && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        Unsaved
                      </span>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <span className="text-sm text-muted-foreground">Custom</span>
            <Switch
              checked={on}
              onCheckedChange={(checked) => onToggle(customer, checked)}
              className="data-[state=checked]:bg-[#8E51FF]"
            />
          </div>
        );
      },
    },
  ];
}
