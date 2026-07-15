import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { QuotationWithLineItemsQueryOptions } from '@/lib/api/quotation';
import { calculateQuotationPricing } from '@/lib/utils/quote-helpers';
import { useQuotationStore } from '@/app/stores/quotation-store';
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
  currencyCode?: string,
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
      return quotationDetailData;
    }
    return null;
  }, [isEditing, quotationDetailData]);

  // Only use selected quotation data when editing; keep new form empty otherwise
  const currentQuotation = isEditing ? getDetailedQuotation : null;

  // The store's selectedQuotation (used by FormDialog's header/links)
  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );
  React.useEffect(() => {
    if (currentQuotation) {
      setSelectedQuotation(currentQuotation);
    }
  }, [currentQuotation, setSelectedQuotation]);

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
      return calculateQuotationPricing(null, currencyCode, taxPercentage);
    }
    return calculateQuotationPricing(
      currentQuotation.quoteItems,
      currencyCode,
      taxPercentage,
    );
  }, [isEditing, currentQuotation, taxPercentage, currencyCode]);

  return {
    // Data
    currentQuotation,
    isLoadingDetail,
    detailError: detailError,

    // Labels
    dateLabel,
    timeWindowLabel,

    // Pricing (includes gst and totalInvoiceIncGST)
    pricingBreakdown,
  };
}
