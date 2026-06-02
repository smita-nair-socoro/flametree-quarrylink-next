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

export function getAvatarColor(name: string): { bg: string; text: string } {
  const hash = (name || '')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function isUserSuperAdmin(groups: string[] | undefined): boolean {
  if (!groups?.length) return false;
  const g = groups.join(',').toLowerCase();
  return g.includes('super_admin') || g.includes('superadmin');
}

/** Display label: 'Super Admin' | 'Admin' | 'Driver' | 'User' */
export function getRoleLabel(groups: string[] | undefined): string {
  if (!groups || !Array.isArray(groups) || groups.length === 0) return 'User';
  const g = groups.join(',').toLowerCase();
  if (g.includes('super_admin') || g.includes('superadmin')) return 'Super Admin';
  if (g.includes('driver')) return 'Driver';
  if (g.includes('admin')) return 'Admin';
  return 'User';
}

/** Form value string: 'SUPERADMIN' | 'ADMIN' | 'USER' */
export function getRoleValueFromGroups(groups: string[] | undefined): string {
  if (!groups || !Array.isArray(groups) || groups.length === 0) return '';
  const g = groups.join(',').toLowerCase();
  if (g.includes('super_admin') || g.includes('superadmin')) return 'SUPERADMIN';
  if (g.includes('admin')) return 'ADMIN';
  return 'USER';
}

/** Role enum value for pending-invitation logic */
export function getHighestRole(groups: string[] | undefined): Role {
  if (!groups || !Array.isArray(groups)) return Role.USER;
  const g = groups.join(',').toLowerCase();
  if (g.includes('super_admin') || g.includes('superadmin')) return Role.SUPERADMIN;
  if (g.includes('admin')) return Role.USER; // Map admin to USER for now
  return Role.USER;
}

export function getInitials(name: string | undefined): string {
  if (!name?.trim()) return '?';
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '?'
  );
}
