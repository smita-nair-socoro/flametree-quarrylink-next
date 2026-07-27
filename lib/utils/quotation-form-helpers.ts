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
    };
  });
}

export function selectedItemIdsFromContent(
  items: QuoteEditorContentItemResponseDto[] = [],
): number[] {
  return items.filter((item) => item.selected).map((item) => item.id);
}

const isPolicyDocumentItem = (
  item: QuoteSettingItem,
): item is PolicyDocumentItem => 'mimeType' in item;

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
 * Builds the PUT /quote/{quoteId}/content payload's `items` array: one entry
 * per selected item id, with `sortOrder` set to its position in the panel's
 * display order (from `sortQuoteContentItems`) so the saved order matches
 * what the user sees.
 */
export function buildQuoteContentSelectionItems(
  selectedIds: (string | number)[],
  orderedItems: QuoteSettingItem[],
): QuoteContentSelectionItemRequestDto[] {
  const sortOrderById = new Map(
    orderedItems.map((item, index) => [item.id, index]),
  );

  return selectedIds.map((id) => {
    const libraryItemId = Number(id);
    return {
      libraryItemId,
      sortOrder: sortOrderById.get(libraryItemId) ?? 0,
    };
  });
}
