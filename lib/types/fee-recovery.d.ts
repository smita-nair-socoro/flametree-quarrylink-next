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

export interface CustomerFeeRecoveryOverridePage {
  totalElements: number;
  totalPages: number;
  size?: number;
  content: CustomerFeeRecoverySettingsDto[];
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
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

export interface FeeRecoveryScreenCustomerDto {
  customerId: number;
  customerName: string;
  hasOverride: boolean;
  overrideMode: RECOVERY_MODE;
  overrideFeeAmount: number;
  overrideInvoiceLineDescription: string;
  effectiveMode: RECOVERY_MODE;
  effectiveFeeAmount: number;
  effectiveInvoiceLineDescription: string;
  effectiveSource: EFFECTIVE_SOURCE;
}

export interface FeeRecoveryScreenResponseDto {
  settings: FeeRecoverySettingsDto;
  summary: FeeRecoveryScreenSummaryDto;
  customers: FeeRecoveryScreenCustomerDto[];
}
