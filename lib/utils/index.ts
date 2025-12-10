import { clsx, type ClassValue } from 'clsx';
import { compareAsc, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { getRuntimeConfig } from '@/app/stores/runtimeConfigStore';

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
    const user = await getCurrentUser();
    // Extract tenant ID from user attributes if available
    return user.signInDetails?.loginId || user.username || '';
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

/**
 * A sorting function you can reuse on any date-string column.
 * Returns negative if a < b, positive if a > b.
 */
export function dateSortingFn(
  a: { getValue: (colId: string) => string },
  b: { getValue: (colId: string) => string },
  columnId: string
) {
  const da = parseISO(a.getValue(columnId));
  const db = parseISO(b.getValue(columnId));
  return compareAsc(da, db);
}

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
  UNAVAILABLE: 'bg-red-100 text-red-800 border-red-800',
  COLLECTION: 'bg-orange-100 text-orange-900 border-orange-900',
  DELIVERY: 'bg-blue-100 text-blue-800 border-blue-800',
  BUSINESS: 'bg-orange-100 text-orange-800 border-orange-800',
  INDIVIDUAL: 'bg-blue-100 text-blue-800 border-blue-800',
  'NET 7': 'bg-green-100 text-green-800 border-green-800',
  'NET 14': 'bg-blue-100 text-blue-800 border-blue-800',
  'NET 30': 'bg-orange-100 text-orange-800 border-orange-800',
  AGGREGATE: 'bg-orange-100 text-orange-900 border-orange-900',
  'CRUSHED ROCK': 'bg-gray-100 text-gray-900 border-gray-900',
  DUST: 'bg-yellow-100 text-yellow-900 border-yellow-900',
  SOIL: 'bg-green-100 text-green-900 border-green-900',
  SAND: 'bg-blue-100 text-blue-800 border-blue-800',
  QUARRY: 'bg-orange-100 text-orange-900 border-orange-900',
  SUPPLIER: 'bg-blue-100 text-blue-800 border-blue-800',
  SUSPENDED: 'bg-red-100 text-red-900 border-red-900',
  CANCELLED: 'bg-gray-100 text-gray-400 border-gray-400',
  'PAYMENT ISSUE': 'bg-orange-100 border-orange-800 text-orange-800',
  'PENDING PAYMENT': 'bg-gray-100 text-gray-800 border-gray-800',
  DELETED: 'bg-red-100 text-red-800 border-red-800',
  PAID: 'bg-green-100 text-green-800 border-green-800',
  DUE_PAYMENT: 'bg-red-100 text-red-800 border-red-800',
  'DUE PAYMENT': 'bg-red-100 text-red-800 border-red-800',
};
