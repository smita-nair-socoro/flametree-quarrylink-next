import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { DocketKeys } from './keys';
import type { DOCKET_STATUS } from '../types/docket-enums';

/**
 * Mutation hook for updating a docket's status.
 * Automatically invalidates the docket cache on success.
 */
export const useUpdateDocketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      docketId,
      docketStatus,
      reason,
      notes,
      latitude,
      longitude,
    }: {
      docketId: number;
      docketStatus: DOCKET_STATUS;
      reason?: string;
      notes?: string;
      latitude?: string;
      longitude?: string;
    }) => APIClient.dockets.updateStatus(docketId, { docketStatus, reason, notes, latitude, longitude }),

    onSuccess: (_data, { docketId }) => {
      queryClient.invalidateQueries({ queryKey: DocketKeys.detail(docketId) });
      queryClient.invalidateQueries({ queryKey: DocketKeys.list() });
      queryClient.invalidateQueries({ queryKey: DocketKeys.all });
    },
  });
};
