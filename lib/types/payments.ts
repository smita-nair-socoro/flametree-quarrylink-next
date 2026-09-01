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

export interface PaymentsPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}
