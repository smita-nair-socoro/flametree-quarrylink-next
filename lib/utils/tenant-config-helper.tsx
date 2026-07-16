'use client';

import { useTenantStore } from '@/app/stores/tenant-store';

/**
 * Centralized currency & tax (GST) display helpers.
 *
 * Tenant-level currency_code, tax_label and tax_percentage are stored on the
 * backend (ISO 4217 currency codes, e.g. AUD, NZD, USD, EUR). Existing
 * tenants are backfilled with AUD / GST / 10%, which is why these are the
 * fallback defaults below.
 */
export const DEFAULT_CURRENCY_CODE = 'AUD';
export const DEFAULT_TAX_LABEL = 'GST';
export const DEFAULT_TAX_PERCENTAGE = 10;
export const DEFAULT_TIMEZONE = 'Australia/Sydney';
export const DEFAULT_ACCOUNTING_SOFTWARE_LABEL = 'Xero';

export type AccountingSoftwareProvider = 'XERO' | 'MYOB';

/** Normalizes the tenant's raw accounting software value for feature routing. */
export function getAccountingSoftwareProvider(
  accountingSoftware?: string,
): AccountingSoftwareProvider | null {
  const value = (accountingSoftware || '').toUpperCase();
  if (value.includes('MYOB')) return 'MYOB';
  if (value.includes('XERO')) return 'XERO';
  return null;
}

/** Reads the normalized accounting software provider from the tenant store. */
export function useAccountingSoftwareProvider(): AccountingSoftwareProvider | null {
  const accountingSoftware = useTenantStore((s) => s.accountingSoftware);
  return getAccountingSoftwareProvider(accountingSoftware);
}

/**
 * Maps the tenant's raw accounting software value (e.g. "XERO",
 * "MYOB_BUSINESS") to a user-facing label ("Xero", "MYOB"). Falls back to
 * Xero for tenants without the field set.
 */
export function getAccountingSoftwareLabel(
  accountingSoftware?: string,
): string {
  const provider = getAccountingSoftwareProvider(accountingSoftware);
  if (provider === 'MYOB') return 'MYOB';
  if (provider === 'XERO') return 'Xero';
  return DEFAULT_ACCOUNTING_SOFTWARE_LABEL;
}

/** Reads the connected accounting software label from the tenant store. */
export function useAccountingSoftwareLabel(): string {
  const accountingSoftware = useTenantStore((s) => s.accountingSoftware);
  return getAccountingSoftwareLabel(accountingSoftware);
}

const FIXED_LOCALE = 'en-AU';

/** Symbol for a given ISO currency code, e.g. "AUD" -> "$". */
export function getCurrencySymbol(
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string {
  const code = currencyCode.toUpperCase();
  const parts = new Intl.NumberFormat(FIXED_LOCALE, {
    style: 'currency',
    currency: code,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);

  return parts.find((part) => part.type === 'currency')?.value ?? code;
}

/** Locale used to format currency amounts. */
export function getCurrencyLocale(): string {
  return FIXED_LOCALE;
}

/** Formats a dollar amount (not cents) as a localized currency string. */
export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string {
  return new Intl.NumberFormat(getCurrencyLocale(), {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol',
  }).format(amount);
}

/** Formats a cents amount as a localized currency string. */
export function formatCentsToCurrency(
  cents: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
): string {
  return formatCurrency(cents / 100, currencyCode);
}

/** "(ex-GST)" style label used in table headers/tooltips. */
export function getExTaxLabel(taxLabel: string = DEFAULT_TAX_LABEL): string {
  return `(ex-${taxLabel})`;
}

/** "GST (10%)" style label used in pricing breakdowns. */
export function getTaxRateLabel(
  taxLabel: string = DEFAULT_TAX_LABEL,
  taxPercentage: number = DEFAULT_TAX_PERCENTAGE,
): string {
  return `${taxLabel} (${taxPercentage}%)`;
}

/**
 * Symbol used to disambiguate a Stripe subscription/invoice currency that
 * may differ from the tenant's invoicing currency, e.g. "AUD" -> "A$".
 */
export function getSubscriptionCurrencySymbol(currency?: string): string {
  const code = (currency || '').toUpperCase();
  if (code === 'AUD') return 'A$';
  return '$';
}

/** Currency code -> display name, e.g. "AUD" -> "Australian Dollar". */
export function getCurrencyName(currencyCode: string): string {
  try {
    return (
      new Intl.DisplayNames(['en'], { type: 'currency' }).of(currencyCode) ||
      currencyCode
    );
  } catch {
    return currencyCode;
  }
}

/** Tenant's IANA timezone id from the tenant store, with default fallback. */
export function getTenantTimeZoneId(): string {
  return (
    useTenantStore.getState().tenantDetails?.timeZoneId || DEFAULT_TIMEZONE
  );
}

/**
 * Current time in the tenant's timezone, as a Date whose local wall-clock
 * components show the tenant's clock
 */
export function getTenantNow(): Date {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: getTenantTimeZoneId(),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    return new Date(
      get('year'),
      get('month') - 1,
      get('day'),
      // Some engines format midnight as "24" with hour12: false.
      get('hour') % 24,
      get('minute'),
      get('second'),
      now.getMilliseconds(),
    );
  } catch {
    return now;
  }
}

/** IANA timezone id -> "Australia/Sydney (UTC+10:00)". */
export function getTimezoneLabel(): string {
  const timeZoneId = useTenantStore.getState().tenantDetails?.timeZoneId;
  if (!timeZoneId) return DEFAULT_TIMEZONE;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneId,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date());
    const offset =
      parts.find((part) => part.type === 'timeZoneName')?.value || '';
    return `${timeZoneId} (${offset.replace('GMT', 'UTC')})`;
  } catch {
    return timeZoneId ?? DEFAULT_TIMEZONE;
  }
}

export interface TenantCurrencyTax {
  currencyCode: string;
  currencySymbol: string;
  taxLabel: string;
  taxPercentage: number;
  exTaxLabel: string;
  taxRateLabel: string;
  formatCurrency: (amount: number) => string;
  formatCentsToCurrency: (cents: number) => string;
}

/**
 * Reads the tenant's currency_code/tax_label/tax_percentage from the tenant
 * store (populated on login), falling back to AUD/GST/10% for tenants
 * without these fields.
 */
export function useTenantCurrencyTax(): TenantCurrencyTax {
  const {
    currencyCode: storeCurrencyCode,
    taxLabel: storeTaxLabel,
    taxPercentage: storeTaxPercentage,
  } = useTenantStore();

  const currencyCode = (
    storeCurrencyCode || DEFAULT_CURRENCY_CODE
  ).toUpperCase();
  const taxLabel = storeTaxLabel || DEFAULT_TAX_LABEL;
  const taxPercentage = storeTaxPercentage ?? DEFAULT_TAX_PERCENTAGE;

  return {
    currencyCode,
    currencySymbol: getCurrencySymbol(currencyCode),
    taxLabel,
    taxPercentage,
    exTaxLabel: getExTaxLabel(taxLabel),
    taxRateLabel: getTaxRateLabel(taxLabel, taxPercentage),
    formatCurrency: (amount: number) => formatCurrency(amount, currencyCode),
    formatCentsToCurrency: (cents: number) =>
      formatCentsToCurrency(cents, currencyCode),
  };
}
