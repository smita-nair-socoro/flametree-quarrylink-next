export enum QuoteSettingItemType {
  TEXT_TEMPLATE = 'text_template',
  EXTERNAL_LINK = 'external_link',
  UPLOADED_DOCUMENT = 'uploaded_document',
}

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
