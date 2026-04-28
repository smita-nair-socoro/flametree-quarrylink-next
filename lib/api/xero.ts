import { useMutation } from '@tanstack/react-query';
import { APIClient } from './APIClient';
import { XeroKeys } from './keys';
import type { XeroConnectRequestDTO } from '../types/xero';

export const useConnectXero = () =>
  useMutation({
    mutationKey: XeroKeys.connect(),
    mutationFn: (data: XeroConnectRequestDTO) => APIClient.xero.connect(data),
  });
