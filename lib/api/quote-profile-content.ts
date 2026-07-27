import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { ExternalLinkKeys, TextTemplateKeys, PolicyDocumentKeys } from './keys';
import type {
  QuoteExternalLinkRequestDto,
  QuoteTextTemplateRequestDto,
  PolicyDocumentMetadata,
} from '../types/terms-conditions';

export const ExternalLinkListQueryOptions = () =>
  queryOptions({
    queryKey: ExternalLinkKeys.list(),
    queryFn: () => APIClient.externalLinks.getAll(),
    staleTime: 5_000,
  });

export const useCreateExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuoteExternalLinkRequestDto) =>
      APIClient.externalLinks.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ExternalLinkKeys.list() });
    },
  });
};

export const useUpdateExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuoteExternalLinkRequestDto }) =>
      APIClient.externalLinks.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ExternalLinkKeys.list() });
    },
  });
};

export const useDeleteExternalLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.externalLinks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ExternalLinkKeys.list() });
    },
  });
};

export const TextTemplateListQueryOptions = () =>
  queryOptions({
    queryKey: TextTemplateKeys.list(),
    queryFn: () => APIClient.textTemplates.getAll(),
    staleTime: 5_000,
  });

export const useCreateTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuoteTextTemplateRequestDto) =>
      APIClient.textTemplates.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TextTemplateKeys.list() });
    },
  });
};

export const useUpdateTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuoteTextTemplateRequestDto }) =>
      APIClient.textTemplates.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TextTemplateKeys.list() });
    },
  });
};

export const useDeleteTextTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.textTemplates.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TextTemplateKeys.list() });
    },
  });
};

// Returns the single tenant policy document, or null if none exists yet.
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
    mutationFn: ({ metadata, file }: { metadata: PolicyDocumentMetadata; file: File }) =>
      APIClient.policyDocuments.create(metadata, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PolicyDocumentKeys.list() });
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
    },
  });
};

export const useDeletePolicyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => APIClient.policyDocuments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PolicyDocumentKeys.list() });
    },
  });
};
