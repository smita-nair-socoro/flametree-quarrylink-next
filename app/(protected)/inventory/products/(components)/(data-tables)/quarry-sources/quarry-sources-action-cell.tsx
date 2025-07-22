'use client';

import * as React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { centsToDollars } from '@/lib/utils/currency';
import { UpdateQuarryProductPriceDialogForm } from '../../forms/update-quarry-product-price-dialog-form';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIClient } from '@/lib/api/APIClient';
import { ProductKeys } from '@/lib/api/query_keys';
import { notifyError, notifySuccess } from '@/lib/toast';
import { Quarry, QuarryProductPrice } from '@/lib/types/quarry';

interface QuarrySourcesActionProps {
  quarry: Quarry;
  quarry_product_price: QuarryProductPrice;
  quarry_product_id: number;
}

export function QuarrySourcesActionCell({
  quarry,
  quarry_product_price,
  quarry_product_id,
}: QuarrySourcesActionProps) {
  const queryClient = useQueryClient();

  const cost = centsToDollars(quarry_product_price.cost_price);
  const sell = centsToDollars(quarry_product_price.sell_price);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);

  const { mutate: priceDeleteMutation } = useMutation({
    mutationFn: () =>
      APIClient.quarries.deleteProductFromQuarry(quarry_product_id),
    onSuccess: () => {
      notifySuccess(`Product delete successfully from: ${quarry.name}`, {
        dismissible: true,
      });
      queryClient.invalidateQueries({
        queryKey: ProductKeys.all,
      });
    },
    onError: (error, variables) => {
      setDeleteOpen((prev) => !prev);
      notifyError(`Failed to delete price product from: ${variables}`, {
        description: error.message,
      });
    },
  });

  function handleDeleteConfirm() {
    priceDeleteMutation();
  }

  return (
    <div className="flex w-full justify-center space-x-2">
      <Edit2
        size={16}
        className="cursor-pointer hover:text-blue-600"
        onClick={() => setIsDialogOpen(true)}
      />
      <Trash2
        size={16}
        className="cursor-pointer text-red-500 hover:text-red-700"
        onClick={() => setDeleteOpen(true)}
      />

      <UpdateQuarryProductPriceDialogForm
        quarryPriceId={quarry_product_price.id}
        open={isDialogOpen}
        onOpenChangeAction={setIsDialogOpen}
        current_sell_price={sell}
        current_cost_price={cost}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onOpenChangeAction={setDeleteOpen}
        title="Confirm Deletion"
        description="Are you sure you want to remove this site address?"
        note="Note: Removing this site address will not affect existing records in quotes, jobs, and dockets."
        onConfirmAction={handleDeleteConfirm}
      />
    </div>
  );
}
