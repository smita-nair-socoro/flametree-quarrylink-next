import { centsToDollars } from './currency';
import {
  DEFAULT_CURRENCY_CODE,
  DEFAULT_TAX_PERCENTAGE,
  formatCurrency,
} from './currency-tax-helper';
import { JobLineItem, JobItem } from '../types/job';

/**
 * Job pricing breakdown interface
 */

export interface JobPricingBreakdown {
  totalProductCostPrice: string | number;
  totalTruckCostPrice: string | number;
  totalProductSellPrice: string | number;
  totalTruckSellPrice: string | number;
  grossProfit: string | number;
  grossProfitPercentage: number;
  costSubtotalExGST: string | number;
  costGst: string | number;
  totalCost: string | number;
  invoiceSubtotalExGST: string | number;
  invoiceGst: string | number;
  totalInvoice: string | number;
}

export const calculateJobPricing = (
  lineItems: (JobLineItem | JobItem)[] | undefined | null,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  taxPercentage: number = DEFAULT_TAX_PERCENTAGE,
): JobPricingBreakdown => {
  // Handle empty or null line items
  if (!lineItems || lineItems.length === 0) {
    return {
      totalProductCostPrice: 0,
      totalTruckCostPrice: 0,
      totalProductSellPrice: 0,
      totalTruckSellPrice: 0,
      grossProfit: 0,
      grossProfitPercentage: 0,
      costSubtotalExGST: 0,
      costGst: 0,
      totalCost: 0,
      invoiceSubtotalExGST: 0,
      invoiceGst: 0,
      totalInvoice: 0,
    };
  }

  // Sum up the values (in cents)
  const totalProductCostCents = lineItems.reduce(
    (sum, item) => sum + (item.totalProductCostPrice || 0),
    0,
  );
  const totalTruckCostCents = lineItems.reduce((sum, item) => {
    const type = 'type' in item ? item.type : item.jobItemType;
    if (type === 'COLLECTION') return sum;
    return sum + (item.totalTruckCostPrice || 0);
  }, 0);
  const totalProductSellCents = lineItems.reduce(
    (sum, item) => sum + (item.totalProductSellPrice || 0),
    0,
  );
  const totalTruckSellCents = lineItems.reduce((sum, item) => {
    const type = 'type' in item ? item.type : item.jobItemType;
    if (type === 'COLLECTION') return sum;
    return sum + (item.totalTruckSellPrice || 0);
  }, 0);

  const totalCostCents = totalProductCostCents + totalTruckCostCents;
  const totalInvoiceCents = totalProductSellCents + totalTruckSellCents;

  // Convert cents to dollars for display
  const taxRate = taxPercentage / 100;
  const gstCents = totalInvoiceCents * taxRate;
  const totalInvoiceCentsWithGST = totalInvoiceCents + gstCents;
  const costGstCents = totalCostCents * taxRate;
  const totalCostCentsWithGST = totalCostCents + costGstCents;

  // Gross profit = Total Invoice (incl. GST) - Total Cost (incl. GST)
  const grossProfitCents = totalInvoiceCentsWithGST - totalCostCentsWithGST;
  const grossProfitPercentage =
    totalInvoiceCentsWithGST > 0
      ? (grossProfitCents / totalInvoiceCentsWithGST) * 100
      : 0;

  return {
    grossProfitPercentage: grossProfitPercentage,
    totalProductCostPrice: centsToDollars(totalProductCostCents),
    totalTruckCostPrice: centsToDollars(totalTruckCostCents),
    totalProductSellPrice: centsToDollars(totalProductSellCents),
    totalTruckSellPrice: centsToDollars(totalTruckSellCents),
    grossProfit: formatCurrency(grossProfitCents / 100, currencyCode),
    costSubtotalExGST: centsToDollars(totalCostCents),
    costGst: centsToDollars(costGstCents),
    totalCost: centsToDollars(totalCostCentsWithGST),
    invoiceSubtotalExGST: centsToDollars(totalInvoiceCents),
    invoiceGst: centsToDollars(gstCents),
    totalInvoice: centsToDollars(totalInvoiceCentsWithGST),
  };
};
