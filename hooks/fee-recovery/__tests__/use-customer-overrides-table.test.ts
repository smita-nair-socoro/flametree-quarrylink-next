import { describe, expect, test, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCustomerOverridesTable } from '../use-customer-overrides-table';
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
  FeeRecoveryScreenQueryOptions: (params: unknown) => ({
    queryKey: ['fee-recovery', 'screen', params],
    queryFn: () => Promise.resolve(undefined),
  }),
}));

let queryState: {
  data: unknown;
  isLoading: boolean;
  isFetching: boolean;
} = {
  data: undefined,
  isLoading: false,
  isFetching: false,
};

const useQueryMock = vi.fn((...args: [options?: unknown]) => {
  void args;
  return queryState;
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: (options?: unknown) => useQueryMock(options),
  };
});

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

function setQueryData(content: CustomerFeeRecoverySettingsDto[], rest: object = {}) {
  queryState = {
    data: {
      content,
      totalElements: content.length,
      totalPages: 1,
      invoiceLineDescription: 'Digital Platform Fee',
      ...rest,
    },
    isLoading: false,
    isFetching: false,
  };
}

describe('useCustomerOverridesTable', () => {
  beforeEach(() => {
    updateMutate.mockReset();
    deleteMutate.mockReset();
    useQueryMock.mockClear();
    queryState = { data: undefined, isLoading: false, isFetching: false };
  });

  test('defaults rows/totals to empty when the query has no data yet', () => {
    const { result } = renderHook(() =>
      useCustomerOverridesTable({
        globalMode: RECOVERY_MODE.RECOVER,
        globalAmount: '2.5',
      }),
    );

    expect(result.current.rows).toEqual([]);
    expect(result.current.totalElements).toBe(0);
    expect(result.current.totalPages).toBe(0);
  });

  test('exposes rows/totals from the query result', () => {
    setQueryData([makeCustomer()], { totalElements: 42, totalPages: 5 });
    const { result } = renderHook(() =>
      useCustomerOverridesTable({
        globalMode: RECOVERY_MODE.RECOVER,
        globalAmount: '2.5',
      }),
    );

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.totalElements).toBe(42);
    expect(result.current.totalPages).toBe(5);
  });

  describe('getEffectiveStatus', () => {
    test('returns the global mode for a customer without an override', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.RECOVER,
          globalAmount: '2.5',
        }),
      );

      expect(result.current.getEffectiveStatus(customer)).toBe(
        RECOVERY_MODE.RECOVER,
      );
    });

    test('returns the row draft mode once the custom toggle is on', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.RECOVER,
          globalAmount: '2.5',
        }),
      );

      act(() => result.current.handleToggle(customer, true));
      act(() =>
        result.current.handleFormChange(1, 'overrideRule', RECOVERY_MODE.ABSORB),
      );

      expect(result.current.getEffectiveStatus(customer)).toBe(
        RECOVERY_MODE.ABSORB,
      );
    });

    test('previews the global default while custom is on but no rule has been picked yet', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
        // Simulates a customer who never had an override saved server-side,
        // so buildOverrideForm has no prior overrideMode to seed the draft with.
        overrideMode: '' as RECOVERY_MODE,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.ABSORB,
          globalAmount: '2.5',
        }),
      );

      act(() => result.current.handleToggle(customer, true));

      expect(result.current.getEffectiveStatus(customer)).toBe(
        RECOVERY_MODE.ABSORB,
      );
    });
  });

  describe('getEffectiveFee', () => {
    test('is 0 when the effective mode is ABSORB', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.ABSORB,
          globalAmount: '2.5',
        }),
      );

      expect(result.current.getEffectiveFee(customer)).toBe(0);
    });

    test('uses the global amount for a customer without an override', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.RECOVER,
          globalAmount: '3.75',
        }),
      );

      expect(result.current.getEffectiveFee(customer)).toBe(3.75);
    });

    test('uses the row draft fee once custom is on and RECOVER is selected', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.RECOVER,
          globalAmount: '3.75',
        }),
      );

      act(() => result.current.handleToggle(customer, true));
      act(() =>
        result.current.handleFormChange(1, 'overrideRule', RECOVERY_MODE.RECOVER),
      );
      act(() => result.current.handleFormChange(1, 'fee', '9.5'));

      expect(result.current.getEffectiveFee(customer)).toBe(9.5);
    });

    test('falls back to 0 when the effective fee amount cannot be parsed', () => {
      const customer = makeCustomer({
        effectiveSource: EFFECTIVE_SOURCE.GLOBAL_DEFAULT,
      });
      setQueryData([customer]);
      const { result } = renderHook(() =>
        useCustomerOverridesTable({
          globalMode: RECOVERY_MODE.RECOVER,
          globalAmount: 'not-a-number',
        }),
      );

      expect(result.current.getEffectiveFee(customer)).toBe(0);
    });
  });

  test('changing the rule or status filter resets the page back to 0', () => {
    setQueryData([]);
    const { result } = renderHook(() =>
      useCustomerOverridesTable({
        globalMode: RECOVERY_MODE.RECOVER,
        globalAmount: '2.5',
      }),
    );

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    act(() => result.current.setRuleFilter(EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE));
    expect(result.current.page).toBe(0);

    act(() => result.current.setPage(2));
    act(() => result.current.setStatusFilter(RECOVERY_MODE.ABSORB));
    expect(result.current.page).toBe(0);
  });

  test('passes search/filter/pagination state through to the query options', () => {
    setQueryData([]);
    const { result } = renderHook(() =>
      useCustomerOverridesTable({
        globalMode: RECOVERY_MODE.RECOVER,
        globalAmount: '2.5',
      }),
    );

    act(() => result.current.setRuleFilter(EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE));
    act(() => result.current.setStatusFilter(RECOVERY_MODE.ABSORB));
    act(() => result.current.setPageSize(25));

    const lastCallArgs = useQueryMock.mock.calls.at(-1)?.[0] as {
      queryKey: unknown[];
    };
    expect(lastCallArgs.queryKey).toEqual([
      'fee-recovery',
      'screen',
      {
        page: 0,
        size: 25,
        search: undefined,
        effectiveSource: EFFECTIVE_SOURCE.CUSTOMER_OVERRIDE,
        recoveryMode: RECOVERY_MODE.ABSORB,
      },
    ]);
  });
});
