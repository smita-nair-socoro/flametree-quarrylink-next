'use client';

import { useEffect, useState } from 'react';
import {
  useDeleteCustomerFeeRecoveryOverride,
  useUpdateCustomerFeeRecoveryOverride,
} from '@/lib/api/fee-recovery';
import type { FeeRecoveryScreenCustomerDto } from '@/lib/types/fee-recovery';
import { RECOVERY_MODE } from '@/lib/types/fee-recovery-enums';

export type OverrideFormState = {
  overrideRule: RECOVERY_MODE;
  fee: string;
};

function buildOverrideForms(
  customers: FeeRecoveryScreenCustomerDto[],
): Record<number, OverrideFormState> {
  return Object.fromEntries(
    customers.map((c) => [
      c.customerId,
      {
        overrideRule: c.overrideMode,
        fee: c.overrideFeeAmount > 0 ? String(c.overrideFeeAmount) : '',
      },
    ]),
  );
}

// Owns the Custom-override toggle, form state, and save/revert mutations for
// the fee-recovery customer overrides table (desktop table + mobile cards).
export function useCustomerFeeOverrides(
  customers: FeeRecoveryScreenCustomerDto[],
  globalFeeLabel: string,
) {
  const updateOverride = useUpdateCustomerFeeRecoveryOverride();
  const deleteOverride = useDeleteCustomerFeeRecoveryOverride();

  const [customToggles, setCustomToggles] = useState<Record<number, boolean>>(
    {},
  );
  const [overrideForms, setOverrideForms] = useState<
    Record<number, OverrideFormState>
  >({});
  // Baseline used to detect unsaved changes; only updated when a row is saved.
  const [savedOverrideForms, setSavedOverrideForms] = useState<
    Record<number, OverrideFormState>
  >({});
  const [revertTarget, setRevertTarget] =
    useState<FeeRecoveryScreenCustomerDto | null>(null);

  // Sync local per-row state whenever the customer list loads or refetches
  // (e.g. after a save/revert round-trips to the server).
  useEffect(() => {
    setCustomToggles(
      Object.fromEntries(customers.map((c) => [c.customerId, c.hasOverride])),
    );
    const forms = buildOverrideForms(customers);
    setOverrideForms(forms);
    setSavedOverrideForms(forms);
  }, [customers]);

  const isOn = (customerId: number) => customToggles[customerId] ?? false;

  const handleToggle = (
    row: FeeRecoveryScreenCustomerDto,
    checked: boolean,
  ) => {
    if (!checked) {
      setRevertTarget(row);
      return;
    }
    setCustomToggles((prev) => ({ ...prev, [row.customerId]: true }));
  };

  const handleConfirmRevert = () => {
    if (!revertTarget) return;
    const customerId = revertTarget.customerId;
    setRevertTarget(null);
    deleteOverride.mutate(customerId, {
      onSuccess: () => {
        setCustomToggles((prev) => ({ ...prev, [customerId]: false }));
      },
    });
  };

  const handleFormChange = (
    customerId: number,
    field: keyof OverrideFormState,
    value: string,
  ) => {
    setOverrideForms((prev) => ({
      ...prev,
      [customerId]: { ...prev[customerId], [field]: value },
    }));
  };

  const handleSave = (customerId: number) => {
    const form = overrideForms[customerId];
    if (!form) return;
    const original = customers.find((c) => c.customerId === customerId);

    updateOverride.mutate(
      {
        customerId,
        data: {
          recoveryMode: form.overrideRule,
          feeAmount:
            form.overrideRule === RECOVERY_MODE.RECOVER
              ? Number.parseFloat(form.fee) || 0
              : 0,
          invoiceLineDescription:
            original?.overrideInvoiceLineDescription || globalFeeLabel,
        },
      },
      {
        onSuccess: () => {
          setSavedOverrideForms((prev) => ({ ...prev, [customerId]: form }));
        },
      },
    );
  };

  const isRowDirty = (customerId: number) => {
    const form = overrideForms[customerId];
    const saved = savedOverrideForms[customerId];
    if (!form || !saved) return false;
    if (form.overrideRule !== saved.overrideRule) return true;
    return (
      form.overrideRule === RECOVERY_MODE.RECOVER && form.fee !== saved.fee
    );
  };

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
