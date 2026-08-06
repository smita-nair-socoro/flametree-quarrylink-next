import { normalizePhoneNumber } from './phone-helper';
import { parseCalendarDate } from './date';
import {
  normalizeDeliveryTimeWindowEnd,
  normalizeDeliveryTimeWindowStart,
} from './time';
import type { Quotation } from '../types/quotation';
import { QuoteSettingItemType } from '../types/term-conditions-enums';
import type {
  QuoteEditorContentItemResponseDto,
  QuoteSettingItem,
  QuoteExternalLinkItem,
  QuoteTextTemplateItem,
  PolicyDocumentItem,
  QuoteContentLibraryItem,
  QuoteContentSelectionItemRequestDto,
} from '../types/terms-conditions';
import { sortByLabel } from './sort-options';

/**
 * Transform quotation data to form values
 * Handles date formatting and field normalization for the quotation form
 */
export function quotationToFormValues(
  quotation: Quotation | null,
  isEditing: boolean,
) {
  if (!quotation && !isEditing) {
    // New quotation defaults - the Quote content panel isn't shown until
    // the quote exists, so there's nothing to pre-select here.
    return {
      customerId: 0,
      accountManagerSub: '',
      projectName: '',
      deliveryStartDate: undefined,
      deliveryWindowStart: '',
      deliveryWindowEnd: '',
      expiryDate: undefined,
      phone: '',
      receiptEmail: '',
      customerNotes: '',
      attachedItemIds: [],
    };
  }

  return {
    customerId: quotation?.customerId || 0,
    accountManagerSub: quotation?.accountManagerSub || '',
    projectName: quotation?.projectName || '',
    deliveryStartDate: quotation?.deliveryStartDate
      ? parseCalendarDate(quotation.deliveryStartDate)
      : undefined,
    deliveryWindowStart: normalizeDeliveryTimeWindowStart(
      quotation?.deliveryWindowStart,
    ),
    deliveryWindowEnd: normalizeDeliveryTimeWindowEnd(
      quotation?.deliveryWindowEnd,
    ),
    expiryDate: quotation?.expiryDate
      ? parseCalendarDate(quotation.expiryDate)
      : undefined,
    receiptEmail: (quotation?.emailRecipients || []).join(','),
    phone: normalizePhoneNumber(
      quotation?.phone ||
        quotation?.customerWithAddressResponseDto?.phone ||
        '',
    ),
    // Populated separately once GET /quote/{quoteId}/content resolves.
    customerNotes: '',
    attachedItemIds: [],
  };
}

/**
 * Adapts the flattened quote-editor-content items (one shape for all 3
 * content types, discriminated by `contentType`) into the `QuoteSettingItem`
 * union the Quote content panel already renders.
 */
export function mapQuoteEditorContentItems(
  items: QuoteEditorContentItemResponseDto[] = [],
): QuoteSettingItem[] {
  return items.map((item): QuoteSettingItem => {
    if (item.contentType === QuoteSettingItemType.TEXT_TEMPLATE) {
      return {
        id: item.id,
        name: item.name,
        contentHtml: item.contentHtml ?? '',
        defaultItem: item.defaultItem,
        archived: item.archived,
        type: QuoteSettingItemType.TEXT_TEMPLATE,
      };
    }
    if (item.contentType === QuoteSettingItemType.EXTERNAL_LINK) {
      return {
        id: item.id,
        name: item.name,
        externalUrl: item.externalUrl ?? '',
        externalLinkText: item.externalLinkText ?? '',
        defaultItem: item.defaultItem,
        archived: item.archived,
        type: QuoteSettingItemType.EXTERNAL_LINK,
      };
    }
    return {
      id: item.id,
      name: item.name,
      originalFileName: item.originalFileName ?? '',
      mimeType: item.mimeType ?? 'application/pdf',
      fileSizeBytes: item.fileSizeBytes ?? 0,
      defaultItem: item.defaultItem,
      archived: item.archived,
      archivedAt: '',
      type: QuoteSettingItemType.POLICY_DOCUMENT,
    };
  });
}

