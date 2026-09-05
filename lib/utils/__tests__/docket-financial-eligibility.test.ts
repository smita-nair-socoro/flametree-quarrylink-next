import { describe, expect, it } from 'vitest';
import { DocketDTO } from '@/lib/types/docket';
import { DOCKET_STATUS } from '@/lib/types/docket-enums';
import {
  isCashSaleEligible,
  isInvoiceEligible,
} from '@/lib/utils/docket-financial-eligibility';

function docket(
  overrides: Partial<DocketDTO> & {
    jobItemType?: 'COLLECTION' | 'DELIVERY';
    jobType?: string;
  } = {},
): DocketDTO {
  const { jobItemType = 'DELIVERY', jobType, ...rest } = overrides;
  return {
    id: 1,
    docketNumber: 'DD-1',
    docketStatus: DOCKET_STATUS.DELIVERED,
    job: jobType ? ({ jobType } as DocketDTO['job']) : undefined,
    jobItem: {
      jobItemType,
    } as DocketDTO['jobItem'],
    ...rest,
  } as DocketDTO;
}

describe('isCashSaleEligible', () => {
  it('allows only collected collection dockets', () => {
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.COLLECTED,
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(true);
  });

  it('never allows delivery dockets, including Delivered', () => {
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobItemType: 'DELIVERY',
        }),
      ),
    ).toBe(false);
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.COLLECTED,
          jobItemType: 'DELIVERY',
        }),
      ),
    ).toBe(false);
  });

  it('blocks Ready collection dockets and terminal financial statuses', () => {
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.READY,
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(false);
    for (const status of [
      DOCKET_STATUS.INVOICED,
      DOCKET_STATUS.CASH_SALE,
      DOCKET_STATUS.CANCELLED,
      DOCKET_STATUS.VOIDED,
    ]) {
      expect(
        isCashSaleEligible(
          docket({ docketStatus: status, jobItemType: 'COLLECTION' }),
        ),
      ).toBe(false);
    }
  });

  it('blocks collection dockets that are only delivered and internal transfers', () => {
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(false);
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.COLLECTED,
          jobType: 'INTERNAL_TRANSFER',
          docketNumber: 'IT-1',
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(false);
  });
});

describe('isInvoiceEligible', () => {
  it('allows collected collection and delivered delivery dockets', () => {
    expect(
      isInvoiceEligible(
        docket({
          docketStatus: DOCKET_STATUS.COLLECTED,
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(true);
    expect(
      isInvoiceEligible(
        docket({
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobItemType: 'DELIVERY',
        }),
      ),
    ).toBe(true);
  });

  it('keeps invoice available when cash sale is not (delivery)', () => {
    const delivered = docket({
      docketStatus: DOCKET_STATUS.DELIVERED,
      jobItemType: 'DELIVERY',
    });
    expect(isInvoiceEligible(delivered)).toBe(true);
    expect(isCashSaleEligible(delivered)).toBe(false);
  });

  it('blocks internal transfers', () => {
    expect(
      isInvoiceEligible(
        docket({
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobType: 'INTERNAL_TRANSFER',
          docketNumber: 'IT-1',
        }),
      ),
    ).toBe(false);
  });
});
