import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CashSaleConfirmDialog } from '@/components/cash-sale-confirm-dialog';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';

vi.mock('@/lib/api/payments', () => ({
  useCreateCashSale: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/lib/utils/tenant-config-helper', () => ({
  useTenantCurrencyTax: () => ({ currencySymbol: '$' }),
  getCurrencyLocale: () => 'en-AU',
}));

function docket(overrides: Partial<DocketDTO> = {}): DocketDTO {
  return {
    id: 1,
    docketNumber: 'CD-26-00025',
    docketStatus: DOCKET_STATUS.COLLECTED,
    totalInvoiceAmount: 16400,
    jobItem: { jobItemType: 'COLLECTION' } as DocketDTO['jobItem'],
    ...overrides,
  } as DocketDTO;
}

describe('CashSaleConfirmDialog', () => {
  it('shows the current docket amount, not a stale previous selection', () => {
    const first = docket({
      id: 25,
      docketNumber: 'CD-26-00025',
      totalInvoiceAmount: 16400,
    });
    const second = docket({
      id: 27,
      docketNumber: 'CD-26-00027',
      totalInvoiceAmount: 23400,
    });

    const { rerender } = render(
      <CashSaleConfirmDialog
        open
        onOpenChange={() => undefined}
        dockets={[first]}
      />,
    );

    expect(screen.getByText(/CD-26-00025/)).toBeInTheDocument();
    expect(screen.getAllByText('$164.00')).toHaveLength(2);

    rerender(
      <CashSaleConfirmDialog
        key="second"
        open
        onOpenChange={() => undefined}
        dockets={[second]}
      />,
    );

    expect(screen.getByText(/CD-26-00027/)).toBeInTheDocument();
    expect(screen.getAllByText('$234.00')).toHaveLength(2);
    expect(screen.queryByText(/CD-26-00025/)).not.toBeInTheDocument();
    expect(screen.queryByText('$164.00')).not.toBeInTheDocument();
  });

  it('does not show 0 dockets / $0.00 while loading', () => {
    render(
      <CashSaleConfirmDialog
        open
        onOpenChange={() => undefined}
        dockets={[]}
        loading
      />,
    );

    expect(screen.getByText(/Loading docket details/i)).toBeInTheDocument();
    expect(screen.queryByText(/0 docket/i)).not.toBeInTheDocument();
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument();
  });
});
