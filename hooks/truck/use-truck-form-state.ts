import { useQuery } from '@tanstack/react-query';
import { TruckByIdQueryOptions } from '@/lib/api/truck';

export function useTruckFormState(id: number | undefined, isEditing: boolean) {
  const { data: truckData } = useQuery({
    ...TruckByIdQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });

  return { truckData };
}
