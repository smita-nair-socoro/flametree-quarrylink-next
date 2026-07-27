import { QuoteSettingItemType } from './term-conditions-enums';

// Raw API response shape (no `type` discriminant - each comes from its own endpoint).
export interface QuoteTextTemplateResponseDto {
  id: number;
  name: string;
  contentHtml: string;
  defaultItem: boolean;
  archived: boolean;
  archivedAt?: string;
}

export interface QuoteTextTemplateRequestDto {
  name: string;
  contentHtml: string;
  defaultItem: boolean;
}

// Frontend model with the `type` discriminant added when building the settings list.
export interface QuoteTextTemplateItem extends QuoteTextTemplateResponseDto {
  type: QuoteSettingItemType.TEXT_TEMPLATE;
}

export interface QuoteExternalLinkResponseDto {
  id: number;
  name: string;
  externalUrl: string;
  externalLinkText: string;
  defaultItem: boolean;
  archived: boolean;
  archivedAt?: string;
}

export interface QuoteExternalLinkRequestDto {
  name: string;
  externalUrl: string;
  externalLinkText: string;
  defaultItem: boolean;
}

export interface QuoteExternalLinkItem extends QuoteExternalLinkResponseDto {
  type: QuoteSettingItemType.EXTERNAL_LINK;
}

export type QuoteSettingItem =
  | QuoteTextTemplateItem
  | QuoteExternalLinkItem
  | PolicyDocumentItem;

export interface PolicyDocumentItem {
  id: number;
  name: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  defaultItem: boolean;
  archived: boolean;
  archivedAt: string;
}

export interface PolicyDocumentViewDTO {
  id: number;
  originalFileName: string;
  mimeType: string;
  url: string;
}

export interface PolicyDocumentMetadata {
  name: string;
  defaultItem: boolean;
}

// Quote editor "Quote content" panel - aggregates all 3 library content types
// (plus per-quote customer notes) into a single read/write endpoint.
export interface QuoteEditorContentItemResponseDto {
  id: number;
  contentType: QuoteSettingItemType;
  name: string;
  contentHtml?: string;
  externalUrl?: string;
  externalLinkText?: string;
  originalFileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  defaultItem: boolean;
  archived: boolean;
  selected: boolean;
  attachmentId?: number;
  sortOrder?: number;
  visible: boolean;
}

export interface QuoteEditorContentResponseDto {
  quoteId: number;
  editable: boolean;
  customerNotesHtml: string;
  availableItems: QuoteEditorContentItemResponseDto[];
}

export interface QuoteContentSelectionItemRequestDto {
  libraryItemId: number;
  sortOrder?: number;
  visible?: boolean;
}

export interface QuoteContentSelectionRequestDto {
  customerNotesHtml?: string;
  items: QuoteContentSelectionItemRequestDto[];
}
