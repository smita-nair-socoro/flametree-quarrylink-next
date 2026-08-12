'use client';

import React from 'react';
import { RemoveCustomOverrideDialog } from '../../tabs/roles/fee-recovery-alert-dialogs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InputIcon } from '@/components/ui/input-icon';
import { Loader2, Search } from 'lucide-react';
import { TablePaginationFooter } from '@/components/ui/table-pagination-footer';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCustomerOverridesTable } from '@/hooks/fee-recovery/use-customer-overrides-table';
import {
  EFFECTIVE_SOURCE,
  RECOVERY_MODE,
} from '@/lib/types/fee-recovery-enums';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

interface CustomerOverridesTableProps {
  globalMode: RECOVERY_MODE;
  globalAmount: string;
  /** Last-saved (not draft) global default, used for the revert dialog's copy. */
  savedGlobalMode: RECOVERY_MODE;
  savedGlobalAmount: string;
}

export function CustomerOverridesTable({
  globalMode,
  globalAmount,
  savedGlobalMode,
  savedGlobalAmount,
}: Readonly<CustomerOverridesTableProps>) {
  const isMobile = useIsMobile();
  const { currencySymbol, formatCurrency } = useTenantCurrencyTax();

  const {
    search,
    setSearch,
    ruleFilter,
    setRuleFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    rows,
    totalElements,
    totalPages,
    isLoading,
    isFetching,
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
    getEffectiveStatus,
    getEffectiveFee,
  } = useCustomerOverridesTable({ globalMode, globalAmount });

  const formatFee = (amount: number) => formatCurrency(amount);

  return (
    <>
      <Card className="fee-recovery-overrides rounded-xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Customer overrides</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customers on global default follow the setting above
              automatically. Turn on Custom to set an exception. Changes apply
              to uninvoiced, unlocked dockets only.
            </p>
          </div>

          {/* Search + filters */}
          <div
            className={`flex flex-wrap items-center gap-2 ${isMobile ? 'flex-col items-stretch' : ''}`}
          >
            <InputIcon
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search size={16} />}
              wrapperClassName={isMobile ? 'w-full' : 'w-64'}
            />
            <div
              className={
                isMobile ? 'grid grid-cols-2 gap-2 w-full' : 'flex gap-2'
              }
            >
              <Select
                value={ruleFilter}
                onValueChange={(val) => setRuleFilter(val as typeof ruleFilter)}
              >
                <SelectTrigger
                  className={`shrink-0 ${isMobile ? 'w-full' : 'w-40'}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All rules</SelectItem>
                  <SelectItem value={EFFECTIVE_SOURCE.GLOBAL_DEFAULT}>
                    Global default
                  </SelectItem>
                  <SelectItem value={EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE}>
                    Custom rule
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  setStatusFilter(val as typeof statusFilter)
                }
              >
                <SelectTrigger
                  className={`shrink-0 ${isMobile ? 'w-full' : 'w-36'}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value={RECOVERY_MODE.ABSORB}>Absorbed</SelectItem>
                  <SelectItem value={RECOVERY_MODE.RECOVER}>
                    Charging
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && isMobile && (
            /* Mobile card list */
            <div
              className={`space-y-3 ${isFetching ? 'opacity-60' : ''}`}
            >
              {rows.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No customers found
                </div>
              ) : (
                rows.map((customer) => {
                  const isCustom = isOn(customer.customerId);
                  const form = overrideForms[customer.customerId];
                  const isDirty = isRowDirty(customer.customerId);
                  const effectiveStatus = getEffectiveStatus(customer);
                  const effectiveFee = getEffectiveFee(customer);

                  return (
                    <div
                      key={customer.customerId}
                      className="rounded-lg border border-[#E9D4FF] p-4 space-y-2.5"
                    >
                      <p className="font-semibold">{customer.customerName}</p>

                      <div className="flex flex-wrap gap-2">
                        {!isCustom ? (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Global default
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[#8E51FF] border-[#8E51FF]/40 bg-[#8E51FF]/5"
                          >
                            Custom rule
                          </Badge>
                        )}
                        {effectiveStatus === RECOVERY_MODE.RECOVER ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-300 bg-green-50"
                          >
                            Charging
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Absorbed
                          </Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Fee / docket
                        </p>
                        <p className="font-medium">{formatFee(effectiveFee)}</p>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Custom override</span>
                        <Switch
                          checked={isCustom}
                          onCheckedChange={(checked) =>
                            handleToggle(customer, checked)
                          }
                          className="data-[state=checked]:bg-[#8E51FF]"
                        />
                      </div>

                      {isCustom && form && (
                        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                              Override rule
                            </Label>
                            <Select
                              value={form.overrideRule}
                              onValueChange={(val) =>
                                handleFormChange(
                                  customer.customerId,
                                  'overrideRule',
                                  val,
                                )
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
                            <>
                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                  Fee per docket
                                </Label>
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

                              <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                  Fee label on Invoice
                                </Label>
                                <Input
                                  className="h-11 w-full text-sm bg-white"
                                  placeholder="Custom label for this customer"
                                  value={form.label}
                                  onChange={(e) =>
                                    handleFormChange(
                                      customer.customerId,
                                      'label',
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </>
                          )}

                          <div className="flex items-center gap-3">
                            <Button
                              className="h-11 flex-1 bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
                              onClick={() => handleSave(customer.customerId)}
                              disabled={!isDirty || isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            {isDirty && (
                              <span className="text-sm font-medium text-orange-600">
                                Unsaved
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
          {!isLoading && !isMobile && (
            <div
              className={`rounded-md border overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 w-[40%]">Customer</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Fee / docket</TableHead>
                    <TableHead className="text-right pr-4">Override</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((customer) => {
                      const isCustom = isOn(customer.customerId);
                      const form = overrideForms[customer.customerId];
                      const isDirty = isRowDirty(customer.customerId);
                      const effectiveStatus = getEffectiveStatus(customer);
                      const effectiveFee = getEffectiveFee(customer);

                      return (
                        <React.Fragment key={customer.customerId}>
                          <TableRow
                            className={`bg-white hover:bg-gray-50 ${isCustom ? 'border-b-0' : ''}`}
                          >
                            <TableCell className="pl-4 font-medium">
                              {customer.customerName}
                            </TableCell>

                            <TableCell>
                              {!isCustom ? (
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground"
                                >
                                  Global default
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[#8E51FF] border-[#8E51FF]/40 bg-[#8E51FF]/5"
                                >
                                  Custom rule
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              {effectiveStatus === RECOVERY_MODE.RECOVER ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 border-green-300 bg-green-50"
                                >
                                  Charging
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground"
                                >
                                  Absorbed
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell className="text-right">
                              {formatFee(effectiveFee)}
                            </TableCell>

                            <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Custom
                                </span>
                                <Switch
                                  checked={isCustom}
                                  onCheckedChange={(checked) =>
                                    handleToggle(customer, checked)
                                  }
                                  className="data-[state=checked]:bg-[#8E51FF]"
                                />
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded override form */}
                          {isCustom && form && (
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                              <TableCell colSpan={5} className="pl-4 py-3">
                                <div className="flex items-end gap-3">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                      Override rule
                                    </Label>
                                    <Select
                                      value={form.overrideRule}
                                      onValueChange={(val) =>
                                        handleFormChange(
                                          customer.customerId,
                                          'overrideRule',
                                          val,
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-44 h-9 text-sm">
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
                                    <>
                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">
                                          Fee per docket
                                        </Label>
                                        <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            {currencySymbol}
                                          </span>
                                          <Input
                                            className="pl-6 h-9 w-28 text-sm"
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

                                      <div className="space-y-1.5">
                                        <Label className="text-xs text-muted-foreground">
                                          Fee label on Invoice
                                        </Label>
                                        <Input
                                          className="h-9 w-48 text-sm"
                                          placeholder="Custom label"
                                          value={form.label}
                                          onChange={(e) =>
                                            handleFormChange(
                                              customer.customerId,
                                              'label',
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </div>
                                    </>
                                  )}

                                  {isDirty && (
                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 self-end mb-1.5">
                                      Unsaved
                                    </span>
                                  )}

                                  <Button
                                    size="sm"
                                    className="h-9 bg-[#8E51FF] hover:bg-[#7C3FEF] text-white"
                                    onClick={() => handleSave(customer.customerId)}
                                    disabled={!isDirty || isSaving}
                                  >
                                    {isSaving ? 'Saving...' : 'Save'}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && (
            <TablePaginationFooter
              totalElements={totalElements}
              pageIndex={page}
              pageCount={Math.max(1, totalPages)}
              pageSize={String(pageSize)}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageSizeChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
              onFirstPage={() => setPage(0)}
              onPreviousPage={() => setPage((p) => p - 1)}
              onNextPage={() => setPage((p) => p + 1)}
              onLastPage={() => setPage(totalPages - 1)}
              canPreviousPage={page > 0}
              canNextPage={page < totalPages - 1}
            />
          )}
        </CardContent>
      </Card>

      <RemoveCustomOverrideDialog
        open={revertTarget !== null}
        onOpenChange={(next) => {
          if (!next) clearRevertTarget();
        }}
        onConfirm={handleConfirmRevert}
        customerName={revertTarget?.customerName ?? ''}
        globalMode={savedGlobalMode === RECOVERY_MODE.RECOVER ? 'charge' : 'absorb'}
        amount={savedGlobalAmount}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
