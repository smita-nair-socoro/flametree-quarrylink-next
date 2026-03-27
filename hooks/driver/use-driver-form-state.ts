import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DriversListQueryOptions } from '@/lib/api/driver';

export function useDriverFormState(id: number | undefined, isEditing: boolean) {
  const { data: driversData } = useQuery(DriversListQueryOptions());

  const driverData = React.useMemo(
    () =>
      isEditing && id
        ? (driversData ?? []).find((d) => d.id === id)
        : undefined,
    [driversData, id, isEditing],
  );

  return { driverData };
}
