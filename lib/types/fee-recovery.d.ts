import { RECOVERY_MODE, EFFECTIVE_SOURCE } from './fee-recovery-enums';

export interface CustomerFeeRecoverySettingsDto {
  id?: number;
  customerId: number;
  customerName: string;
  overrideMode: RECOVERY_MODE;
  overrideFeeAmount: number;
  overrideInvoiceLineDescription: string;
  effectiveMode: RECOVERY_MODE;
  effectiveFeeAmount: number;
  effectiveInvoiceLineDescription: string;
  effectiveSource: EFFECTIVE_SOURCE;
}

export interface CustomerEffectiveFeeRecoveryDto {
  customerId: number;
  overridden: boolean;
  recoveryMode: RECOVERY_MODE;
  feeAmount: number;
  invoiceLineDescription: string;
  source: EFFECTIVE_SOURCE;
}

// For Fee Recovery Settings Screen
export interface FeeRecoverySettingsDto {
  id?: number;
  recoveryMode: RECOVERY_MODE;
  feeAmount: number;
  invoiceLineDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeRecoveryScreenSummaryDto {
  totalCustomers: number;
  customersRecoveringFee: number;
  customersAbsorbingFee: number;
  customersWithOverrides: number;
}

/**
 * GET /fee-recovery — global settings, summary counts, and the paginated
 * customer-overrides table all in one response.
 */
export interface FeeRecoveryScreenResponseDto {
  id?: number;
  recoveryMode: RECOVERY_MODE;
  feeAmount: number;
  invoiceLineDescription: string;
  createdAt?: string;
  updatedAt?: string;
  summary: FeeRecoveryScreenSummaryDto;
  content: CustomerFeeRecoverySettingsDto[];
  page?: number;
  pageSize?: number;
  totalElements: number;
  totalPages: number;
}
