import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { QuotationWithLineItemsQueryOptions } from '@/lib/api/quotation';
import { calculateQuotationPricing } from '@/lib/utils/quote-helpers';
import type { Quotation } from '@/lib/types/quotation';

/**
 * Consolidated hook for managing all quotation form state and data
 *
 * Combines:
 * - Fetching quotation details from API
 * - Dynamic labels based on quote type
 * - Pricing calculations with GST
 * - Customer phone/email auto-fill
 */
export function useQuotationFormState(
  selectedQuotation: Quotation | null,
  isEditing: boolean,
  quotationForm: UseFormReturn<any>,
  taxPercentage?: number,
) {
  // ===== DATA FETCHING =====
  const {
    data: quotationDetailData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useQuery(QuotationWithLineItemsQueryOptions(selectedQuotation?.id || 0));

  React.useEffect(() => {
    if (detailError) {
      console.error('❌ Error fetching quotation details:', detailError);
    }
  }, [detailError, quotationDetailData]);

  const getDetailedQuotation = React.useMemo(() => {
    if (isEditing && quotationDetailData) {
      return quotationDetailData as Quotation;
    }
    return null;
  }, [isEditing, quotationDetailData]);

  // Only use selected quotation data when editing; keep new form empty otherwise
  const currentQuotation = isEditing ? getDetailedQuotation : null;

  // ===== DYNAMIC LABELS =====
  const dateLabel = React.useMemo(() => {
    return 'Estimated Start Date';
  }, []);

  const timeWindowLabel = React.useMemo(() => {
    return 'Estimated Time Window';
  }, []);

  // ===== PRICING CALCULATIONS =====
  const pricingBreakdown = React.useMemo(() => {
    if (!isEditing || !currentQuotation) {
      return calculateQuotationPricing(null, undefined, taxPercentage);
    }
    return calculateQuotationPricing(
      currentQuotation.quoteItems,
      undefined,
      taxPercentage,
    );
  }, [isEditing, currentQuotation, taxPercentage]);

  // ===== CUSTOMER AUTO-FILL =====
  const customerId = quotationForm.watch('customerId');

  React.useEffect(() => {
    if (customerId && customerId > 0) {
      const currentPhone = quotationForm.getValues('phone');
      const currentEmail = quotationForm.getValues('email');

      // TODO: Replace hardcoded values with actual customer data from API/store
      if (!currentPhone) {
        quotationForm.setValue('phone', '+61444555777');
      }
      if (!currentEmail) {
        quotationForm.setValue('email', 'customer@email.com');
      }
    }
  }, [customerId, quotationForm]);

  return {
    // Data
    currentQuotation,
    isLoadingDetail,
    detailError: detailError as Error | null,

    // Labels
    dateLabel,
    timeWindowLabel,

    // Pricing (includes gst and totalInvoiceIncGST)
    pricingBreakdown,
  };
}
