export const CREDIT_CARD_SURCHARGE_RATE = 0.0375;
export const CREDIT_CARD_PAYMENT_TYPE = 'Credit Card';

export type PrepaidDocument = {
  prepay?: boolean;
  pricingLocked?: boolean;
  cashSaleReceiptId?: number | null;
} | null | undefined;

export function isPrepaid(document: PrepaidDocument): boolean {
  return Boolean(document?.prepay);
}

export function isPrepaidPaid(document: PrepaidDocument): boolean {
  return (
    document?.cashSaleReceiptId != null && document.cashSaleReceiptId > 0
  );
}

export function isPrepaidUnpaid(document: PrepaidDocument): boolean {
  return isPrepaid(document) && !isPrepaidPaid(document);
}

export function prepaidBadgeNames(
  status?: string | null,
  prepay?: boolean,
): string[] {
  const names = status ? [status] : [];
  if (prepay) names.push('PREPAID');
  return names;
}

export function canRecordPrepaidQuoteCashSale(quote: PrepaidDocument & {
  quoteStatus?: string;
} | null | undefined): boolean {
  if (!quote || !isPrepaidUnpaid(quote)) return false;
  return (
    quote.quoteStatus !== 'ARCHIVED' && quote.quoteStatus !== 'CONVERTED_TO_JOB'
  );
}

export function canRecordPrepaidJobCashSale(job: PrepaidDocument & {
  jobStatus?: string;
  jobType?: string;
} | null | undefined): boolean {
  if (!job || !isPrepaidUnpaid(job)) return false;
  if (job.jobType === 'INTERNAL_TRANSFER') return false;
  return job.jobStatus !== 'CANCELLED' && job.jobStatus !== 'SETTLED';
}

/** Match backend PrepaidCashSaleAmounts: round once HALF_UP to 2dp. */
export function roundHalfUp2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function creditCardSurchargeAmount(materialAmount: number): number {
  return roundHalfUp2(materialAmount * CREDIT_CARD_SURCHARGE_RATE);
}

export function prepaidCashSaleBreakdown(
  materialAmount: number,
  paymentType: string | null | undefined,
): { materialAmount: number; surchargeAmount: number; totalCharged: number } {
  const material = roundHalfUp2(materialAmount);
  const surcharge =
    paymentType === CREDIT_CARD_PAYMENT_TYPE
      ? creditCardSurchargeAmount(material)
      : 0;
  return {
    materialAmount: material,
    surchargeAmount: surcharge,
    totalCharged: roundHalfUp2(material + surcharge),
  };
}
