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
import type { QuotationFormValues } from '@/app/(protected)/customer-operations/quotation/(components)/forms/schemas/quotation-form-schema';

const DATE_LABEL = 'Estimated Start Date';
const TIME_WINDOW_LABEL = 'Estimated Time Window';

/** Consolidated hook for quotation form data: detail fetch, pricing, and the Quote content panel. */
export function useQuotationFormState(
  selectedQuotation: Quotation | null,
  isEditing: boolean,
  quotationForm: UseFormReturn<QuotationFormValues>,
  taxPercentage?: number,
  currencyCode?: string,
) {
  const {
    data: quotationDetailData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useQuery(QuotationWithLineItemsQueryOptions(selectedQuotation?.id || 0));

  React.useEffect(() => {
    if (detailError) {
      console.error('Error fetching quotation details:', detailError);
    }
  }, [detailError]);

  // Only use fetched data when editing; keep the create-new form empty otherwise.
  const currentQuotation = isEditing ? (quotationDetailData ?? null) : null;

  // FormDialog's header/links read the selected quotation from the store.
  const setSelectedQuotation = useQuotationStore(
    (state) => state.setSelectedQuotation,
  );
  React.useEffect(() => {
    if (currentQuotation) {
      setSelectedQuotation(currentQuotation);
    }
  }, [currentQuotation, setSelectedQuotation]);

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

  // QuoteEditorContentQueryOptions is only enabled once a real quote id exists.
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
    currentQuotation,
    isLoadingDetail,
    detailError,
    dateLabel: DATE_LABEL,
    timeWindowLabel: TIME_WINDOW_LABEL,
    pricingBreakdown,
    contentItems,
  };
}
