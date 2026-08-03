import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { APIClient } from './APIClient';
import {
  ExternalLinkKeys,
  TextTemplateKeys,
  PolicyDocumentKeys,
  QuoteContentLibraryKeys,
  QuoteEditorContentKeys,
} from './keys';
import type {
  QuoteExternalLinkRequestDto,
  QuoteTextTemplateRequestDto,
  PolicyDocumentMetadata,
  QuoteContentSelectionRequestDto,
} from '../types/terms-conditions';

export const QuoteContentLibraryListQueryOptions = (params?: {
  sortBy?: string;
  direction?: string;
}) =>
  queryOptions({
    queryKey: QuoteContentLibraryKeys.list(params),
    queryFn: () => APIClient.quoteContentLibrary.getAll(params),
    staleTime: 5_000,
  });

export const ExternalLinkDetailQueryOptions = (id: number, enabled = true) =>
  queryOptions({
    queryKey: ExternalLinkKeys.detail(id),
    queryFn: () => APIClient.externalLinks.getById(id),
    staleTime: 5_000,
    enabled: enabled && id > 0,
  });

export const useCreateExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuoteExternalLinkRequestDto) =>
      APIClient.externalLinks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

export const useUpdateExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: QuoteExternalLinkRequestDto;
    }) => APIClient.externalLinks.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
      queryClient.invalidateQueries({ queryKey: ExternalLinkKeys.detail(id) });
    },
  });
};

export const useDeleteExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.externalLinks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

export const TextTemplateDetailQueryOptions = (id: number, enabled = true) =>
  queryOptions({
    queryKey: TextTemplateKeys.detail(id),
    queryFn: () => APIClient.textTemplates.getById(id),
    staleTime: 5_000,
    enabled: enabled && id > 0,
  });

export const useCreateTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuoteTextTemplateRequestDto) =>
      APIClient.textTemplates.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

export const useUpdateTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: QuoteTextTemplateRequestDto;
    }) => APIClient.textTemplates.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
      queryClient.invalidateQueries({ queryKey: TextTemplateKeys.detail(id) });
    },
  });
};

export const useDeleteTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.textTemplates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

// Returns the single tenant policy document, or null if none exists yet.
// There's only ever one per tenant, so this doubles as both the "does a
// document already exist" check and the detail fetch for the replace dialog.
export const PolicyDocumentQueryOptions = () =>
  queryOptions({
    queryKey: PolicyDocumentKeys.list(),
    queryFn: () => APIClient.policyDocuments.getAll(),
    staleTime: 5_000,
  });

export const PolicyDocumentViewQueryOptions = (id: number) =>
  queryOptions({
    queryKey: PolicyDocumentKeys.view(id),
    queryFn: () => APIClient.policyDocuments.view(id),
    staleTime: 5_000,
  });

export const useCreatePolicyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      metadata,
      file,
    }: {
      metadata: PolicyDocumentMetadata;
      file: File;
    }) => APIClient.policyDocuments.create(metadata, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PolicyDocumentKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

export const useUpdatePolicyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      metadata,
      file,
    }: {
      id: number;
      metadata: PolicyDocumentMetadata;
      file: File;
    }) => APIClient.policyDocuments.update(id, metadata, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PolicyDocumentKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

export const useDeletePolicyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.policyDocuments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PolicyDocumentKeys.list() });
      queryClient.invalidateQueries({ queryKey: QuoteContentLibraryKeys.all });
    },
  });
};

// Quote editor "Quote content" panel - the active library items available to
// attach to a quote, plus the quote's selection state and customer notes.
export const QuoteEditorContentQueryOptions = (quoteId: number) =>
  queryOptions({
    queryKey: QuoteEditorContentKeys.detail(quoteId),
    queryFn: () => APIClient.quoteEditorContent.get(quoteId),
    staleTime: 5_000,
    enabled: quoteId > 0,
  });

export const useUpdateQuoteEditorContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quoteId,
      data,
    }: {
      quoteId: number;
      data: QuoteContentSelectionRequestDto;
    }) => APIClient.quoteEditorContent.update(quoteId, data),
    onSuccess: (_, { quoteId }) => {
      queryClient.invalidateQueries({
        queryKey: QuoteEditorContentKeys.detail(quoteId),
      });
    },
  });
};
