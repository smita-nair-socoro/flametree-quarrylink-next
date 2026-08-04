'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { TextTemplateFormSchema } from '@/app/(protected)/system/user-management/(components)/forms/schemas/text-template-form-schema';
import { ExternalLinkFormSchema } from '@/app/(protected)/system/user-management/(components)/forms/schemas/external-link-form-schema';
import { PolicyDocumentFormSchema } from '@/app/(protected)/system/user-management/(components)/forms/schemas/policy-document-form-schema';
import {
  TextTemplateDetailQueryOptions,
  useCreateTextTemplate,
  useUpdateTextTemplate,
  ExternalLinkDetailQueryOptions,
  useCreateExternalLink,
  useUpdateExternalLink,
  PolicyDocumentQueryOptions,
  useCreatePolicyDocument,
  useUpdatePolicyDocument,
} from '@/lib/api/quote-profile-content';

type TextTemplateFormValues = z.infer<typeof TextTemplateFormSchema>;
type ExternalLinkFormValues = z.infer<typeof ExternalLinkFormSchema>;
type PolicyDocumentFormValues = z.infer<typeof PolicyDocumentFormSchema>;

interface UseTextTemplateFormStateOptions {
  id?: number;
  isEditing: boolean;
  form: UseFormReturn<TextTemplateFormValues>;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Manages text template data fetching, dirty tracking, and submit flow.
 */
export function useTextTemplateFormState({
  id,
  isEditing,
  form,
  onDirtyChange,
  onSuccess,
}: UseTextTemplateFormStateOptions) {
  const { data: editingItem, isPending: isLoadingDetail } = useQuery(
    TextTemplateDetailQueryOptions(id ?? 0, isEditing),
  );

  const createTextTemplate = useCreateTextTemplate();
  const updateTextTemplate = useUpdateTextTemplate();
  const isSubmitting =
    createTextTemplate.isPending || updateTextTemplate.isPending;

  React.useEffect(() => {
    if (isEditing && editingItem) {
      form.reset({
        name: editingItem.name,
        content: editingItem.contentHtml,
        defaultItem: editingItem.defaultItem,
      });
    }
  }, [isEditing, editingItem, form]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const onSubmit = React.useCallback(
    (values: TextTemplateFormValues) => {
      const data = {
        name: values.name,
        contentHtml: values.content,
        defaultItem: values.defaultItem,
      };
      const onSettled = {
        onSuccess: () => {
          notifySuccess(
            isEditing ? `"${values.name}" updated.` : `"${values.name}" added.`,
          );
          onSuccess?.();
        },
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (isEditing && id) {
        updateTextTemplate.mutate({ id, data }, onSettled);
      } else {
        createTextTemplate.mutate(data, onSettled);
      }
    },
    [isEditing, id, updateTextTemplate, createTextTemplate, onSuccess],
  );

  return {
    isLoadingDetail: isEditing && isLoadingDetail,
    isSubmitting,
    onSubmit,
  };
}

interface UseExternalLinkFormStateOptions {
  id?: number;
  isEditing: boolean;
  form: UseFormReturn<ExternalLinkFormValues>;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Manages external link data fetching, dirty tracking, and submit flow.
 */
export function useExternalLinkFormState({
  id,
  isEditing,
  form,
  onDirtyChange,
  onSuccess,
}: UseExternalLinkFormStateOptions) {
  const { data: editingItem, isPending: isLoadingDetail } = useQuery(
    ExternalLinkDetailQueryOptions(id ?? 0, isEditing),
  );

  const createExternalLink = useCreateExternalLink();
  const updateExternalLink = useUpdateExternalLink();
  const isSubmitting =
    createExternalLink.isPending || updateExternalLink.isPending;

  React.useEffect(() => {
    if (isEditing && editingItem) {
      form.reset({
        name: editingItem.name,
        url: editingItem.externalUrl,
        defaultItem: editingItem.defaultItem,
      });
    }
  }, [isEditing, editingItem, form]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const onSubmit = React.useCallback(
    (values: ExternalLinkFormValues) => {
      const data = {
        name: values.name,
        externalUrl: values.url,
        externalLinkText: values.name,
        defaultItem: values.defaultItem,
      };
      const onSettled = {
        onSuccess: () => {
          notifySuccess(
            isEditing ? `"${values.name}" updated.` : `"${values.name}" added.`,
          );
          onSuccess?.();
        },
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };
      if (isEditing && id) {
        updateExternalLink.mutate({ id, data }, onSettled);
      } else {
        createExternalLink.mutate(data, onSettled);
      }
    },
    [isEditing, id, updateExternalLink, createExternalLink, onSuccess],
  );

  return {
    isLoadingDetail: isEditing && isLoadingDetail,
    isSubmitting,
    onSubmit,
  };
}

interface UsePolicyDocumentFormStateOptions {
  form: UseFormReturn<PolicyDocumentFormValues>;
  onDirtyChange?: (isDirty: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Manages the tenant's single policy document: fetch, dirty tracking, and
 * upload/replace submit flow.
 */
export function usePolicyDocumentFormState({
  form,
  onDirtyChange,
  onSuccess,
}: UsePolicyDocumentFormStateOptions) {
  const { data: currentDocument, isPending: isLoadingDetail } = useQuery(
    PolicyDocumentQueryOptions(),
  );
  const isReplacing = Boolean(currentDocument);

  const createPolicyDocument = useCreatePolicyDocument();
  const updatePolicyDocument = useUpdatePolicyDocument();
  const isSubmitting =
    createPolicyDocument.isPending || updatePolicyDocument.isPending;

  React.useEffect(() => {
    if (currentDocument) {
      form.reset({ name: currentDocument.name, file: undefined });
    }
  }, [currentDocument, form]);

  React.useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const onSubmit = React.useCallback(
    (values: PolicyDocumentFormValues) => {
      if (!values.file) return;

      const metadata = { name: values.name, defaultItem: true };
      const file = values.file;
      const onSettled = {
        onSuccess: () => {
          notifySuccess(`"${values.name}" ${isReplacing ? 'updated' : 'uploaded'}.`);
          onSuccess?.();
        },
        onError: (err: unknown) => notifyError(extractErrorMessage(err)),
      };

      if (currentDocument) {
        updatePolicyDocument.mutate(
          { id: currentDocument.id, metadata, file },
          onSettled,
        );
      } else {
        createPolicyDocument.mutate({ metadata, file }, onSettled);
      }
    },
    [currentDocument, isReplacing, updatePolicyDocument, createPolicyDocument, onSuccess],
  );

  return {
    currentDocument,
    isReplacing,
    isLoadingDetail,
    isSubmitting,
    onSubmit,
  };
}