export function selectedItemIdsFromContent(
  items: QuoteEditorContentItemResponseDto[] = [],
): number[] {
  return items.filter((item) => item.selected).map((item) => item.id);
}

export interface DuplicateContentPartition {
  /** Ids to actually attach to the duplicate (active items, plus any Policy Document substitute). */
  keptItemIds: number[];
  /** Archived-and-dropped ids, persisted as hidden (visible: false) markers so the
   * "didn't carry across" banner can reconstruct itself later. */
  markerItemIds: number[];
}

/** Applies the duplicate-quote carry-across rules: active items carry across,
 * archived Text Templates/External Links drop, archived Policy Document substitutes.
 * `currentPolicyDocument` is the tenant's live Policy Document (from the
 * content library list), not inferred from the source quote's items. */
export function partitionDuplicateContentItems(
  items: QuoteEditorContentItemResponseDto[] = [],
  currentPolicyDocument?: QuoteContentLibraryItem | null,
): DuplicateContentPartition {
  const keptItemIds: number[] = [];
  const markerItemIds: number[] = [];

  for (const item of items) {
    if (!item.selected) continue;

    if (!item.archived) {
      keptItemIds.push(item.id);
      continue;
    }

    if (
      item.contentType === QuoteSettingItemType.POLICY_DOCUMENT &&
      currentPolicyDocument &&
      !keptItemIds.includes(currentPolicyDocument.id)
    ) {
      keptItemIds.push(currentPolicyDocument.id);
    }
    markerItemIds.push(item.id);
  }

  return { keptItemIds: [...new Set(keptItemIds)], markerItemIds };
}

/** Reads the "didn't carry across" banner off a quote's own content response -
 * any archived item still linked is a marker left by `partitionDuplicateContentItems`. */
export function getDuplicateContentWarningMessages(
  items: QuoteEditorContentItemResponseDto[] = [],
): string[] {
  const markers = items.filter((item) => item.archived);
  if (markers.length === 0) return [];

  const activePolicyDocument = items.find(
    (item) =>
      item.contentType === QuoteSettingItemType.POLICY_DOCUMENT &&
      !item.archived &&
      item.selected,
  );

  return markers.map((marker) => {
    if (marker.contentType === QuoteSettingItemType.POLICY_DOCUMENT) {
      return activePolicyDocument
        ? `The document attached to the original quote is no longer available. "${activePolicyDocument.name}" has been attached instead.`
        : 'The document attached to the original quote is no longer available and hasn\'t been re-attached.';
    }
    return marker.name
      ? `"${marker.name}" is no longer available and hasn't been attached.`
      : 'One or more items attached to the original quote have since been removed.';
  });
}

const isPolicyDocumentItem = (
  item: QuoteSettingItem,
): item is PolicyDocumentItem =>
  item.type === QuoteSettingItemType.POLICY_DOCUMENT;

/**
 * Orders the Quote content panel's items: the (at most 3) category defaults
 * first - Policy Document, then External Link, then Text Template - followed
 * by the remaining external links (alphabetical) and remaining text
 * templates (alphabetical), each sorted within its own type.
 */
