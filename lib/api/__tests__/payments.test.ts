import { describe, expect, it } from 'vitest';
import {
  toApiPage,
  toPaymentsInvoiceFilterParams,
  withApiPage,
} from '../payments';

describe('payments API page conversion', () => {
  it('converts 0-based UI pageIndex to 1-based API page', () => {
    expect(toApiPage(0)).toBe(1);
    expect(toApiPage(1)).toBe(2);
    expect(toApiPage(9)).toBe(10);
  });

  it('withApiPage leaves other params and maps page only', () => {
    expect(withApiPage({ page: 0, pageSize: 10, search: 'abc' })).toEqual({
      page: 1,
      pageSize: 10,
      search: 'abc',
    });
    expect(withApiPage({ pageSize: 25 })).toEqual({ pageSize: 25 });
    expect(withApiPage()).toEqual({});
  });
});

describe('payments invoice API helpers', () => {
  it('maps Customer and Job facet filters to ids', () => {
    expect(
      toPaymentsInvoiceFilterParams([
        { id: 'customerName', value: ['12', '34'] },
        { id: 'jobNumber', value: ['9'] },
      ]),
    ).toEqual({
      customerIds: [12, 34],
      jobIds: [9],
    });
  });

  it('omits empty facet filters', () => {
    expect(toPaymentsInvoiceFilterParams([])).toEqual({
      customerIds: undefined,
      jobIds: undefined,
    });
  });
});
