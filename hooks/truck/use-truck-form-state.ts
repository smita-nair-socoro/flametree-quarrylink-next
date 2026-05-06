import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TruckByIdQueryOptions } from '@/lib/api/truck';
import { useTruckStore } from '@/app/stores/truck-store';
import { useClientStore } from '@/app/stores/client-store';
import { TRUCK_BUSINESS_TYPE } from '@/lib/types/truck-enums';

export function useTruckFormState(id: number | undefined, isEditing: boolean) {
  const { data: truckData } = useQuery({
    ...TruckByIdQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });

  const setSelectedTruck = useTruckStore((s) => s.setSelectedTruck);
  const businessName = useClientStore((s) => s.getBusinessName());

  // Backend doesn't send truckBusinessType — derive it from haulier name vs tenant business name
  // and push onto the store so FormDialog's secondary badge can render.
  React.useEffect(() => {
    if (!truckData?.id) return;
    const haulierName = truckData.haulier?.haulierName;
    const truckBusinessType: TRUCK_BUSINESS_TYPE =
      haulierName && businessName && haulierName === businessName
        ? TRUCK_BUSINESS_TYPE.INTERNAL
        : TRUCK_BUSINESS_TYPE.EXTERNAL;

    const current = useTruckStore.getState().selectedTruck;
    if (current?.id !== truckData.id) return;
    if (current.truckBusinessType === truckBusinessType) return;
    setSelectedTruck({ ...current, truckBusinessType });
  }, [truckData, businessName, setSelectedTruck]);

  return { truckData };
}
