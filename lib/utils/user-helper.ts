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

  return trimmed[0]?.toUpperCase() ?? '?';
}
