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
  SelectGroup,
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Search,
} from 'lucide-react';
import { formatNumberThousandSeparatorWithoutDecimal } from '@/lib/utils/number';
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
}

export function CustomerOverridesTable({
  globalMode,
  globalAmount,
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
              className={isMobile ? 'grid grid-cols-2 gap-2 w-full' : ''}
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
            <div className="overflow-x-auto">
              <div className="min-w-full py-2">
                <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
                  <div className="mb-4 flex h-5 items-center space-x-2 sm:mb-0">
                    <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                      Total Records:
                      <span className="text-accent-foreground ml-2">
                        {formatNumberThousandSeparatorWithoutDecimal(
                          totalElements,
                        )}
                      </span>
                    </p>

                    <Separator
                      orientation="vertical"
                      className="text-accent-foreground"
                    />

                    <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                      Rows per page
                    </p>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(val) => {
                        setPageSize(Number(val));
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[80px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {PAGE_SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex min-w-[100px] items-center justify-center whitespace-nowrap text-sm font-medium">
                      Page {page + 1} of {Math.max(1, totalPages)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(0)}
                        disabled={page === 0}
                      >
                        <span className="sr-only">First page</span>
                        <ChevronsLeft size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 0}
                      >
                        <span className="sr-only">Previous page</span>
                        <ChevronLeft size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= totalPages - 1}
                      >
                        <span className="sr-only">Next page</span>
                        <ChevronRight size={15} />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(totalPages - 1)}
                        disabled={page >= totalPages - 1}
                      >
                        <span className="sr-only">Last page</span>
                        <ChevronsRight size={15} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        globalMode={globalMode === RECOVERY_MODE.RECOVER ? 'charge' : 'absorb'}
        amount={globalAmount}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
