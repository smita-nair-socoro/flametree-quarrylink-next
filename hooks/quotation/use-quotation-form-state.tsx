import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { QuotationWithLineItemsQueryOptions } from '@/lib/api/quotation';
import {
  QuoteEditorContentQueryOptions,
  QuoteContentLibraryListQueryOptions,
} from '@/lib/api/quote-profile-content';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import { calculateQuotationPricing } from '@/lib/utils/quote-helpers';
import {
  mapQuoteEditorContentItems,
  selectedItemIdsFromContent,
  sortQuoteContentItems,
  partitionDuplicateContentItems,
  getDuplicateContentWarningMessages,
} from '@/lib/utils/quotation-form-helpers';
import { useQuotationStore } from '@/app/stores/quotation-store';
import type { Quotation } from '@/lib/types/quotation';
import type { QuotationFormValues } from '@/app/(protected)/customer-operations/quotation/(components)/forms/schemas/quotation-form-schema';

/** Consolidated hook for quotation form data: detail fetch, pricing, and the Quote content panel. */
export function useQuotationFormState(
  selectedQuotation: Quotation | null,
  isEditing: boolean,
  quotationForm: UseFormReturn<QuotationFormValues>,
  taxPercentage?: number,
  currencyCode?: string,
  isDuplicate?: boolean,
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

  // Only needed to resolve a Policy Document substitute while duplicating.
  const { data: contentLibrary } = useQuery({
    ...QuoteContentLibraryListQueryOptions(),
    enabled: Boolean(isDuplicate),
  });
  const currentPolicyDocument = React.useMemo(
    () =>
      contentLibrary?.items.find(
        (item) => item.type === QuoteSettingItemType.POLICY_DOCUMENT,
      ) ?? null,
    [contentLibrary],
  );

  // Archived items are never valid live selections - filtering them.
  const contentItems = React.useMemo(
    () =>
      sortQuoteContentItems(
        mapQuoteEditorContentItems(
          quoteContent?.availableItems?.filter((item) => !item.archived),
        ),
      ),
    [quoteContent],
  );

  // Carry-across rules applied to the source's .
  const duplicatePartition = React.useMemo(() => {
    if (!isDuplicate || !quoteContent) return null;
    return partitionDuplicateContentItems(
      quoteContent.availableItems,
      currentPolicyDocument,
    );
  }, [isDuplicate, quoteContent, currentPolicyDocument]);

  // Hidden marker ids to keep re-sending on every save so it doesn't wipe the
  // banner - freshly derived from the source on create, existing ones on edit.
  const duplicateContentMarkerIds = React.useMemo(() => {
    if (!quoteContent) return [];
    if (isDuplicate) return duplicatePartition?.markerItemIds ?? [];
    return quoteContent.availableItems
      .filter((item) => item.archived && item.selected)
      .map((item) => item.id);
  }, [isDuplicate, quoteContent, duplicatePartition]);

  // Archived items still linked to an existing quote are markers left by a
  // duplicate - read straight off the response, no dismissed-state needed.
  const duplicateContentWarningMessages = React.useMemo(() => {
    if (!isEditing || isDuplicate || !quoteContent) return [];
    return getDuplicateContentWarningMessages(quoteContent.availableItems);
  }, [isEditing, isDuplicate, quoteContent]);

  // Seed customer notes / attached item selections once the quote's content loads.
  React.useEffect(() => {
    if (!isEditing || !quoteContent) return;

    // Customer Notes are per-quote free text and frequently quote-specific -
    // they must not carry across to a duplicate.
    if (!isDuplicate) {
      quotationForm.setValue(
        'customerNotes',
        quoteContent.customerNotesHtml ?? '',
        { shouldDirty: false },
      );
    }

    quotationForm.setValue(
      'attachedItemIds',
      isDuplicate
        ? (duplicatePartition?.keptItemIds ?? [])
        : selectedItemIdsFromContent(
            quoteContent.availableItems.filter((item) => !item.archived),
          ),
      { shouldDirty: false },
    );
  }, [isEditing, isDuplicate, quoteContent, quotationForm, duplicatePartition]);

  return {
    currentQuotation,
    isLoadingDetail,
    detailError,
    pricingBreakdown,
    contentItems,
    duplicateContentMarkerIds,
    duplicateContentWarningMessages,
  };
}
