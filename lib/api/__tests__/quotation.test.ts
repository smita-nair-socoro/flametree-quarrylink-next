import { describe, expect, it } from 'vitest';
import {
  toQuoteApiFilterParams,
  toQuoteApiSortParams,
} from '../quotation';

describe('quotation API helpers', () => {
  it('maps status, customer, and account manager facet filters', () => {
    expect(
      toQuoteApiFilterParams([
        { id: 'status', value: ['DRAFT', 'PENDING'] },
        { id: 'customer_name', value: ['12', '34'] },
        { id: 'account_manager', value: ['am-sub'] },
      ]),
    ).toEqual({
      statuses: ['DRAFT', 'PENDING'],
      customerIds: [12, 34],
      accountManagerSubs: ['am-sub'],
    });
  });

  it('maps quote table columns to backend sort fields', () => {
    expect(toQuoteApiSortParams([{ id: 'quote_number', desc: false }])).toEqual({
      sortBy: 'quoteNumber',
      sortOrder: 'asc',
    });
    expect(toQuoteApiSortParams([{ id: 'created_at', desc: true }])).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(toQuoteApiSortParams([{ id: 'status', desc: false }])).toEqual({
      sortBy: 'quoteStatus',
      sortOrder: 'asc',
    });
  });

  it('defaults to createdAt desc when no sorting is provided', () => {
    expect(toQuoteApiSortParams([])).toEqual({
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });
});
