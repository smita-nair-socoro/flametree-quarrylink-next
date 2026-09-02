import { describe, expect, it } from 'vitest';
import { toJobApiFilterParams, toJobApiSortParams } from '../job';

describe('job API helpers', () => {
  it('maps quarry and PO facet filters', () => {
    expect(
      toJobApiFilterParams([
        { id: 'quarrySupplierName', value: ['12', '34'] },
        { id: 'poNumber', value: ['PO-1', 'po-2'] },
        { id: 'status', value: ['ACTIVE'] },
      ]),
    ).toEqual({
      statuses: ['ACTIVE'],
      customerIds: undefined,
      accountManagerSubs: undefined,
      quarrySupplierIds: [12, 34],
      poNumbers: ['PO-1', 'po-2'],
    });
  });

  it('maps quarry and PO sort columns', () => {
    expect(toJobApiSortParams([{ id: 'quarrySupplierName', desc: false }])).toEqual({
      sortBy: 'quarrySupplierName',
      sortOrder: 'asc',
    });
    expect(toJobApiSortParams([{ id: 'poNumber', desc: true }])).toEqual({
      sortBy: 'poNumber',
      sortOrder: 'desc',
    });
  });
});
