import { describe, expect, test } from 'vitest';
import {
  getAvatarColor,
  isUserSuperAdmin,
  getRoleLabel,
  getRoleValueFromGroups,
  getHighestRole,
  getInitials,
} from '../user-helper';
import { Role } from '@/lib/types/user-enums';

const AVATAR_PALETTE = [
  { bg: '#DBEAFE', text: '#2563EB' },
  { bg: '#D1FAE5', text: '#059669' },
  { bg: '#EDE9FE', text: '#7C3AED' },
  { bg: '#FEE2E2', text: '#DC2626' },
  { bg: '#FEF3C7', text: '#D97706' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#CCFBF1', text: '#0D9488' },
];

describe('getAvatarColor', () => {
  test('returns a color deterministically for the same name', () => {
    expect(getAvatarColor('Jane Doe')).toEqual(getAvatarColor('Jane Doe'));
  });

  test('returns a color from the fixed palette', () => {
    expect(AVATAR_PALETTE).toContainEqual(getAvatarColor('Jane Doe'));
  });

  test('handles an empty/undefined name without throwing', () => {
    expect(() => getAvatarColor('')).not.toThrow();
    expect(AVATAR_PALETTE).toContainEqual(
      getAvatarColor(undefined as unknown as string),
    );
  });
});

describe('isUserSuperAdmin', () => {
  test('returns true when groups include super_admin variants', () => {
    expect(isUserSuperAdmin(['super_admin'])).toBe(true);
    expect(isUserSuperAdmin(['SUPERADMIN'])).toBe(true);
  });

  test('returns false for empty or non-admin groups', () => {
    expect(isUserSuperAdmin(undefined)).toBe(false);
    expect(isUserSuperAdmin([])).toBe(false);
    expect(isUserSuperAdmin(['user'])).toBe(false);
  });

  test('returns true when role is SUPER_ADMIN even if groups do not include super_admin', () => {
    expect(isUserSuperAdmin({ role: 'SUPER_ADMIN', groups: ['admin'] })).toBe(true);
  });

  test('returns false when role is ADMIN and groups do not include super_admin', () => {
    expect(isUserSuperAdmin({ role: 'ADMIN', groups: ['admin'] })).toBe(false);
  });
});

describe('getRoleLabel', () => {
  test('returns Super Admin for super admin groups', () => {
    expect(getRoleLabel(['super_admin'])).toBe('Super Admin');
  });

  test('returns Driver when groups include driver', () => {
    expect(getRoleLabel(['driver'])).toBe('Driver');
  });

  test('returns Admin when groups include admin (not super)', () => {
    expect(getRoleLabel(['admin'])).toBe('Admin');
  });

  test('defaults to User for empty/other groups', () => {
    expect(getRoleLabel(undefined)).toBe('User');
    expect(getRoleLabel([])).toBe('User');
    expect(getRoleLabel(['viewer'])).toBe('User');
  });
});

describe('getRoleValueFromGroups', () => {
  test('returns SUPERADMIN for super admin groups', () => {
    expect(getRoleValueFromGroups(['superadmin'])).toBe('SUPERADMIN');
  });

  test('returns ADMIN for admin groups', () => {
    expect(getRoleValueFromGroups(['admin'])).toBe('ADMIN');
  });

  test('returns USER for other non-empty groups', () => {
    expect(getRoleValueFromGroups(['driver'])).toBe('USER');
  });

  test('returns USER for empty/missing groups', () => {
    expect(getRoleValueFromGroups(undefined)).toBe('USER');
    expect(getRoleValueFromGroups([])).toBe('USER');
  });
});

describe('getHighestRole', () => {
  test('returns SUPERADMIN role enum for super admin groups', () => {
    expect(getHighestRole(['super_admin'])).toBe(Role.SUPERADMIN);
  });

  test('maps admin groups to ADMIN role', () => {
    expect(getHighestRole(['admin'])).toBe(Role.ADMIN);
  });

  test('defaults to USER role for missing/other groups', () => {
    expect(getHighestRole(undefined)).toBe(Role.USER);
    expect(getHighestRole(['driver'])).toBe(Role.USER);
  });
});

describe('getInitials', () => {
  test('returns first letters of first two words for multi-word names', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
  });

  test('splits CamelCase single words', () => {
    expect(getInitials('JayChoi')).toBe('JC');
  });

  test('falls back to email local-part split when name is a single plain word', () => {
    expect(getInitials('jane', 'jane.doe@example.com')).toBe('JD');
  });

  test('falls back to first two characters when nothing else applies', () => {
    expect(getInitials('jane')).toBe('JA');
  });

  test('returns ? for missing/blank names', () => {
    expect(getInitials(undefined)).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });
});
