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
    `oidc.user:${authority}:${clientId}`,
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
  columnId: string,
) {
  const da = parseISO(a.getValue(columnId));
  const db = parseISO(b.getValue(columnId));
  return compareAsc(da, db);
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
