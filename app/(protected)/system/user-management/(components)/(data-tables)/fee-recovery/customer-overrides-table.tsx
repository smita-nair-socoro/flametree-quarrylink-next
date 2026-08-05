'use client';

import React, { useState, useMemo } from 'react';
import {
  CustomerOverrideRow,
  OverrideRule,
  RuleType,
  StatusType,
  MOCK_CUSTOMER_OVERRIDES,
} from './columns';
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
import { cn } from '@/lib/utils';
import { formatNumberThousandSeparatorWithoutDecimal } from '@/lib/utils/number';
import { useTenantCurrencyTax } from '@/lib/utils/tenant-config-helper';
import { useIsMobile } from '@/hooks/use-mobile';

const MOBILE_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

type OverrideFormState = {
  overrideRule: OverrideRule;
  fee: string;
};

interface CustomerOverridesTableProps {
  globalMode: 'charge' | 'absorb';
  globalAmount: string;
}

export function CustomerOverridesTable({
  globalMode,
  globalAmount,
}: CustomerOverridesTableProps) {
  const isMobile = useIsMobile();
  const { currencySymbol, formatCurrency } = useTenantCurrencyTax();
  const [search, setSearch] = useState('');
  const [ruleFilter, setRuleFilter] = useState<'all' | RuleType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StatusType>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Mobile infinite scroll: how many rows are currently revealed.
  const [visibleCount, setVisibleCount] = useState(MOBILE_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const [revertTarget, setRevertTarget] = useState<CustomerOverrideRow | null>(
    null,
  );

  const [customToggles, setCustomToggles] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        MOCK_CUSTOMER_OVERRIDES.map((r) => [r.id, r.isCustom]),
      ),
  );

  const buildOverrideForms = (): Record<string, OverrideFormState> =>
    Object.fromEntries(
      MOCK_CUSTOMER_OVERRIDES.map((r) => [
        r.id,
        {
          overrideRule: r.overrideRule,
          fee: r.customFee > 0 ? String(r.customFee) : '',
        },
      ]),
    );

  const [overrideForms, setOverrideForms] =
    useState<Record<string, OverrideFormState>>(buildOverrideForms);

  // Baseline used to detect unsaved changes; only updated when a row is saved.
  const [savedOverrideForms, setSavedOverrideForms] =
    useState<Record<string, OverrideFormState>>(buildOverrideForms);

  const filtered = useMemo(() => {
    return MOCK_CUSTOMER_OVERRIDES.filter((row) => {
      const matchesSearch = row.customer
        .toLowerCase()
        .includes(search.toLowerCase());

      const isOn = customToggles[row.id] ?? false;
      const savedForm = savedOverrideForms[row.id];

      const effectiveRule: RuleType = isOn ? 'custom_rule' : 'global_default';

      let effectiveStatus: StatusType;
      if (isOn) {
        effectiveStatus =
          savedForm?.overrideRule === 'charge_customer'
            ? 'charging'
            : 'absorbed';
      } else {
        effectiveStatus = globalMode === 'charge' ? 'charging' : 'absorbed';
      }

      const matchesRule = ruleFilter === 'all' || effectiveRule === ruleFilter;
      const matchesStatus =
        statusFilter === 'all' || effectiveStatus === statusFilter;
      return matchesSearch && matchesRule && matchesStatus;
    });
  }, [
    search,
    ruleFilter,
    statusFilter,
    customToggles,
    savedOverrideForms,
    globalMode,
  ]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageRows = filtered.slice(page * pageSize, (page + 1) * pageSize);

  // Mobile infinite scroll: reset the reveal count whenever the filtered set changes.
  React.useEffect(() => {
    setVisibleCount(MOBILE_PAGE_SIZE);
  }, [search, ruleFilter, statusFilter]);

  const mobileRows = filtered.slice(0, visibleCount);
  const hasMoreMobileRows = visibleCount < filtered.length;

  React.useEffect(() => {
    if (!isMobile) return;
    const target = sentinelRef.current;
    if (!target || !hasMoreMobileRows) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isLoadingMore) return;
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + MOBILE_PAGE_SIZE, filtered.length),
          );
          setIsLoadingMore(false);
        }, 300);
      },
      { rootMargin: '120px', threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isMobile, hasMoreMobileRows, isLoadingMore, filtered.length]);

  const handleToggle = (row: CustomerOverrideRow, checked: boolean) => {
    if (!checked) {
      setRevertTarget(row);
      return;
    }
    setCustomToggles((prev) => ({ ...prev, [row.id]: true }));
  };

  const handleConfirmRevert = () => {
    if (!revertTarget) return;
    setCustomToggles((prev) => ({ ...prev, [revertTarget.id]: false }));
    setRevertTarget(null);
  };

  const handleFormChange = (
    id: string,
    field: keyof OverrideFormState,
    value: string,
  ) => {
    setOverrideForms((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: string) => {
    setSavedOverrideForms((prev) => ({ ...prev, [id]: overrideForms[id] }));
  };

  const isRowDirty = (id: string, form: OverrideFormState) => {
    const saved = savedOverrideForms[id];
    if (!saved) return false;
    if (form.overrideRule !== saved.overrideRule) return true;
    return form.overrideRule === 'charge_customer' && form.fee !== saved.fee;
  };

  const formatFee = (amount: number) => formatCurrency(amount);

  const formatPastMonth = (amount: number) =>
    `${currencySymbol}${formatNumberThousandSeparatorWithoutDecimal(amount)}`;

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
            className={cn(
              'flex flex-wrap items-center gap-2',
              isMobile && 'flex-col items-stretch',
            )}
          >
            <InputIcon
              placeholder="Search customers..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              startIcon={<Search size={16} />}
              wrapperClassName={isMobile ? 'w-full' : 'w-64'}
            />
            <div className={cn(isMobile && 'grid grid-cols-2 gap-2 w-full')}>
              <Select
                value={ruleFilter}
                onValueChange={(val) => {
                  setRuleFilter(val as typeof ruleFilter);
                  setPage(0);
                }}
              >
                <SelectTrigger
                  className={cn('shrink-0', isMobile ? 'w-full' : 'w-40')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All rules</SelectItem>
                  <SelectItem value="global_default">Global default</SelectItem>
                  <SelectItem value="custom_rule">Custom rule</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val as typeof statusFilter);
                  setPage(0);
                }}
              >
                <SelectTrigger
                  className={cn('shrink-0', isMobile ? 'w-full' : 'w-36')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="absorbed">Absorbed</SelectItem>
                  <SelectItem value="charging">Charging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile card list */}
          {isMobile ? (
            <div className="space-y-3">
              {mobileRows.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No customers found
                </div>
              ) : (
                mobileRows.map((row) => {
                  const isOn = customToggles[row.id] ?? false;
                  const form = overrideForms[row.id];
                  const isDirty = isRowDirty(row.id, form);

                  return (
                    <div
                      key={row.id}
                      className="rounded-lg border border-[#E9D4FF] p-4 space-y-2.5"
                    >
                      <div>
                        <p className="font-semibold">{row.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {row.customerCode}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {row.rule === 'global_default' ? (
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
                        {row.status === 'charging' ? (
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

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Fee / docket
                          </p>
                          <p className="font-medium">
                            {formatFee(row.feePerDocket)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Past month
                          </p>
                          <p className="font-medium">
                            {formatPastMonth(row.pastMonth)}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Custom override</span>
                        <Switch
                          checked={isOn}
                          onCheckedChange={(checked) =>
                            handleToggle(row, checked)
                          }
                          className="data-[state=checked]:bg-[#8E51FF]"
                        />
                      </div>

                      {isOn && (
                        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                          <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                              Override rule
                            </Label>
                            <Select
                              value={form.overrideRule}
                              onValueChange={(val) =>
                                handleFormChange(row.id, 'overrideRule', val)
                              }
                            >
                              <SelectTrigger className="w-full h-11 text-sm bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="charge_customer">
                                  Charge customer
                                </SelectItem>
                                <SelectItem value="absorb_cost">
                                  Absorb cost
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {form.overrideRule === 'charge_customer' && (
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
                                      row.id,
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
                              onClick={() => handleSave(row.id)}
                              disabled={!isDirty}
                            >
                              Save
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

              {hasMoreMobileRows && (
                <div ref={sentinelRef} className="flex justify-center py-3">
                  {isLoadingMore && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              )}
              {!hasMoreMobileRows && filtered.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  All customers loaded
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4 w-[32%]">Customer</TableHead>
                      <TableHead>Rule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Fee / docket</TableHead>
                      <TableHead className="text-right">Past month</TableHead>
                      <TableHead className="text-right pr-4">
                        Override
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((row) => {
                        const isOn = customToggles[row.id] ?? false;
                        const form = overrideForms[row.id];
                        const savedForm = savedOverrideForms[row.id];

                        const isDirty = isRowDirty(row.id, form);

                        let effectiveStatus: StatusType;
                        if (isOn) {
                          effectiveStatus =
                            savedForm?.overrideRule === 'charge_customer'
                              ? 'charging'
                              : 'absorbed';
                        } else {
                          effectiveStatus =
                            globalMode === 'charge' ? 'charging' : 'absorbed';
                        }

                        let effectiveFee: number;
                        if (isOn) {
                          effectiveFee =
                            savedForm?.overrideRule === 'charge_customer'
                              ? Number.parseFloat(savedForm?.fee ?? '0') || 0
                              : 0;
                        } else {
                          effectiveFee =
                            globalMode === 'charge'
                              ? parseFloat(globalAmount) || 0
                              : 0;
                        }

                        return (
                          <React.Fragment key={row.id}>
                            <TableRow
                              className={cn(
                                'bg-white hover:bg-gray-50',
                                isOn && 'border-b-0',
                              )}
                            >
                              <TableCell className="pl-4 font-medium">
                                {row.customer}
                              </TableCell>

                              <TableCell>
                                {!isOn ? (
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
                                {effectiveStatus === 'charging' ? (
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

                              <TableCell className="text-right">
                                {formatPastMonth(row.pastMonth)}
                              </TableCell>

                              <TableCell className="text-right pr-4">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Custom
                                  </span>
                                  <Switch
                                    checked={isOn}
                                    onCheckedChange={(checked) =>
                                      handleToggle(row, checked)
                                    }
                                    className="data-[state=checked]:bg-[#8E51FF]"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded override form */}
                            {isOn && (
                              <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableCell colSpan={6} className="pl-4 py-3">
                                  <div className="flex items-end gap-3">
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">
                                        Override rule
                                      </Label>
                                      <Select
                                        value={form.overrideRule}
                                        onValueChange={(val) =>
                                          handleFormChange(
                                            row.id,
                                            'overrideRule',
                                            val,
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-44 h-9 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="charge_customer">
                                            Charge customer
                                          </SelectItem>
                                          <SelectItem value="absorb_cost">
                                            Absorb cost
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {form.overrideRule ===
                                      'charge_customer' && (
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
                                                row.id,
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
                                      onClick={() => handleSave(row.id)}
                                      disabled={!isDirty}
                                    >
                                      Save
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

              {/* Pagination */}
              <div className="overflow-x-auto">
                <div className="min-w-full py-2">
                  <div className="flex flex-col items-center justify-between sm:flex-row sm:space-x-6">
                    <div className="mb-4 flex h-5 items-center space-x-2 sm:mb-0">
                      <p className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                        Total Records:
                        <span className="text-accent-foreground ml-2">
                          {formatNumberThousandSeparatorWithoutDecimal(
                            filtered.length,
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
            </>
          )}
        </CardContent>
      </Card>

      <RemoveCustomOverrideDialog
        open={revertTarget !== null}
        onOpenChange={(next) => {
          if (!next) setRevertTarget(null);
        }}
        onConfirm={handleConfirmRevert}
        customerName={revertTarget?.customer ?? ''}
        globalMode={globalMode}
        amount={globalAmount}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
