'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CustomerFeeRecoveryOverridesQueryOptions,
  FeeRecoveryScreenQueryOptions,
} from '@/lib/api/fee-recovery';
import type { CustomerFeeRecoverySettingsDto } from '@/lib/types/fee-recovery';
import {
  EFFECTIVE_SOURCE,
  RECOVERY_MODE,
} from '@/lib/types/fee-recovery-enums';
import { useDebounce } from '@/hooks/use-debounce';
import { useCustomerFeeOverrides } from './use-customer-fee-overrides';

// Owns search/filter/pagination state, the paginated customer-overrides
// query, and (via useCustomerFeeOverrides) the per-row toggle/save/revert
// actions for the fee-recovery customer overrides table.
export function useCustomerOverridesTable({
  globalMode,
  globalAmount,
}: {
  globalMode: RECOVERY_MODE;
  globalAmount: string;
}) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [ruleFilter, setRuleFilter] = useState<'all' | EFFECTIVE_SOURCE>(
    'all',
  );
  const [statusFilter, setStatusFilter] = useState<'all' | RECOVERY_MODE>(
    'all',
  );
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Reset back to the first page whenever the effective query changes.
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, ruleFilter, statusFilter]);

  // TODO(QLINK-3313): search/effectiveSource/recoveryMode are wired ahead of
  // backend support — they're no-ops server-side until that ships.
  const { data, isLoading, isFetching } = useQuery(
    CustomerFeeRecoveryOverridesQueryOptions({
      page,
      size: pageSize,
      search: debouncedSearch || undefined,
      effectiveSource: ruleFilter === 'all' ? undefined : ruleFilter,
      recoveryMode: statusFilter === 'all' ? undefined : statusFilter,
    }),
  );
  const rows = useMemo(() => data?.content ?? [], [data]);
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const { data: screenData } = useQuery(FeeRecoveryScreenQueryOptions());
  const globalFeeLabel = screenData?.settings?.invoiceLineDescription ?? '';

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
  } = useCustomerFeeOverrides(rows, globalFeeLabel);

  const getEffectiveStatus = (
    customer: CustomerFeeRecoverySettingsDto,
  ): RECOVERY_MODE => {
    const on = isOn(customer.customerId);
    const form = overrideForms[customer.customerId];
    // No override rule picked yet — preview the global default until one is chosen.
    if (!on || !form?.overrideRule) return globalMode;
    return form.overrideRule;
  };

  const getEffectiveFee = (customer: CustomerFeeRecoverySettingsDto) => {
    const on = isOn(customer.customerId);
    const form = overrideForms[customer.customerId];
    const usesGlobalDefault = !on || !form?.overrideRule;
    const mode = usesGlobalDefault ? globalMode : form.overrideRule;
    if (mode !== RECOVERY_MODE.RECOVER) return 0;
    const amount = usesGlobalDefault ? globalAmount : form.fee;
    return Number.parseFloat(amount ?? '0') || 0;
  };

  return {
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
  };
}
