import { describe, expect, test } from 'vitest';

function failedOnlyFromSearch(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get('failedOnly') === 'true';
}

function paymentsTabFromSearch(search: string): string {
  const tab = new URLSearchParams(search).get('tab');
  if (tab === 'cash-payments' || tab === 'cash') return 'cash-payments';
  if (tab === 'internal-transfers' || tab === 'transfers') {
    return 'internal-transfers';
  }
  return 'invoices';
}

describe('payments query wiring', () => {
  test('failedOnly is a simple toggle from the query string', () => {
    expect(failedOnlyFromSearch('failedOnly=true')).toBe(true);
    expect(failedOnlyFromSearch('tab=invoices')).toBe(false);
    expect(failedOnlyFromSearch('failedOnly=false')).toBe(false);
  });

  test('old invoices route equivalent defaults to the Invoices sub-tab', () => {
    expect(paymentsTabFromSearch('tab=invoices')).toBe('invoices');
    expect(paymentsTabFromSearch('')).toBe('invoices');
    expect(paymentsTabFromSearch('tab=cash-payments')).toBe('cash-payments');
    expect(paymentsTabFromSearch('tab=internal-transfers')).toBe(
      'internal-transfers',
    );
  });
});
