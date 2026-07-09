'use client';

import * as React from 'react';
import { notifyInfo, notifySuccess } from '@/lib/toast';
import {
  QuoteSettingItem,
  QuoteSettingItemType,
  QuoteTermsAndConditionsDocument,
} from '@/app/(protected)/system/user-management/(components)/(data-tables)/quote-settings/types';
import {
  TextTemplateFormValues,
  ExternalLinkFormValues,
  ReplaceDocumentFormValues,
} from '@/app/(protected)/system/user-management/(components)/tabs/schemas/quote-setting-schema';

// Placeholder data until the quote settings API is available
const initialItems: QuoteSettingItem[] = [
  {
    id: '1',
    name: 'Standard Supply Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '2',
    name: 'Credit Account Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '3',
    name: 'Pre-Paid / COD Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '4',
    name: 'Customer Collection Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
  {
    id: '5',
    name: 'TESTING',
    type: QuoteSettingItemType.EXTERNAL_LINK,
    url: '#',
    isDefault: true,
    updatedAt: '2026-07-03',
  },
  {
    id: '6',
    name: 'Delivery Policy',
    type: QuoteSettingItemType.UPLOADED_DOCUMENT,
    fileName: 'delivery-policy.pdf',
    fileSizeLabel: '242.5 KB',
    url: '#',
    isDefault: false,
    updatedAt: '2026-07-03',
  },
];

function formatFileSize(bytes: number): string {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

let nextItemId = initialItems.length + 1;

export function useQuoteSettingsActions() {
  const [items, setItems] = React.useState<QuoteSettingItem[]>(initialItems);
  const [addDialogType, setAddDialogType] =
    React.useState<QuoteSettingItemType | null>(null);

  const view = React.useCallback((item: QuoteSettingItem) => {
    notifyInfo(`Viewing "${item.name}" is coming soon.`);
  }, []);

  const edit = React.useCallback((item: QuoteSettingItem) => {
    notifyInfo(`Editing "${item.name}" is coming soon.`);
  }, []);

  const setDefault = React.useCallback((item: QuoteSettingItem) => {
    setItems((prev) =>
      prev.map((it) => ({ ...it, isDefault: it.id === item.id })),
    );
    notifySuccess(`"${item.name}" set as default.`);
  }, []);

  const remove = React.useCallback((item: QuoteSettingItem) => {
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    notifySuccess(`"${item.name}" deleted.`);
  }, []);

  const openAddDialog = React.useCallback((type: QuoteSettingItemType) => {
    setAddDialogType(type);
  }, []);

  const closeAddDialog = React.useCallback(() => {
    setAddDialogType(null);
  }, []);

  const documentItem = React.useMemo(
    () =>
      items.find(
        (it): it is QuoteTermsAndConditionsDocument =>
          it.type === QuoteSettingItemType.UPLOADED_DOCUMENT,
      ),
    [items],
  );

  const applyItem = React.useCallback((newItem: QuoteSettingItem) => {
    setItems((prev) => {
      const withoutExisting = prev.filter((it) => it.id !== newItem.id);
      const base = newItem.isDefault
        ? withoutExisting.map((it) => ({ ...it, isDefault: false }))
        : withoutExisting;
      return [...base, newItem];
    });
  }, []);

  const submitTextTemplate = React.useCallback(
    (values: TextTemplateFormValues) => {
      applyItem({
        id: String(nextItemId++),
        name: values.name,
        type: QuoteSettingItemType.TEXT_TEMPLATE,
        content: values.content,
        isDefault: values.isDefault,
        updatedAt: new Date().toISOString(),
      });
      notifySuccess(`"${values.name}" added.`);
      closeAddDialog();
    },
    [applyItem, closeAddDialog],
  );

  const submitExternalLink = React.useCallback(
    (values: ExternalLinkFormValues) => {
      applyItem({
        id: String(nextItemId++),
        name: values.name,
        type: QuoteSettingItemType.EXTERNAL_LINK,
        url: values.url,
        isDefault: values.isDefault,
        updatedAt: new Date().toISOString(),
      });
      notifySuccess(`"${values.name}" added.`);
      closeAddDialog();
    },
    [applyItem, closeAddDialog],
  );

  const submitReplaceDocument = React.useCallback(
    (values: ReplaceDocumentFormValues) => {
      if (!values.file) return;
      applyItem({
        id: documentItem?.id ?? String(nextItemId++),
        name: values.name,
        type: QuoteSettingItemType.UPLOADED_DOCUMENT,
        fileName: values.file.name,
        fileSizeLabel: formatFileSize(values.file.size),
        url: documentItem?.url ?? '#',
        isDefault: values.isDefault,
        updatedAt: new Date().toISOString(),
      });
      notifySuccess(`"${values.name}" saved.`);
      closeAddDialog();
    },
    [applyItem, closeAddDialog, documentItem],
  );

  const actions = React.useMemo(
    () => ({ view, edit, setDefault, remove, add: openAddDialog }),
    [view, edit, setDefault, remove, openAddDialog],
  );

  return {
    items,
    actions,
    addDialogType,
    documentItem,
    closeAddDialog,
    submitTextTemplate,
    submitExternalLink,
    submitReplaceDocument,
  };
}
