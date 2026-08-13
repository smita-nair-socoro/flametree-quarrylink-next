import { clsx, type ClassValue } from 'clsx';
import { compareAsc } from 'date-fns';
import { parseBackendDateTime } from './date';
import { twMerge } from 'tailwind-merge';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';
import { jwtDecode } from 'jwt-decode';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function baseUrl(): string {
  return getRuntimeConfig().API_URL || '';
}

export async function getUser() {
  try {
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
    ]);

    // Return user info with tokens from session
    return {
      ...user,
      access_token: session.tokens?.accessToken?.toString(),
      id_token: session.tokens?.idToken?.toString(),
    };
  } catch (error) {
    console.error('Failed to get user or session:', error);
    return null;
  }
}

export async function getTenantId() {
  try {
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken?.toString();
    if (!idToken) return '';

    type CognitoIdTokenClaims = Record<string, unknown> & {
      'custom:tenant_id': string;
    };

    const decoded = jwtDecode<CognitoIdTokenClaims>(idToken);
    return decoded['custom:tenant_id'] ?? '';
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.log('failed to write into localstorage err : ', err);
  }
}

export function getSessionStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = window.sessionStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setSessionStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.log('failed to write into sessionStorage err : ', err);
  }
}

export function scrollToFirstError() {
  setTimeout(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 0);
}

/**
 * Splits a reason string on the first hyphen into a reason and an optional note.
 * e.g. "Bad weather - reschedule to 9-10am" → { reason: "Bad weather", note: "reschedule to 9-10am" }
 */
export function splitReasonNote(raw: string | null | undefined): {
  reason: string;
  note: string | undefined;
} {
  const trimmed = raw?.trim();
  if (!trimmed) return { reason: '', note: undefined };

  const formatReason = (reason: string) =>
    reason.replaceAll('_', ' ').replace(/^\w/, (c) => c.toUpperCase());

  const hyphenIndex = trimmed.indexOf('-');
  if (hyphenIndex === -1) {
    // Reasons stored without a note still need the underscore cleanup.
    return { reason: formatReason(trimmed), note: undefined };
  }
  return {
    reason: formatReason(trimmed.slice(0, hyphenIndex).trim()),
    note: trimmed.slice(hyphenIndex + 1).trim() || undefined,
  };
}

/**
 * A sorting function you can reuse on any date-string column.
 * Returns negative if a < b, positive if a > b.
 */
export function dateSortingFn(
  a: { getValue: (colId: string) => string },
  b: { getValue: (colId: string) => string },
  columnId: string,
) {
  const da = parseBackendDateTime(a.getValue(columnId));
  const db = parseBackendDateTime(b.getValue(columnId));
  const aValid = !Number.isNaN(da.getTime());
  const bValid = !Number.isNaN(db.getTime());
  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;
  return compareAsc(da, db);
}

// Material Type Badge Colors
export const MATERIAL_TYPE_COLORS: Record<string, string> = {
  AGGREGATE: 'bg-orange-100 text-orange-900 border-orange-900',
  'CRUSHED ROCK': 'bg-gray-100 text-gray-900 border-gray-900',
  DUST: 'bg-yellow-100 text-yellow-900 border-yellow-900',
  ROCK: 'bg-slate-100 text-slate-900 border-slate-900',
  SOIL: 'bg-green-100 text-green-900 border-green-900',
  SAND: 'bg-blue-100 text-blue-800 border-blue-800',
  ROADBASE: 'bg-purple-100 text-purple-900 border-purple-900',
  'LANDSCAPE ROCK': 'bg-red-100 text-red-900 border-red-900',
  'OVERSIZED ROCK': 'bg-indigo-100 text-indigo-900 border-indigo-900',
  BALLAST: 'bg-pink-100 text-pink-900 border-pink-900',
  'STABILISED MATERIAL': 'bg-lime-100 text-lime-900 border-lime-900',
  'RECYCLED MATERIAL': 'bg-cyan-100 text-cyan-900 border-cyan-900',
  WASTE: 'bg-red-100 text-red-900 border-red-900',
};

