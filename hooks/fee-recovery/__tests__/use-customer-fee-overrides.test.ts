import { describe, expect, test, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCustomerFeeOverrides } from '../use-customer-fee-overrides';
import type { CustomerFeeRecoverySettingsDto } from '@/lib/types/fee-recovery';
import { EFFECTIVE_SOURCE, RECOVERY_MODE } from '@/lib/types/fee-recovery-enums';

const updateMutate = vi.fn();
const deleteMutate = vi.fn();

vi.mock('@/lib/api/fee-recovery', () => ({
  useUpdateCustomerFeeRecoveryOverride: () => ({
    mutate: updateMutate,
    isPending: false,
  }),
  useDeleteCustomerFeeRecoveryOverride: () => ({
    mutate: deleteMutate,
    isPending: false,
  }),
}));

function makeCustomer(
  overrides: Partial<CustomerFeeRecoverySettingsDto> = {},
): CustomerFeeRecoverySettingsDto {
  return {
    customerId: 1,
    customerName: 'Acme Pty Ltd',
    overrideMode: RECOVERY_MODE.RECOVER,
    overrideFeeAmount: 2.5,
    overrideInvoiceLineDescription: 'Platform Fee',
    effectiveMode: RECOVERY_MODE.RECOVER,
    effectiveFeeAmount: 2.5,
    effectiveInvoiceLineDescription: 'Platform Fee',
    effectiveSource: EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE,
    ...overrides,
  };
}

// The hook's sync effect keys off the `customers` array reference, so tests
// must reuse one stable array across re-renders rather than passing a fresh
// `[customer]` literal from inside the renderHook callback — a fresh array
// on every render would retrigger the effect and loop forever.
function renderOverrides(
  customers: CustomerFeeRecoverySettingsDto[],
  globalFeeLabel = 'Digital Platform Fee',
) {
  return renderHook(
    ({ customers, globalFeeLabel }) =>
      useCustomerFeeOverrides(customers, globalFeeLabel),
    { initialProps: { customers, globalFeeLabel } },
  );
}

