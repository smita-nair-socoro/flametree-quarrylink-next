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
  TextTemplateListQueryOptions,
  useCreateTextTemplate,
  useUpdateTextTemplate,
  useDeleteTextTemplate,
  ExternalLinkListQueryOptions,
  useCreateExternalLink,
  useUpdateExternalLink,
  useDeleteExternalLink,
} from '@/lib/api/quote-profile-content';

export function useQuoteSettingsActions() {
  const { data: documentItem } = useQuery(PolicyDocumentQueryOptions());
  const { data: textTemplateList } = useQuery(TextTemplateListQueryOptions());
  const { data: externalLinkList } = useQuery(ExternalLinkListQueryOptions());

  const createPolicyDocument = useCreatePolicyDocument();
  const updatePolicyDocument = useUpdatePolicyDocument();
  const deletePolicyDocument = useDeletePolicyDocument();

  const createTextTemplate = useCreateTextTemplate();
  const updateTextTemplate = useUpdateTextTemplate();
  const deleteTextTemplate = useDeleteTextTemplate();

  const createExternalLink = useCreateExternalLink();
  const updateExternalLink = useUpdateExternalLink();
  const deleteExternalLink = useDeleteExternalLink();

  const [addDialogType, setAddDialogType] =
    React.useState<QuoteSettingItemType | null>(null);
  const [editingTextTemplate, setEditingTextTemplate] =
    React.useState<QuoteTextTemplateItem | null>(null);
  const [editingExternalLink, setEditingExternalLink] =
    React.useState<QuoteExternalLinkItem | null>(null);

  const textTemplates: QuoteTextTemplateItem[] = React.useMemo(
    () =>
      (textTemplateList ?? []).map((item) => ({
        ...item,
        type: QuoteSettingItemType.TEXT_TEMPLATE as const,
      })),
    [textTemplateList],
  );

  const externalLinks: QuoteExternalLinkItem[] = React.useMemo(
    () =>
      (externalLinkList ?? []).map((item) => ({
        ...item,
        type: QuoteSettingItemType.EXTERNAL_LINK as const,
      })),
    [externalLinkList],
  );

  const items: QuoteSettingItem[] = React.useMemo(
    () => [
      ...textTemplates,
      ...externalLinks,
      ...(documentItem ? [documentItem] : []),
    ],
    [textTemplates, externalLinks, documentItem],
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
      const onSettled = {
        onSuccess: () => notifySuccess(`"${item.name}" set as default.`),
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        updateTextTemplate.mutate(
          {
            id: item.id,
            data: {
              name: item.name,
              contentHtml: item.contentHtml,
              defaultItem: true,
            },
          },
          onSettled,
        );
        return;
      }
      updateExternalLink.mutate(
        {
          id: item.id,
          data: {
            name: item.name,
            externalUrl: item.externalUrl,
            externalLinkText: item.externalLinkText,
            defaultItem: true,
          },
        },
        onSettled,
      );
    },
    [openDialogDeferred, updateTextTemplate, updateExternalLink],
  );

  const remove = React.useCallback(
    (item: QuoteSettingItem) => {
      const onSettled = {
        onSuccess: () => notifySuccess(`"${item.name}" deleted.`),
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (isPolicyDocument(item)) {
        deletePolicyDocument.mutate(item.id, onSettled);
        return;
      }
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        deleteTextTemplate.mutate(item.id, onSettled);
        return;
      }
      deleteExternalLink.mutate(item.id, onSettled);
    },
    [deletePolicyDocument, deleteTextTemplate, deleteExternalLink],
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

  const submitTextTemplate = React.useCallback(
    (values: TextTemplateFormValues) => {
      const data = {
        name: values.name,
        contentHtml: values.content,
        defaultItem: values.defaultItem,
      };
      const onSettled = {
        onSuccess: () => {
          notifySuccess(
            editingTextTemplate
              ? `"${values.name}" updated.`
              : `"${values.name}" added.`,
          );
          closeAddDialog();
        },
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (editingTextTemplate) {
        updateTextTemplate.mutate(
          { id: editingTextTemplate.id, data },
          onSettled,
        );
      } else {
        createTextTemplate.mutate(data, onSettled);
      }
    },
    [editingTextTemplate, createTextTemplate, updateTextTemplate, closeAddDialog],
  );

  const submitExternalLink = React.useCallback(
    (values: ExternalLinkFormValues) => {
      const data = {
        name: values.name,
        externalUrl: values.url,
        externalLinkText: values.linkText,
        defaultItem: values.defaultItem,
      };
      const onSettled = {
        onSuccess: () => {
          notifySuccess(
            editingExternalLink
              ? `"${values.name}" updated.`
              : `"${values.name}" added.`,
          );
          closeAddDialog();
        },
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (editingExternalLink) {
        updateExternalLink.mutate(
          { id: editingExternalLink.id, data },
          onSettled,
        );
      } else {
        createExternalLink.mutate(data, onSettled);
      }
    },
    [editingExternalLink, createExternalLink, updateExternalLink, closeAddDialog],
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
  const isSubmittingTextTemplate =
    createTextTemplate.isPending || updateTextTemplate.isPending;
  const isSubmittingExternalLink =
    createExternalLink.isPending || updateExternalLink.isPending;

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
    isSubmittingTextTemplate,
    isSubmittingExternalLink,
  };
}
