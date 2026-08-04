'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormDialog } from '@/components/form-dialog';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { QuoteSettingItemType } from '@/lib/types/term-conditions-enums';
import {
  QuoteSettingItem,
  PolicyDocumentItem,
  QuoteContentLibraryItem,
} from '@/lib/types/terms-conditions';
import { APIClient } from '@/lib/api/APIClient';
import { sortQuoteContentLibraryItems } from '@/lib/utils/quotation-form-helpers';
import {
  QuoteContentLibraryListQueryOptions,
  PolicyDocumentQueryOptions,
  useUpdateTextTemplate,
  useDeleteTextTemplate,
  useUpdateExternalLink,
  useDeleteExternalLink,
  useDeletePolicyDocument,
} from '@/lib/api/quote-profile-content';
import TextTemplateForm from '@/app/(protected)/system/user-management/(components)/forms/text-template-form';
import ExternalLinkForm from '@/app/(protected)/system/user-management/(components)/forms/external-link-form';
import PolicyDocumentForm from '@/app/(protected)/system/user-management/(components)/forms/policy-document-form';

// Used by the quote editor's "Quote content" panel, which still deals in the
// full `QuoteSettingItem` union (its data comes from GET /quote/{id}/content,
// which returns full content per item, unlike the settings library list).
export function isPolicyDocument(item: QuoteSettingItem): item is PolicyDocumentItem {
  return 'mimeType' in item && (item as PolicyDocumentItem).mimeType === 'application/pdf';
}

export function useQuoteSettingsActions() {
  const { data: libraryData } = useQuery(QuoteContentLibraryListQueryOptions());
  const { data: documentItem } = useQuery(PolicyDocumentQueryOptions());

  const items: QuoteContentLibraryItem[] = React.useMemo(
    () => sortQuoteContentLibraryItems(libraryData?.items ?? []),
    [libraryData],
  );

  const updateTextTemplate = useUpdateTextTemplate();
  const deleteTextTemplate = useDeleteTextTemplate();

  const updateExternalLink = useUpdateExternalLink();
  const deleteExternalLink = useDeleteExternalLink();

  const deletePolicyDocument = useDeletePolicyDocument();

  const [textTemplateDialogOpen, setTextTemplateDialogOpen] =
    React.useState(false);
  const [editingTextTemplateId, setEditingTextTemplateId] =
    React.useState<number | null>(null);

  const [externalLinkDialogOpen, setExternalLinkDialogOpen] =
    React.useState(false);
  const [editingExternalLinkId, setEditingExternalLinkId] =
    React.useState<number | null>(null);

  const [policyDocumentDialogOpen, setPolicyDocumentDialogOpen] =
    React.useState(false);

  // Deferred so the triggering DropdownMenuItem finishes closing first, avoiding a stuck pointerEvents:none on body.
  const openDialogDeferred = React.useCallback((openFn: () => void) => {
    setTimeout(openFn, 0);
  }, []);

  const edit = React.useCallback(
    (item: QuoteContentLibraryItem) => {
      if (item.type === QuoteSettingItemType.POLICY_DOCUMENT) {
        openDialogDeferred(() => setPolicyDocumentDialogOpen(true));
        return;
      }
      if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
        openDialogDeferred(() => {
          setEditingTextTemplateId(item.id);
          setTextTemplateDialogOpen(true);
        });
        return;
      }
      openDialogDeferred(() => {
        setEditingExternalLinkId(item.id);
        setExternalLinkDialogOpen(true);
      });
    },
    [openDialogDeferred],
  );

  const setDefault = React.useCallback(
    async (item: QuoteContentLibraryItem) => {
      if (item.type === QuoteSettingItemType.POLICY_DOCUMENT) {
        // Cannot set default without re-uploading the file; open the replace dialog
        openDialogDeferred(() => setPolicyDocumentDialogOpen(true));
        return;
      }
      try {
        if (item.type === QuoteSettingItemType.TEXT_TEMPLATE) {
          const detail = await APIClient.textTemplates.getById(item.id);
          await updateTextTemplate.mutateAsync({
            id: item.id,
            data: {
              name: detail.name,
              contentHtml: detail.contentHtml,
              defaultItem: true,
            },
          });
        } else {
          const detail = await APIClient.externalLinks.getById(item.id);
          await updateExternalLink.mutateAsync({
            id: item.id,
            data: {
              name: detail.name,
              externalUrl: detail.externalUrl,
              externalLinkText: detail.externalLinkText,
              defaultItem: true,
            },
          });
        }
        notifySuccess(`"${item.name}" set as default.`);
      } catch (err) {
        notifyError(extractErrorMessage(err));
      }
    },
    [openDialogDeferred, updateTextTemplate, updateExternalLink],
  );

  const remove = React.useCallback(
    (item: QuoteContentLibraryItem) => {
      const onSettled = {
        onSuccess: () => notifySuccess(`"${item.name}" deleted.`),
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (item.type === QuoteSettingItemType.POLICY_DOCUMENT) {
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
          setEditingTextTemplateId(null);
          setTextTemplateDialogOpen(true);
        } else if (type === QuoteSettingItemType.EXTERNAL_LINK) {
          setEditingExternalLinkId(null);
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
      id={editingTextTemplateId ?? undefined}
      dialogTitle={
        editingTextTemplateId !== null ? 'Edit Text Template' : 'Add Text Template'
      }
      dialogDescription="Text templates are available when staff compose quotes under Notes & Terms."
      open={textTemplateDialogOpen}
      onOpenChangeAction={(open) => {
        setTextTemplateDialogOpen(open);
        if (!open) {
          setTimeout(() => setEditingTextTemplateId(null), 100);
        }
      }}
      hideTrigger
      dialogWidth="700px"
    >
      <TextTemplateForm />
    </FormDialog>
  ) : null;

  const externalLinkDialog = externalLinkDialogOpen ? (
    <FormDialog
      id={editingExternalLinkId ?? undefined}
      dialogTitle={
        editingExternalLinkId !== null ? 'Edit External Link' : 'Add External Link'
      }
      dialogDescription="Link to policies hosted on SharePoint, Google Drive, or any external URL. Customers will see a clickable link on their quote."
      open={externalLinkDialogOpen}
      onOpenChangeAction={(open) => {
        setExternalLinkDialogOpen(open);
        if (!open) {
          setTimeout(() => setEditingExternalLinkId(null), 100);
        }
      }}
      hideTrigger
      dialogWidth="500px"
    >
      <ExternalLinkForm />
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
      <PolicyDocumentForm />
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