describe('useCustomerFeeOverrides', () => {
  beforeEach(() => {
    updateMutate.mockReset();
    deleteMutate.mockReset();
  });

  test('a customer with a saved override syncs isOn=true and pre-fills the draft form', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    expect(result.current.isOn(1)).toBe(true);
    expect(result.current.overrideForms[1]).toEqual({
      overrideRule: RECOVERY_MODE.RECOVER,
      fee: '2.5',
      label: 'Platform Fee',
    });
  });

  test('a customer following the global default syncs isOn=false', () => {
    const customer = makeCustomer({
      effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
    });
    const { result } = renderOverrides([customer]);

    expect(result.current.isOn(1)).toBe(false);
  });

  test('an ABSORB override renders fee as blank, not "0", so it reads as unset', () => {
    const customer = makeCustomer({
      overrideMode: RECOVERY_MODE.ABSORB,
      overrideFeeAmount: 0,
    });
    const { result } = renderOverrides([customer]);

    expect(result.current.overrideForms[1].fee).toBe('');
  });

  test('a genuine $0 RECOVER fee still renders as "0", distinguishable from unset', () => {
    const customer = makeCustomer({
      overrideMode: RECOVERY_MODE.RECOVER,
      overrideFeeAmount: 0,
    });
    const { result } = renderOverrides([customer]);

    expect(result.current.overrideForms[1].fee).toBe('0');
  });

  test('turning the toggle off when nothing is saved on the server yet reverts locally without a confirmation or delete call', () => {
    const customer = makeCustomer({
      effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
    });
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleToggle(customer, true));
    expect(result.current.isOn(1)).toBe(true);

    act(() => result.current.handleToggle(customer, false));
    expect(result.current.isOn(1)).toBe(false);
    expect(result.current.revertTarget).toBeNull();
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  test('turning the toggle off when an override is already saved on the server asks for confirmation instead of reverting immediately', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleToggle(customer, false));

    expect(result.current.revertTarget).toEqual(customer);
    expect(result.current.isOn(1)).toBe(true);
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  test('confirming a revert deletes the override and, on success, turns the row off', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleToggle(customer, false));
    act(() => result.current.handleConfirmRevert());

    expect(deleteMutate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(result.current.revertTarget).toBeNull();

    // Simulate the mutation's onSuccess callback firing.
    const onSuccess = deleteMutate.mock.calls[0][1].onSuccess;
    act(() => onSuccess());

    expect(result.current.isOn(1)).toBe(false);
  });

  test('clearRevertTarget dismisses the confirmation without deleting', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleToggle(customer, false));
    act(() => result.current.clearRevertTarget());

    expect(result.current.revertTarget).toBeNull();
    expect(result.current.isOn(1)).toBe(true);
    expect(deleteMutate).not.toHaveBeenCalled();
  });

  test('handleFormChange updates a single draft field without touching the others', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleFormChange(1, 'fee', '9.99'));

    expect(result.current.overrideForms[1]).toEqual({
      overrideRule: RECOVERY_MODE.RECOVER,
      fee: '9.99',
      label: 'Platform Fee',
    });
  });

  test('handleSave sends feeAmount 0 and ignores the fee field when the draft mode is ABSORB', () => {
    const customer = makeCustomer({
      overrideMode: RECOVERY_MODE.ABSORB,
      overrideFeeAmount: 0,
    });
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleSave(1));

    expect(updateMutate).toHaveBeenCalledWith(
      {
        customerId: 1,
        data: {
          recoveryMode: RECOVERY_MODE.ABSORB,
          feeAmount: 0,
          invoiceLineDescription: 'Platform Fee',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  test('handleSave parses the fee field and falls back to the global fee label when the row label is blank', () => {
    const customer = makeCustomer({ overrideInvoiceLineDescription: '' });
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleFormChange(1, 'fee', '4.20'));
    act(() => result.current.handleFormChange(1, 'label', '   '));
    act(() => result.current.handleSave(1));

    expect(updateMutate).toHaveBeenCalledWith(
      {
        customerId: 1,
        data: {
          recoveryMode: RECOVERY_MODE.RECOVER,
          feeAmount: 4.2,
          invoiceLineDescription: 'Digital Platform Fee',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  test('handleSave falls back to a 0 fee when the fee field is not a valid number', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleFormChange(1, 'fee', 'not-a-number'));
    act(() => result.current.handleSave(1));

    expect(updateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ feeAmount: 0 }) }),
      expect.anything(),
    );
  });

  test('on save success, the draft becomes the new saved baseline and the row is no longer touched', () => {
    const customer = makeCustomer();
    const { result } = renderOverrides([customer]);

    act(() => result.current.handleFormChange(1, 'fee', '9.99'));
    act(() => result.current.handleSave(1));

    expect(result.current.isRowDirty(1)).toBe(true);

    const onSuccess = updateMutate.mock.calls[0][1].onSuccess;
    act(() => onSuccess());

    expect(result.current.isRowDirty(1)).toBe(false);
    expect(result.current.overrideForms[1].fee).toBe('9.99');
  });

  test('handleSave is a no-op when the row has no local state yet', () => {
    const { result } = renderOverrides([]);

    act(() => result.current.handleSave(999));

    expect(updateMutate).not.toHaveBeenCalled();
  });

  describe('isRowDirty', () => {
    test('is false for an unedited row', () => {
      const customer = makeCustomer();
      const { result } = renderOverrides([customer]);

      expect(result.current.isRowDirty(1)).toBe(false);
    });

    test('is true when the rule changes, even before touching fee/label', () => {
      const customer = makeCustomer({ overrideMode: RECOVERY_MODE.ABSORB });
      const { result } = renderOverrides([customer]);

      act(() =>
        result.current.handleFormChange(1, 'overrideRule', RECOVERY_MODE.RECOVER),
      );

      expect(result.current.isRowDirty(1)).toBe(true);
    });

    test('ignores fee/label edits while the draft mode is ABSORB (those fields are hidden)', () => {
      const customer = makeCustomer({
        overrideMode: RECOVERY_MODE.ABSORB,
        overrideFeeAmount: 0,
      });
      const { result } = renderOverrides([customer]);

      act(() => result.current.handleFormChange(1, 'fee', '100'));

      expect(result.current.isRowDirty(1)).toBe(false);
    });

    test('is true when fee or label changes while the draft mode is RECOVER', () => {
      const customer = makeCustomer();
      const { result } = renderOverrides([customer]);

      act(() => result.current.handleFormChange(1, 'fee', '9.99'));

      expect(result.current.isRowDirty(1)).toBe(true);
    });

    test('is false for an unknown row', () => {
      const { result } = renderOverrides([]);

      expect(result.current.isRowDirty(999)).toBe(false);
    });
  });

  test('a refetch does not clobber a row with an in-progress local edit (isTouched rows are frozen)', () => {
    const customer = makeCustomer();
    const { result, rerender } = renderHook(
      ({ customers }: { customers: CustomerFeeRecoverySettingsDto[] }) =>
        useCustomerFeeOverrides(customers, 'Digital Platform Fee'),
      { initialProps: { customers: [customer] } },
    );

    act(() => result.current.handleFormChange(1, 'fee', '9.99'));

    // Server refetch reports the old, pre-edit value.
    rerender({ customers: [makeCustomer()] });

    expect(result.current.overrideForms[1].fee).toBe('9.99');
  });

  test('a refetch resyncs an untouched row to the latest server values', () => {
    const customer = makeCustomer();
    const { result, rerender } = renderHook(
      ({ customers }: { customers: CustomerFeeRecoverySettingsDto[] }) =>
        useCustomerFeeOverrides(customers, 'Digital Platform Fee'),
      { initialProps: { customers: [customer] } },
    );

    rerender({ customers: [makeCustomer({ overrideFeeAmount: 7.5 })] });

    expect(result.current.overrideForms[1].fee).toBe('7.5');
  });
});
