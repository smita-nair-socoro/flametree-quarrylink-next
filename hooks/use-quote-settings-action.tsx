'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormDialog } from '@/components/form-dialog';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import {
  QuoteExternalLinkItem,
  QuoteSettingItem,
  PolicyDocumentItem,
  QuoteTextTemplateItem,
} from '@/lib/types/terms-conditions';
import {
  PolicyDocumentQueryOptions,
  TextTemplateListQueryOptions,
  useUpdateTextTemplate,
  useDeleteTextTemplate,
  ExternalLinkListQueryOptions,
  useUpdateExternalLink,
  useDeleteExternalLink,
  useDeletePolicyDocument,
} from '@/lib/api/quote-profile-content';
import TextTemplateForm from '@/app/(protected)/system/user-management/(components)/forms/text-template-form';
import ExternalLinkForm from '@/app/(protected)/system/user-management/(components)/forms/external-link-form';
import PolicyDocumentForm from '@/app/(protected)/system/user-management/(components)/forms/policy-document-form';

export function isPolicyDocument(item: QuoteSettingItem): item is PolicyDocumentItem {
  return 'mimeType' in item && (item as PolicyDocumentItem).mimeType === 'application/pdf';
}

export function useQuoteSettingsActions() {
  const { data: documentItem } = useQuery(PolicyDocumentQueryOptions());
  const { data: textTemplateList } = useQuery(TextTemplateListQueryOptions());
  const { data: externalLinkList } = useQuery(ExternalLinkListQueryOptions());

  const updateTextTemplate = useUpdateTextTemplate();
  const deleteTextTemplate = useDeleteTextTemplate();

  const updateExternalLink = useUpdateExternalLink();
  const deleteExternalLink = useDeleteExternalLink();

  const deletePolicyDocument = useDeletePolicyDocument();

  const [textTemplateDialogOpen, setTextTemplateDialogOpen] =
    React.useState(false);
  const [editingTextTemplate, setEditingTextTemplate] =
    React.useState<QuoteTextTemplateItem | null>(null);

  const [externalLinkDialogOpen, setExternalLinkDialogOpen] =
    React.useState(false);
  const [editingExternalLink, setEditingExternalLink] =
    React.useState<QuoteExternalLinkItem | null>(null);

  const [policyDocumentDialogOpen, setPolicyDocumentDialogOpen] =
    React.useState(false);

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
  const openDialogDeferred = React.useCallback((openFn: () => void) => {
    setTimeout(openFn, 0);
  }, []);

  const edit = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        openDialogDeferred(() => setPolicyDocumentDialogOpen(true));
        return;
      }
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        openDialogDeferred(() => {
          setEditingTextTemplate(item);
          setTextTemplateDialogOpen(true);
        });
        return;
      }
      openDialogDeferred(() => {
        setEditingExternalLink(item);
        setExternalLinkDialogOpen(true);
      });
    },
    [openDialogDeferred],
  );

  const setDefault = React.useCallback(
    (item: QuoteSettingItem) => {
      if (isPolicyDocument(item)) {
        // Cannot set default without re-uploading the file; open the replace dialog
        openDialogDeferred(() => setPolicyDocumentDialogOpen(true));
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
      openDialogDeferred(() => {
        if (type === QuoteSettingItemType.TEXT_TEMPLATE) {
          setEditingTextTemplate(null);
          setTextTemplateDialogOpen(true);
        } else if (type === QuoteSettingItemType.EXTERNAL_LINK) {
          setEditingExternalLink(null);
          setExternalLinkDialogOpen(true);
        } else {
          setPolicyDocumentDialogOpen(true);
        }
      });
    },
    [openDialogDeferred],
  );

  const actions = React.useMemo(
    () => ({ view: edit, edit, setDefault, remove, add: openAddDialog }),
    [edit, setDefault, remove, openAddDialog],
  );

  const textTemplateDialog = textTemplateDialogOpen ? (
    <FormDialog
      dialogTitle={
        editingTextTemplate ? 'Edit Text Template' : 'Add Text Template'
      }
      dialogDescription="Text templates are available when staff compose quotes under Notes & Terms."
      open={textTemplateDialogOpen}
      onOpenChangeAction={(open) => {
        setTextTemplateDialogOpen(open);
        if (!open) {
          setTimeout(() => setEditingTextTemplate(null), 100);
        }
      }}
      hideTrigger
      dialogWidth="700px"
    >
      <TextTemplateForm editingItem={editingTextTemplate} />
    </FormDialog>
  ) : null;

  const externalLinkDialog = externalLinkDialogOpen ? (
    <FormDialog
      dialogTitle={
        editingExternalLink ? 'Edit External Link' : 'Add External Link'
      }
      dialogDescription="Link to policies hosted on SharePoint, Google Drive, or any external URL. Customers will see a clickable link on their quote."
      open={externalLinkDialogOpen}
      onOpenChangeAction={(open) => {
        setExternalLinkDialogOpen(open);
        if (!open) {
          setTimeout(() => setEditingExternalLink(null), 100);
        }
      }}
      hideTrigger
      dialogWidth="500px"
    >
      <ExternalLinkForm editingItem={editingExternalLink} />
    </FormDialog>
  ) : null;

  const policyDocumentDialog = policyDocumentDialogOpen ? (
    <FormDialog
      dialogTitle={
        documentItem ? 'Replace Policy Document' : 'Upload Policy Document'
      }
      dialogDescription={
        documentItem
          ? 'Uploading a new PDF will replace the current document. Only one policy document is allowed in your library.'
          : 'Upload a single PDF policy document. Customers can view and download it from quotes.'
      }
      open={policyDocumentDialogOpen}
      onOpenChangeAction={(open) => setPolicyDocumentDialogOpen(open)}
      hideTrigger
      dialogWidth="500px"
    >
      <PolicyDocumentForm currentDocument={documentItem ?? undefined} />
    </FormDialog>
  ) : null;

  return {
    items,
    actions,
    documentItem: documentItem ?? undefined,
    textTemplateDialog,
    externalLinkDialog,
    policyDocumentDialog,
  };
}
