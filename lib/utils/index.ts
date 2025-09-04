import { clsx, type ClassValue } from 'clsx';
import { compareAsc, parseISO } from 'date-fns';
import { User } from 'oidc-client-ts';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isDevEnv(): boolean {
  return process.env.NODE_ENV == 'development';
}

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export function getUser() {
  const authority = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const oidcStorage = localStorage.getItem(
    `oidc.user:${authority}:${clientId}`
  );
  if (!oidcStorage) {
    return null;
  }

  return User.fromStorageString(oidcStorage);
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
  DRAFT:
    'bg-gray-100 text-gray-800 border-gray-800 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-800',
  PENDING:
    'bg-yellow-100 text-yellow-900 border-yellow-900 dark:bg-yellow-200 dark:text-yellow-900 dark:border-yellow-900',
  APPROVED:
    'bg-green-100 text-green-900 border-green-900 dark:bg-green-200 dark:text-green-900 dark:border-green-900',
  CONVERTED_TO_JOB:
    'bg-blue-100 text-blue-900 border-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:border-blue-900',
  'CONVERTED TO JOB':
    'bg-blue-100 text-blue-900 border-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:border-blue-900',
  EXPIRED:
    'bg-red-100 text-red-900 border-red-900 dark:bg-red-200 dark:text-red-900 dark:border-red-900',
  DECLINED:
    'bg-orange-100 text-orange-800 border-orange-800 dark:bg-orange-200 dark:text-orange-800 dark:border-orange-800',
  ARCHIVED:
    'bg-gray-100 text-gray-500 border-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-500',
  ACTIVE:
    'bg-green-100 text-green-800 border-green-800 dark:bg-green-200 dark:text-green-900 dark:border-green-800',
  INACTIVE:
    'bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
  AVAILABLE:
    'bg-green-100 text-green-800 border-green-800 dark:bg-green-200 dark:text-green-900 dark:border-green-800',
  UNAVAILABLE:
    'bg-red-100 text-red-800 border-red-800 dark:bg-red-200 dark:text-red-900 dark:border-red-800',
  COLLECTION:
    'bg-orange-100 text-orange-900 border-orange-900 dark:bg-orange-200 dark:text-orange-900 dark:border-orange-900',
  DELIVERY:
    'bg-blue-100 text-blue-800 border-blue-800 dark:bg-blue-200 dark:text-blue-800 dark:border-blue-800',
  BUSINESS:
    'bg-orange-100 text-orange-800 border-orange-800 dark:bg-orange-200 dark:text-orange-800 dark:border-orange-800',
  INDIVIDUAL:
    'bg-blue-100 text-blue-800 border-blue-800 dark:bg-blue-200 dark:text-blue-800 dark:border-blue-800',
  'NET 7':
    'bg-green-100 text-green-800 border-green-800 dark:bg-green-200 dark:text-green-800 dark:border-green-800',
  'NET 14':
    'bg-blue-100 text-blue-800 border-blue-800 dark:bg-blue-200 dark:text-blue-800 dark:border-blue-800',
  'NET 30':
    'bg-orange-100 text-orange-800 border-orange-800 dark:bg-orange-200 dark:text-orange-800 dark:border-orange-800',
  AGGREGATE:
    'bg-orange-100 text-orange-900 border-orange-900 dark:bg-orange-200 dark:text-orange-800 dark:border-orange-800',
  'CRUSHED ROCK':
    'bg-gray-100 text-gray-900 border-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:border-gray-800',
  DUST: 'bg-yellow-100 text-yellow-900 border-yellow-900 dark:bg-yellow-200 dark:text-yellow-900 dark:border-yellow-800',
  SOIL: 'bg-green-100 text-green-900 border-green-900 dark:bg-green-200 dark:text-green-900 dark:border-green-800',
  SAND: 'bg-blue-100 text-blue-800 border-blue-800 dark:bg-blue-200 dark:text-blue-900 dark:border-blue-800',
};

export const QUOTE_TYPE_COLORS = {
  COLLECTION:
    'bg-orange-100 text-orange-900 border-orange-900 dark:bg-orange-200 dark:text-orange-900 dark:border-orange-900',
  DELIVERY:
    'bg-blue-100 text-blue-800 border-blue-800 dark:text-blue-800 dark:border-blue-800',
};
