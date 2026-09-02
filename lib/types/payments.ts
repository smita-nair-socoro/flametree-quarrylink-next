import { AccountingSyncDisplayStatus } from '@/lib/utils/accounting-sync';
import { INVOICE_STATUS } from '@/lib/types/invoice-enums';

export interface PaymentsInvoice {
  id: number;
  invoiceNumber: string;
  jobId?: number;
  jobNumber?: string;
  customerName?: string;
  docketCount: number;
  amount: number;
  dueDate: string;
  status: INVOICE_STATUS;
  accountingSync: AccountingSyncDisplayStatus;
  failureReason?: string;
}

export interface PaymentsInvoiceStatistics {
  totalInvoices: number;
  overdueInvoices: number;
  uninvoicedDocketsValue: number;
  uninvoicedDeliveryDockets: number;
  uninvoicedCollectionDockets: number;
  duePayment: number;
}

export interface PaymentsPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}

export interface PaymentsCashSale {
  id: number;
  reference: string;
  jobId?: number;
  jobNumber?: string;
  customerName?: string;
  docketCount: number;
  amount: number;
  recordedAt: string;
  paymentType: string;
  paymentReceivedBy?: string;
  accountingSync: AccountingSyncDisplayStatus;
  failureReason?: string;
  voided: boolean;
}

export interface PaymentsInternalTransfer {
  docketId: number;
  docketNumber: string;
  jobId?: number;
  jobNumber?: string;
  fromSiteName?: string;
  toSiteName?: string;
  productName?: string;
  quantity: number;
  costValue: number;
  transferDate: string;
  accountingSync: AccountingSyncDisplayStatus;
  failureReason?: string;
  voided: boolean;
  journalId?: number;
}

export interface CashSaleDocketLine {
  docketId: number;
  docketNumber: string;
  docketType: string;
  amount: number;
  productName?: string;
  quantity?: number;
  deliveryDate?: string;
}

export interface CashSaleAmendment {
  previousPaymentType: string;
  newPaymentType: string;
  amendedBy: string;
  amendedAt: string;
}

export interface CashSaleDetail extends PaymentsCashSale {
  voidReason?: string;
  voidReasonDetail?: string;
  voidedBy?: string;
  voidedAt?: string;
  dockets: CashSaleDocketLine[];
  amendments: CashSaleAmendment[];
}

export const CASH_SALE_PAYMENT_TYPES = [
  'Cash',
  'EFTPOS',
  'EFT',
  'Credit Card',
  'M-PAISA',
] as const;

export type CashSalePaymentType = (typeof CASH_SALE_PAYMENT_TYPES)[number];

export const CASH_SALE_VOID_REASONS = [
  'Recorded in error',
  'Wrong dockets selected',
  'Customer to be invoiced instead',
  'Acumatica rejection — unrecoverable',
  'Other',
] as const;

export const INTERNAL_TRANSFER_VOID_REASONS = [
  'Recorded in error',
  'Wrong product',
  'Wrong quantity',
  'Wrong job',
  'Acumatica rejection — unrecoverable',
  'Other',
] as const;
