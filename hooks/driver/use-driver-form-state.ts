import { useQuery } from '@tanstack/react-query';
import { DriverByIdQueryOptions } from '@/lib/api/driver';

export function useDriverFormState(id: number | undefined, isEditing: boolean) {
  const { data: driverData } = useQuery({
    ...DriverByIdQueryOptions(id ?? 0),
    enabled: isEditing && !!id,
  });

  return { driverData };
}
