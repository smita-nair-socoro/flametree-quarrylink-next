'use client';

import { useQuery } from '@tanstack/react-query';
import { TenantCompleteDetailsQueryOptions } from '@/lib/api/tenant';

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
 * details API, falling back to AUD/GST/10% for tenants without these fields.
 */
export function useTenantCurrencyTax(): TenantCurrencyTax {
  const { data } = useQuery(TenantCompleteDetailsQueryOptions());
  const tenantDetails = data?.tenantDetails;

  const currencyCode = (
    tenantDetails?.currency || DEFAULT_CURRENCY_CODE
  ).toUpperCase();
  const taxLabel = tenantDetails?.taxType || DEFAULT_TAX_LABEL;
  const taxPercentage = tenantDetails?.taxAmount ?? DEFAULT_TAX_PERCENTAGE;

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
