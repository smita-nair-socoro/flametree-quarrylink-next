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
  it('allows collected collection dockets and delivered delivery dockets', () => {
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.COLLECTED,
          jobItemType: 'COLLECTION',
        }),
      ),
    ).toBe(true);
    expect(
      isCashSaleEligible(
        docket({
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobItemType: 'DELIVERY',
        }),
      ),
    ).toBe(true);
  });

  it('blocks invoiced, cash-sold, cancelled and voided dockets', () => {
    for (const status of [
      DOCKET_STATUS.INVOICED,
      DOCKET_STATUS.CASH_SALE,
      DOCKET_STATUS.CANCELLED,
      DOCKET_STATUS.VOIDED,
    ]) {
      expect(
        isCashSaleEligible(docket({ docketStatus: status, jobItemType: 'DELIVERY' })),
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
          docketStatus: DOCKET_STATUS.DELIVERED,
          jobType: 'INTERNAL_TRANSFER',
          docketNumber: 'IT-1',
        }),
      ),
    ).toBe(false);
  });

  it('keeps invoice eligibility aligned for slice 1', () => {
    const collected = docket({
      docketStatus: DOCKET_STATUS.COLLECTED,
      jobItemType: 'COLLECTION',
    });
    expect(isInvoiceEligible(collected)).toBe(isCashSaleEligible(collected));
  });
});