export const BADGE_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-900 border-yellow-900',
  APPROVED: 'bg-green-100 text-green-900 border-green-900',
  CONVERTED_TO_JOB: 'bg-blue-100 text-blue-900 border-blue-900',
  'CONVERTED TO JOB': 'bg-blue-100 text-blue-900 border-blue-900',
  EXPIRED: 'bg-red-100 text-red-900 border-red-900',
  DECLINED: 'bg-orange-100 text-orange-800 border-orange-800',
  ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-500',
  ACTIVE: 'bg-green-100 text-green-800 border-green-800',
  INACTIVE: 'bg-gray-100 text-gray-400 border-gray-400',
  AVAILABLE: 'bg-green-100 text-green-800 border-green-800',
  Available: 'bg-green-100 text-green-800 border-green-800',
  UNAVAILABLE: 'bg-red-100 text-red-800 border-red-800',
  Unavailable: 'bg-red-100 text-red-800 border-red-800',
  COLLECTION: 'bg-orange-100 text-orange-900 border-orange-900',
  DELIVERY: 'bg-blue-100 text-blue-800 border-blue-800',
  BUSINESS: 'bg-orange-100 text-orange-800 border-orange-800',
  INDIVIDUAL: 'bg-blue-100 text-blue-800 border-blue-800',
  'NET 7': 'bg-green-100 text-green-800 border-green-800',
  'NET 14': 'bg-blue-100 text-blue-800 border-blue-800',
  'NET 30': 'bg-orange-100 text-orange-800 border-orange-800',
  ...MATERIAL_TYPE_COLORS,
  QUARRY: 'bg-orange-100 text-orange-900 border-orange-900',
  SUPPLIER: 'bg-blue-100 text-blue-800 border-blue-800',
  SUSPENDED: 'bg-red-100 text-red-900 border-red-900',
  CANCELLED: 'bg-red-100 text-red-900 border-red-900',
  'PAYMENT ISSUE': 'bg-orange-100 border-orange-800 text-orange-800',
  'PENDING PAYMENT': 'bg-gray-100 text-gray-800 border-gray-800',
  DELETED: 'bg-red-100 text-red-800 border-red-800',
  PAID: 'bg-green-100 text-green-800 border-green-800',
  DUE_PAYMENT: 'bg-red-100 text-red-800 border-red-800',
  'DUE PAYMENT': 'bg-red-100 text-red-800 border-red-800',
  'IN PROGRESS': 'bg-blue-100 text-blue-800 border-blue-800',
  PAUSED: 'bg-orange-100 text-orange-800 border-orange-800',
  SETTLED: 'bg-gray-100 text-gray-800 border-gray-900',
  COMPLETED: 'bg-violet-100 text-violet-800 border-violet-800',
  UNASSIGNED: 'bg-gray-100 text-gray-800 border-gray-800',
  ASSIGNED: 'bg-cyan-100 text-cyan-900 border-cyan-900',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-900 border-indigo-900',
  'IN TRANSIT': 'bg-indigo-100 text-indigo-900 border-indigo-900',
  STOPPED: 'bg-orange-100 text-orange-900 border-orange-900',
  ARRIVED: 'bg-yellow-100 text-yellow-900 border-yellow-900',
  DELIVERED: 'bg-green-100 text-green-900 border-green-900',
  INVOICED: 'bg-purple-100 text-purple-900 border-purple-900',
  VOIDED: 'bg-red-100 text-red-900 border-red-900',
  PREPARING: 'bg-blue-100 text-blue-900 border-blue-900',
  READY: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-900',
  COLLECTED: 'bg-lime-100 text-lime-900 border-lime-900',
  CASH_SALE: 'bg-yellow-100 text-yellow-900 border-yellow-900',
  'CASH SALE': 'bg-yellow-100 text-yellow-900 border-yellow-900',
  INTERNAL: 'bg-blue-100 text-blue-800 border-blue-800',
  SUBCONTRACTOR: 'bg-orange-100 text-orange-800 border-orange-800',
  EXTERNAL: 'bg-orange-100 text-orange-800 border-orange-800',
  DEACTIVATED: 'bg-[#FFF7ED] text-[#DC2626] border-[#DC2626]',
  ON_DUTY: 'bg-blue-100 text-blue-800 border-blue-800',
  'ON DUTY': 'bg-blue-100 text-blue-800 border-blue-800',
  PENDING_INVITATION: 'bg-yellow-100 text-yellow-800 border-yellow-800',
  'PENDING INVITATION': 'bg-yellow-100 text-yellow-800 border-yellow-800',
  // Truck Type Badge Colors
  TRUCK: 'bg-blue-600 text-blue-100 border-blue-100',
  'TRUCK AND TRAILER': 'bg-indigo-600 text-indigo-100 border-indigo-100',
  'SEMI TRAILER': 'bg-purple-600 text-purple-100 border-purple-100',
  'RIGID TRUCK': 'bg-slate-600 text-slate-100 border-slate-100',
  FLATBED: 'bg-orange-600 text-orange-100 border-orange-100',
  TIPPER: 'bg-cyan-600 text-cyan-100 border-cyan-100',
  TANDEM: 'bg-emerald-600 text-emerald-100 border-emerald-100',
  QUAD: 'bg-lime-600 text-lime-100 border-lime-100',
  'TRI AXLE': 'bg-amber-600 text-amber-100 border-amber-100',
  TAUTLINER: 'bg-fuchsia-600 text-fuchsia-100 border-fuchsia-100',
  'CRANE TRUCK': 'bg-rose-600 text-rose-100 border-rose-100',
  PASS: 'bg-green-100 text-green-800 border-green-900',
  FAIL: 'bg-red-100 text-red-800 border-red-900',
  FAILED: 'bg-red-100 text-red-800 border-red-900',
  CONFIRMED: 'bg-yellow-100 text-yellow-800 border-yellow-900',
  GENERIC: 'bg-pink-600 border-pink-100, text-pink-100',
  SYNCED: 'bg-green-100 text-green-800 border-green-900',
  'READY FOR COLLECTION': 'bg-green-100 text-green-800 border-green-900',
  READY_FOR_COLLECTION: 'bg-green-100 text-green-800 border-green-900',
  UNKNOWN: 'bg-gray-100 text-gray-800 border-gray-900',
  // Fee Recovery Badge Colors
  'GLOBAL DEFAULT': 'bg-gray-100 text-gray-600 border-gray-400',
  'CUSTOM RULE': 'bg-violet-100 text-violet-800 border-violet-800',
  CHARGING: 'bg-green-100 text-green-800 border-green-300',
  ABSORBED: 'bg-gray-100 text-gray-600 border-gray-400',
  // Quote Settings Badge Colors
  'TEXT TEMPLATE': 'border-[#DDD6FF] bg-[#F5F3FF] text-[#7008E7]',
  'EXTERNAL LINK': 'border-[#BEDBFF] bg-[#EFF6FF] text-[#1447E6]',
  'POLICY DOCUMENT': 'border-[#FFC9C9] bg-[#FEF2F2] text-[#C10007]',
  DEFAULT: 'border-transparent bg-primary text-primary-foreground',
};
