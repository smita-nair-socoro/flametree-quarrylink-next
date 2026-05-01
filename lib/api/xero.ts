import { useMutation, useQuery } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { XeroKeys } from './keys';
export const useConnectXero = () =>
  useMutation({
    mutationKey: XeroKeys.connect(),
    mutationFn: (userEmail: string) => APIClient.xero.connect(userEmail),
  });

export const useXeroStatus = () =>
  useQuery({
    queryKey: XeroKeys.status(),
    queryFn: () => APIClient.xero.getStatus(),
  });
