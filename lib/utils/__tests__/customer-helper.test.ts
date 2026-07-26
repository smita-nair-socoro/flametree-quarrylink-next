import { describe, expect, test } from 'vitest';
import { formatCustomerStatus } from '../customer-helper';
import { CUSTOMER_STATUS } from '../../types/customer-enums';

describe('formatCustomerStatus', () => {
  test('formats ACTIVE status', () => {
    expect(formatCustomerStatus(CUSTOMER_STATUS.ACTIVE)).toBe('ACTIVE');
    expect(formatCustomerStatus('ACTIVE')).toBe('ACTIVE');
  });

  test('formats ARCHIVED status', () => {
    expect(formatCustomerStatus(CUSTOMER_STATUS.ARCHIVED)).toBe('ARCHIVED');
    expect(formatCustomerStatus('ARCHIVED')).toBe('ARCHIVED');
  });

  test('replaces underscores with spaces for unknown statuses', () => {
    expect(formatCustomerStatus('PENDING_REVIEW')).toBe('PENDING REVIEW');
  });
});
