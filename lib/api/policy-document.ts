import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { PolicyDocumentKeys } from './keys';
import type { PolicyDocumentMetadata } from '../types/terms-conditions';

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
