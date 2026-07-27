import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { QuotationWithLineItemsQueryOptions } from '@/lib/api/quotation';
import { QuoteEditorContentQueryOptions } from '@/lib/api/quote-profile-content';
import { calculateQuotationPricing } from '@/lib/utils/quote-helpers';
import {
  mapQuoteEditorContentItems,
  selectedItemIdsFromContent,
  sortQuoteContentItems,
} from '@/lib/utils/quotation-form-helpers';
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
 * - Quote content panel data (text templates / external links / policy
 *   document + customer notes), via the single GET /quote/{quoteId}/content
 *   endpoint - only relevant once the quote exists (isEditing)
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

  // ===== QUOTE CONTENT PANEL =====
  // The create-new-quote flow doesn't render the Quote content panel at all,
  // so this is only enabled once we have a real quote id (isEditing).
  const { data: quoteContent } = useQuery(
    QuoteEditorContentQueryOptions(selectedQuotation?.id ?? 0),
  );

  const contentItems = React.useMemo(
    () =>
      sortQuoteContentItems(
        mapQuoteEditorContentItems(quoteContent?.availableItems),
      ),
    [quoteContent],
  );

  // Seed customer notes / attached item selections once the quote's content loads.
  React.useEffect(() => {
    if (!isEditing || !quoteContent) return;
    quotationForm.setValue(
      'customerNotes',
      quoteContent.customerNotesHtml ?? '',
      { shouldDirty: false },
    );
    quotationForm.setValue(
      'attachedItemIds',
      selectedItemIdsFromContent(quoteContent.availableItems),
      { shouldDirty: false },
    );
  }, [isEditing, quoteContent, quotationForm]);

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

    // Quote content panel
    contentItems,
  };
}
