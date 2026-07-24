'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import {
  QuoteExternalLinkItem,
  QuoteSettingItem,
  PolicyDocumentDTO,
  QuoteTextTemplateItem,
} from '@/lib/types/terms-conditions';

export function isPolicyDocument(item: QuoteSettingItem): item is PolicyDocumentDTO {
  return 'mimeType' in item && (item as PolicyDocumentDTO).mimeType === 'application/pdf';
}
import {
  TextTemplateFormValues,
  ExternalLinkFormValues,
  ReplaceDocumentFormValues,
} from '@/app/(protected)/system/user-management/(components)/tabs/schemas/quote-setting-schema';
import {
  PolicyDocumentQueryOptions,
  useCreatePolicyDocument,
  useUpdatePolicyDocument,
  useDeletePolicyDocument,
} from '@/lib/api/policy-document';

// Placeholder data for text templates and external links (no API yet)
const MOCK_NON_DOCUMENT_ITEMS: (QuoteTextTemplateItem | QuoteExternalLinkItem)[] = [
  {
    id: 'tt-1',
    name: 'Standard Supply Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    defaultItem: false,
    updatedAt: '2026-07-03',
  },
  {
    id: 'tt-2',
    name: 'Credit Account Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    defaultItem: false,
    updatedAt: '2026-07-03',
  },
  {
    id: 'tt-3',
    name: 'Pre-Paid / COD Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    defaultItem: false,
    updatedAt: '2026-07-03',
  },
  {
    id: 'tt-4',
    name: 'Customer Collection Terms',
    type: QuoteSettingItemType.TEXT_TEMPLATE,
    content: '',
    defaultItem: false,
    updatedAt: '2026-07-03',
  },
  {
    id: 'el-1',
    name: 'TESTING',
    type: QuoteSettingItemType.EXTERNAL_LINK,
    url: '#',
    defaultItem: true,
    updatedAt: '2026-07-03',
  },
];

let nextMockId = 0;

