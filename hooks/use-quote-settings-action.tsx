'use client';

import * as React from 'react';
import { notifyInfo, notifySuccess } from '@/lib/toast';
import {
  QuoteSettingItem,
  QuoteSettingItemType,
} from '@/app/(protected)/system/user-management/(components)/(data-tables)/quote-settings/types';

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

const addItemMessages: Record<QuoteSettingItemType, string> = {
  [QuoteSettingItemType.TEXT_TEMPLATE]: 'Adding a text template is coming soon.',
  [QuoteSettingItemType.UPLOADED_DOCUMENT]:
    'Replacing the policy document is coming soon.',
  [QuoteSettingItemType.EXTERNAL_LINK]: 'Adding an external link is coming soon.',
};

export function useQuoteSettingsActions() {
  const [items, setItems] = React.useState<QuoteSettingItem[]>(initialItems);

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

  const add = React.useCallback((type: QuoteSettingItemType) => {
    notifyInfo(addItemMessages[type]);
  }, []);

  const actions = React.useMemo(
    () => ({ view, edit, setDefault, remove, add }),
    [view, edit, setDefault, remove, add],
  );

  return { items, actions };
}
