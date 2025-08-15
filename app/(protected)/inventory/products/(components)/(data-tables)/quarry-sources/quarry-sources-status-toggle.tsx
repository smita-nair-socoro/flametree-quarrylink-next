'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { ProductKeys } from '@/lib/api/query_keys';
import { notifyError, notifySuccess } from '@/lib/toast';

interface StatusToggleProps {
  priceId: number;
  currentStatus: 'ACTIVE' | 'INACTIVE' | string;
}

export function StatusToggle({ priceId, currentStatus }: StatusToggleProps) {
  const queryClient = useQueryClient();

  const [isActive, setIsActive] = React.useState(currentStatus === 'ACTIVE');

  React.useEffect(() => {
    setIsActive(currentStatus === 'ACTIVE');
  }, [currentStatus]);

  const { mutate: patchStatus, isPending } = useMutation({
    mutationFn: (newStatus: 'ACTIVE' | 'INACTIVE') =>
      APIClient.quarries.patchQuarryProductPrice(priceId, {
        status: newStatus,
      }),
    onSuccess: () => {
      notifySuccess('Status updated successfully', { dismissible: true });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.all,
      });
    },
    onError: (error) => {
      setIsActive((prev) => !prev);
      notifyError('Failed to update status', { description: error.message });
    },
  });

  const handleToggle = (checked: boolean) => {
    setIsActive(checked);
    const newStatus = checked ? 'ACTIVE' : 'INACTIVE';
    patchStatus(newStatus);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className="text-sm text-muted-foreground">
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
}
