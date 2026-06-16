import { useMutation, useQuery } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { MyobKeys } from './keys';

export const useConnectMyob = () =>
  useMutation({
    mutationKey: MyobKeys.connect(),
    mutationFn: (userEmail: string) => APIClient.myob.connect(userEmail),
  });

export const useMyobStatus = () =>
  useQuery({
    queryKey: MyobKeys.status(),
    queryFn: () => APIClient.myob.getStatus(),
  });
