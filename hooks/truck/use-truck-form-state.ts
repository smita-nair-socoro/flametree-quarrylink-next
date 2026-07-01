import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TruckByIdQueryOptions } from '@/lib/api/truck';
import { useTruckStore } from '@/app/stores/truck-store';
import { useTenantStore } from '@/app/stores/tenant-store';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';
import { isInternalHaulier } from '@/lib/utils/haulier-helper';

export function useTruckFormState(id: number | undefined, isEditing: boolean) {
  const { data: truckData } = useQuery({
    ...TruckByIdQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });

  const setSelectedTruck = useTruckStore((s) => s.setSelectedTruck);
  const tenantEmail = useTenantStore((s) => s.tenantEmail);

  // Backend doesn't send truckBusinessType — derive it from haulier email vs tenant email
  // and push onto the store so FormDialog's secondary badge can render.
  React.useEffect(() => {
    if (!truckData?.id) return;
    const truckBusinessType: TRUCK_BUSINESS_TYPE = isInternalHaulier(
      truckData.haulier?.emailAddress,
      tenantEmail,
    )
      ? TRUCK_BUSINESS_TYPE.INTERNAL
      : TRUCK_BUSINESS_TYPE.EXTERNAL;

    const current = useTruckStore.getState().selectedTruck;
    if (current?.id !== truckData.id) return;
    if (current.truckBusinessType === truckBusinessType) return;
    setSelectedTruck({ ...current, truckBusinessType });
  }, [truckData, tenantEmail, setSelectedTruck]);

  return { truckData };
}
