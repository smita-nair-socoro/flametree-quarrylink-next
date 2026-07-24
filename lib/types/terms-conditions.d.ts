import { QuoteSettingItemType } from './term-conditions-enums';

interface QuoteSettingItemBase {
  id: string;
  name: string;
  isDefault: boolean;
  updatedAt: string;
}

export interface QuoteTextTemplateItem extends QuoteSettingItemBase {
  type: QuoteSettingItemType.TEXT_TEMPLATE;
  content: string;
}

export interface QuoteExternalLinkItem extends QuoteSettingItemBase {
  type: QuoteSettingItemType.EXTERNAL_LINK;
  url: string;
}

/** The uploaded quote terms and conditions / policy document attached under Notes & Terms. */
export interface QuoteTermsAndConditionsDocument extends QuoteSettingItemBase {
  type: QuoteSettingItemType.UPLOADED_DOCUMENT;
  fileName: string;
  fileSizeLabel: string;
  url: string;
}

export type QuoteSettingItem =
  | QuoteTextTemplateItem
  | QuoteExternalLinkItem
  | QuoteTermsAndConditionsDocument;

export interface PolicyDocumentDTO {
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