export function useQuoteSettingsActions() {
  const { data: documentItem } = useQuery(PolicyDocumentQueryOptions());
  const createPolicyDocument = useCreatePolicyDocument();
  const updatePolicyDocument = useUpdatePolicyDocument();
  const deletePolicyDocument = useDeletePolicyDocument();

  // Text templates and external links are local state until their API is ready
  const [localItems, setLocalItems] = React.useState<
    (QuoteTextTemplateItem | QuoteExternalLinkItem)[]
  >(MOCK_NON_DOCUMENT_ITEMS);

  const [addDialogType, setAddDialogType] =
    React.useState<QuoteSettingItemType | null>(null);
  const [editingTextTemplate, setEditingTextTemplate] =
    React.useState<QuoteTextTemplateItem | null>(null);
  const [editingExternalLink, setEditingExternalLink] =
    React.useState<QuoteExternalLinkItem | null>(null);

  const items: QuoteSettingItem[] = React.useMemo(
    () => (documentItem ? [...localItems, documentItem] : localItems),
    [localItems, documentItem],
  );

  // Deferred so the triggering DropdownMenuItem finishes closing first, avoiding a stuck pointerEvents:none on body.
  const openDialogDeferred = React.useCallback(
    (
      type: QuoteSettingItemType,
      editingItem: QuoteTextTemplateItem | QuoteExternalLinkItem | null = null,
    ) => {
      setTimeout(() => {
        setEditingTextTemplate(
          editingItem?.type === QuoteSettingItemType.TEXT_TEMPLATE
            ? editingItem
            : null,
        );
        setEditingExternalLink(
          editingItem?.type === QuoteSettingItemType.EXTERNAL_LINK
            ? editingItem
            : null,
        );
        setAddDialogType(type);
      }, 0);
    },
    [],
  );

  const openTextTemplateEditor = React.useCallback(
    (item: QuoteTextTemplateItem) => {
      openDialogDeferred(QuoteSettingItemType.TEXT_TEMPLATE, item);
    },
    [openDialogDeferred],
  );

  const openExternalLinkEditor = React.useCallback(
    (item: QuoteExternalLinkItem) => {
      openDialogDeferred(QuoteSettingItemType.EXTERNAL_LINK, item);
    },
    [openDialogDeferred],
  );

  const view = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        openDialogDeferred(QuoteSettingItemType.UPLOADED_DOCUMENT);
        return;
      }
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        openTextTemplateEditor(item);
        return;
      }
      openExternalLinkEditor(item);
    },
    [openTextTemplateEditor, openExternalLinkEditor, openDialogDeferred],
  );

  const edit = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        openDialogDeferred(QuoteSettingItemType.UPLOADED_DOCUMENT);
        return;
      }
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        openTextTemplateEditor(item);
        return;
      }
      openExternalLinkEditor(item);
    },
    [openTextTemplateEditor, openExternalLinkEditor, openDialogDeferred],
  );

  const setDefault = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        // Cannot set default without re-uploading the file; open the replace dialog
        openDialogDeferred(QuoteSettingItemType.UPLOADED_DOCUMENT);
        return;
      }
      setLocalItems((prev) =>
        prev.map((it) => ({ ...it, defaultItem: it.id === item.id })),
      );
      notifySuccess(`"${item.name}" set as default.`);
    },
    [openDialogDeferred],
  );

  const remove = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        deletePolicyDocument.mutate(item.id, {
          onSuccess: () => notifySuccess(`"${item.name}" deleted.`),
          onError: (err) => notifyError(extractErrorMessage(err)),
        });
        return;
      }
      setLocalItems((prev) => prev.filter((it) => it.id !== item.id));
      notifySuccess(`"${item.name}" deleted.`);
    },
    [deletePolicyDocument],
  );

  const openAddDialog = React.useCallback(
    (type: QuoteSettingItemType) => {
      openDialogDeferred(type);
    },
    [openDialogDeferred],
  );

  const closeAddDialog = React.useCallback(() => {
    setAddDialogType(null);
    setEditingTextTemplate(null);
    setEditingExternalLink(null);
  }, []);

  const applyLocalItem = React.useCallback(
    (newItem: QuoteTextTemplateItem | QuoteExternalLinkItem) => {
      setLocalItems((prev) => {
        const withoutExisting = prev.filter((it) => it.id !== newItem.id);
        const base = newItem.defaultItem
          ? withoutExisting.map((it) => ({ ...it, defaultItem: false }))
          : withoutExisting;
        return [...base, newItem];
      });
    },
    [],
  );

  const submitTextTemplate = React.useCallback(
    (values: TextTemplateFormValues) => {
      applyLocalItem({
        id: editingTextTemplate?.id ?? `tt-new-${nextMockId++}`,
        name: values.name,
        type: QuoteSettingItemType.TEXT_TEMPLATE,
        content: values.content,
        defaultItem: values.defaultItem,
        updatedAt: new Date().toISOString(),
      });
      notifySuccess(
        editingTextTemplate
          ? `"${values.name}" updated.`
          : `"${values.name}" added.`,
      );
      closeAddDialog();
    },
    [applyLocalItem, closeAddDialog, editingTextTemplate],
  );

  const submitExternalLink = React.useCallback(
    (values: ExternalLinkFormValues) => {
      applyLocalItem({
        id: editingExternalLink?.id ?? `el-new-${nextMockId++}`,
        name: values.name,
        type: QuoteSettingItemType.EXTERNAL_LINK,
        url: values.url,
        defaultItem: values.defaultItem,
        updatedAt: new Date().toISOString(),
      });
      notifySuccess(
        editingExternalLink
          ? `"${values.name}" updated.`
          : `"${values.name}" added.`,
      );
      closeAddDialog();
    },
    [applyLocalItem, closeAddDialog, editingExternalLink],
  );

  const submitReplaceDocument = React.useCallback(
    (values: ReplaceDocumentFormValues) => {
      if (!values.file) return;

      const metadata = { name: values.name, defaultItem: true };

      if (documentItem) {
        updatePolicyDocument.mutate(
          { id: documentItem.id, metadata, file: values.file },
          {
            onSuccess: () => {
              notifySuccess(`"${values.name}" updated.`);
              closeAddDialog();
            },
            onError: (err) => notifyError(extractErrorMessage(err)),
          },
        );
      } else {
        createPolicyDocument.mutate(
          { metadata, file: values.file },
          {
            onSuccess: () => {
              notifySuccess(`"${values.name}" uploaded.`);
              closeAddDialog();
            },
            onError: (err) => notifyError(extractErrorMessage(err)),
          },
        );
      }
    },
    [documentItem, createPolicyDocument, updatePolicyDocument, closeAddDialog],
  );

  const isSubmittingDocument =
    createPolicyDocument.isPending || updatePolicyDocument.isPending;

  const actions = React.useMemo(
    () => ({ view, edit, setDefault, remove, add: openAddDialog }),
    [view, edit, setDefault, remove, openAddDialog],
  );

  return {
    items,
    actions,
    addDialogType,
    documentItem: documentItem ?? undefined,
    editingTextTemplate,
    editingExternalLink,
    closeAddDialog,
    submitTextTemplate,
    submitExternalLink,
    submitReplaceDocument,
    isSubmittingDocument,
  };
}
