import { QuoteSettingItemType } from './term-conditions-enums';

interface QuoteSettingItemBase {
  id: string;
  name: string;
  defaultItem: boolean;
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

export type QuoteSettingItem =
  | QuoteTextTemplateItem
  | QuoteExternalLinkItem
  | PolicyDocumentDTO;

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
