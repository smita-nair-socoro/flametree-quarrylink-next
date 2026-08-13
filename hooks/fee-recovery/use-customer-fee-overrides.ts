'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  useDeleteCustomerFeeRecoveryOverride,
  useUpdateCustomerFeeRecoveryOverride,
} from '@/lib/api/fee-recovery';
import type { CustomerFeeRecoverySettingsDto } from '@/lib/types/fee-recovery';
import { EFFECTIVE_SOURCE, RECOVERY_MODE } from '@/lib/types/fee-recovery-enums';

export type OverrideFormState = {
  overrideRule: RECOVERY_MODE;
  fee: string;
  label: string;
};

type RowState = {
  isCustom: boolean;
  /** Has an in-progress local edit not yet saved or discarded. */
  isTouched: boolean;
  draft: OverrideFormState;
  /** Last known server value; the dirty-diff baseline. */
  saved: OverrideFormState;
};

type RowStates = Record<number, RowState>;

const hasOverride = (customer: CustomerFeeRecoverySettingsDto) =>
  customer.effectiveSource === EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE;

function buildOverrideForm(
  c: CustomerFeeRecoverySettingsDto,
): OverrideFormState {
  return {
    overrideRule: c.overrideMode,
    // Blank only makes sense for ABSORB rows — the fee input is hidden
    // whenever overrideRule !== RECOVER, so a genuine $0 RECOVER fee must
    // still render as '0', not indistinguishable from "not yet entered".
    fee: c.overrideMode === RECOVERY_MODE.RECOVER ? String(c.overrideFeeAmount) : '',
    label: c.overrideInvoiceLineDescription || '',
  };
}

// Owns the Custom-override toggle, form state, and save/revert mutations for
// the fee-recovery customer overrides table (desktop table + mobile cards).
export function useCustomerFeeOverrides(
  customers: CustomerFeeRecoverySettingsDto[],
  globalFeeLabel: string,
) {
  const updateOverride = useUpdateCustomerFeeRecoveryOverride();
  const deleteOverride = useDeleteCustomerFeeRecoveryOverride();

  const [rows, setRows] = useState<RowStates>({});
  const [revertTarget, setRevertTarget] =
    useState<CustomerFeeRecoverySettingsDto | null>(null);

  // Sync local per-row state whenever the customer list loads or refetches
  // (e.g. after a save/revert round-trips to the server). Rows with an
  // in-progress local edit are frozen entirely so a refetch triggered by a
  // *different* row's save can't silently overwrite this row's unsaved
  // draft or dirty-diff baseline.
  useEffect(() => {
    setRows((prev) => {
      const next: RowStates = {};
      for (const c of customers) {
        const existing = prev[c.customerId];
        if (existing?.isTouched) {
          next[c.customerId] = existing;
          continue;
        }
        const form = buildOverrideForm(c);
        next[c.customerId] = {
          isCustom: hasOverride(c),
          isTouched: false,
          draft: form,
          saved: form,
        };
      }
      return next;
    });
  }, [customers]);

  const isOn = (customerId: number) => rows[customerId]?.isCustom ?? false;

  const handleToggle = (
    row: CustomerFeeRecoverySettingsDto,
    checked: boolean,
  ) => {
    if (!checked) {
      // Nothing saved on the server yet (override was only just turned on
      // locally) — turn it off directly, no confirmation or delete call needed.
      if (!hasOverride(row)) {
        setRows((prev) => ({
          ...prev,
          [row.customerId]: {
            ...prev[row.customerId],
            isCustom: false,
            isTouched: false,
          },
        }));
        return;
      }
      setRevertTarget(row);
      return;
    }
    setRows((prev) => ({
      ...prev,
      [row.customerId]: {
        ...prev[row.customerId],
        isCustom: true,
        isTouched: true,
      },
    }));
  };

  const handleConfirmRevert = () => {
    if (!revertTarget) return;
    const customerId = revertTarget.customerId;
    setRevertTarget(null);
    deleteOverride.mutate(customerId, {
      onSuccess: () => {
        setRows((prev) => ({
          ...prev,
          [customerId]: {
            ...prev[customerId],
            isCustom: false,
            isTouched: false,
          },
        }));
      },
    });
  };

  const handleFormChange = (
    customerId: number,
    field: keyof OverrideFormState,
    value: string,
  ) => {
    setRows((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        isTouched: true,
        draft: { ...prev[customerId].draft, [field]: value },
      },
    }));
  };

  const handleSave = (customerId: number) => {
    const row = rows[customerId];
    if (!row) return;

    updateOverride.mutate(
      {
        customerId,
        data: {
          recoveryMode: row.draft.overrideRule,
          feeAmount:
            row.draft.overrideRule === RECOVERY_MODE.RECOVER
              ? Number.parseFloat(row.draft.fee) || 0
              : 0,
          invoiceLineDescription: row.draft.label.trim() || globalFeeLabel,
        },
      },
      {
        onSuccess: () => {
          setRows((prev) => ({
            ...prev,
            [customerId]: {
              ...prev[customerId],
              saved: row.draft,
              isTouched: false,
            },
          }));
        },
      },
    );
  };

  const isRowDirty = (customerId: number) => {
    const row = rows[customerId];
    if (!row) return false;
    if (row.draft.overrideRule !== row.saved.overrideRule) return true;
    if (row.draft.overrideRule !== RECOVERY_MODE.RECOVER) return false;
    return row.draft.fee !== row.saved.fee || row.draft.label !== row.saved.label;
  };

  const overrideForms = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(rows).map(([id, r]) => [id, r.draft]),
      ) as Record<number, OverrideFormState>,
    [rows],
  );

  return {
    isOn,
    overrideForms,
    handleToggle,
    handleFormChange,
    handleSave,
    isRowDirty,
    isSaving: updateOverride.isPending,
    revertTarget,
    clearRevertTarget: () => setRevertTarget(null),
    handleConfirmRevert,
  };
}