export function sortQuoteContentItems(
  items: QuoteSettingItem[],
): QuoteSettingItem[] {
  const policyDocs = items.filter(isPolicyDocumentItem);
  const externalLinks = items.filter(
    (item): item is QuoteExternalLinkItem =>
      !isPolicyDocumentItem(item) &&
      item.type === QuoteSettingItemType.EXTERNAL_LINK,
  );
  const textTemplates = items.filter(
    (item): item is QuoteTextTemplateItem =>
      !isPolicyDocumentItem(item) &&
      item.type === QuoteSettingItemType.TEXT_TEMPLATE,
  );

  // Only one Policy Document can ever exist per tenant, so whichever one
  // is there always leads - no "other" PDFs to sort among.
  const defaultPolicyDoc =
    policyDocs.find((item) => item.defaultItem) ?? policyDocs[0];
  const defaultExternalLink = externalLinks.find((item) => item.defaultItem);
  const defaultTextTemplate = textTemplates.find((item) => item.defaultItem);

  const remainingExternalLinks = sortByLabel(
    externalLinks.filter((item) => item !== defaultExternalLink),
    (item) => item.name,
  );
  const remainingTextTemplates = sortByLabel(
    textTemplates.filter((item) => item !== defaultTextTemplate),
    (item) => item.name,
  );

  return [
    defaultPolicyDoc,
    defaultExternalLink,
    defaultTextTemplate,
    ...remainingExternalLinks,
    ...remainingTextTemplates,
  ].filter((item): item is QuoteSettingItem => Boolean(item));
}

/**
 * Same category order as `sortQuoteContentItems` (Policy Document, then
 * External Link, then Text Template - default first within each type),
 * for the flat `QuoteContentLibraryItem` shape used by the Quote Settings
 * library list, so the two views stay visually consistent.
 */
export function sortQuoteContentLibraryItems(
  items: QuoteContentLibraryItem[],
): QuoteContentLibraryItem[] {
  const policyDocs = items.filter(
    (item) => item.type === QuoteSettingItemType.POLICY_DOCUMENT,
  );
  const externalLinks = items.filter(
    (item) => item.type === QuoteSettingItemType.EXTERNAL_LINK,
  );
  const textTemplates = items.filter(
    (item) => item.type === QuoteSettingItemType.TEXT_TEMPLATE,
  );

  const defaultExternalLink = externalLinks.find((item) => item.defaultItem);
  const defaultTextTemplate = textTemplates.find((item) => item.defaultItem);

  const remainingExternalLinks = sortByLabel(
    externalLinks.filter((item) => item !== defaultExternalLink),
    (item) => item.name,
  );
  const remainingTextTemplates = sortByLabel(
    textTemplates.filter((item) => item !== defaultTextTemplate),
    (item) => item.name,
  );

  return [
    ...policyDocs,
    defaultExternalLink,
    defaultTextTemplate,
    ...remainingExternalLinks,
    ...remainingTextTemplates,
  ].filter((item): item is QuoteContentLibraryItem => Boolean(item));
}

/**
 * Builds the PUT /quote/{quoteId}/content payload's `items` array: one entry
 * per selected item id, with `sortOrder` set to its rank among the selected
 * items (0-indexed, contiguous) in the panel's display order (from
 * `sortQuoteContentItems`) so the saved order matches what the user sees.
 * The backend rejects gaps (e.g. sortOrder 0, 1, 6), which would happen if
 * we used each item's index in the full library list instead.
 */
export function buildQuoteContentSelectionItems(
  selectedIds: (string | number)[],
  orderedItems: QuoteSettingItem[],
): QuoteContentSelectionItemRequestDto[] {
  const rankById = new Map(orderedItems.map((item, index) => [item.id, index]));

  return [...selectedIds]
    .sort(
      (a, b) => (rankById.get(Number(a)) ?? 0) - (rankById.get(Number(b)) ?? 0),
    )
    .map((id, index) => ({
      libraryItemId: Number(id),
      sortOrder: index,
      visible: true,
    }));
}

/** Builds the hidden (visible: false) marker entries appended after the real
 * selection - `sortOrder` continues on from the real items to avoid gaps. */
export function buildQuoteContentMarkerItems(
  markerIds: number[],
  realItemCount: number,
): QuoteContentSelectionItemRequestDto[] {
  return markerIds.map((id, index) => ({
    libraryItemId: id,
    sortOrder: realItemCount + index,
    visible: false,
  }));
}
