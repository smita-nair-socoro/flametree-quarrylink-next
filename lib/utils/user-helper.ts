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

export function isUserSuperAdmin(
  groupsOrSource?: string[] | { role?: string | null; groups?: string[] | null } | null,
  role?: string | null,
): boolean {
  if (groupsOrSource && !Array.isArray(groupsOrSource)) {
    return resolveBackendRole(groupsOrSource.role, groupsOrSource.groups) === 'SUPER_ADMIN';
  }
  return resolveBackendRole(role, groupsOrSource ?? undefined) === 'SUPER_ADMIN';
}

/** Canonical backend role from role field and/or groups. */
export function resolveBackendRole(
  role?: string | null,
  groups?: string[] | null,
): string {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER' || role === 'DRIVER') {
    return role;
  }

  if (!groups?.length) return 'USER';
  const g = groups.join(',').toLowerCase();
  if (g.includes('super_admin') || g.includes('superadmin')) return 'SUPER_ADMIN';
  if (g.includes('driver')) return 'DRIVER';
  if (g.includes('admin')) return 'ADMIN';
  return 'USER';
}

/** Display label: 'Super Admin' | 'Admin' | 'Driver' | 'User' */
export function getRoleLabel(
  groupsOrSource?: string[] | { role?: string | null; groups?: string[] | null } | null,
  role?: string | null,
): string {
  const backend = Array.isArray(groupsOrSource) || groupsOrSource == null
    ? resolveBackendRole(role, groupsOrSource ?? undefined)
    : resolveBackendRole(groupsOrSource.role, groupsOrSource.groups);
  switch (backend) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'DRIVER':
      return 'Driver';
    default:
      return 'User';
  }
}

/** Form value string: 'SUPERADMIN' | 'ADMIN' | 'USER' */
export function getRoleValueFromGroups(
  groupsOrSource?: string[] | { role?: string | null; groups?: string[] | null } | null,
  role?: string | null,
): string {
  const backend = Array.isArray(groupsOrSource) || groupsOrSource == null
    ? resolveBackendRole(role, groupsOrSource ?? undefined)
    : resolveBackendRole(groupsOrSource.role, groupsOrSource.groups);
  if (backend === 'SUPER_ADMIN') return 'SUPERADMIN';
  if (backend === 'ADMIN') return 'ADMIN';
  return 'USER';
}

/** Role enum value for pending-invitation logic */
export function getHighestRole(
  groupsOrSource?: string[] | { role?: string | null; groups?: string[] | null } | null,
  role?: string | null,
): Role {
  const formValue = getRoleValueFromGroups(groupsOrSource, role);
  if (formValue === 'SUPERADMIN') return Role.SUPERADMIN;
  if (formValue === 'ADMIN') return Role.ADMIN;
  return Role.USER;
}

export function getInitials(name: string | undefined, email?: string): string {
  if (!name?.trim()) return '?';
  const trimmed = name.trim();

  // Multiple space-separated words → first letter of first two
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  }

  // Single word: try CamelCase split (e.g. "JayChoi" → "JC")
  const camelParts = trimmed.split(/(?=[A-Z])/).filter(Boolean);
  if (camelParts.length >= 2) {
    return camelParts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
  }

  // Single word, not CamelCase: fall back to email local part split on . - _
  if (email) {
    const local = email.split('@')[0] ?? '';
    const emailParts = local.split(/[.\-_]/).filter(Boolean);
    if (emailParts.length >= 2) {
      return emailParts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
    }
  }

  return trimmed.slice(0, 2).toUpperCase() || '?';
}
