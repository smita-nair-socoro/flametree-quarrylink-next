import { describe, expect, test } from 'vitest';
import { isInternalHaulier } from '../haulier-helper';

describe('isInternalHaulier', () => {
  test('returns true when emails match case-insensitively', () => {
    expect(isInternalHaulier('Admin@Tenant.com', 'admin@tenant.com')).toBe(
      true,
    );
  });

  test('returns false when emails differ', () => {
    expect(isInternalHaulier('haulier@other.com', 'admin@tenant.com')).toBe(
      false,
    );
  });

  test('returns false when either email is missing', () => {
    expect(isInternalHaulier(undefined, 'admin@tenant.com')).toBe(false);
    expect(isInternalHaulier('admin@tenant.com', null)).toBe(false);
    expect(isInternalHaulier(null, null)).toBe(false);
  });
});
