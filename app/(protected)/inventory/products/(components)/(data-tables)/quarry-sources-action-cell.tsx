'use client';

import * as React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { centsToDollars } from '@/lib/utils';
import { UpdateQuarryProductPriceDialogForm } from '../update-quarry-product-price-dialog-form';

interface QuarrySourcesActionProps {
  id: number;
  cost_price: number;
  sell_price: number;
}

export function QuarrySourcesActionCell({
  id,
  cost_price,
  sell_price,
}: QuarrySourcesActionProps) {
  const cost = centsToDollars(cost_price);
  const sell = centsToDollars(sell_price);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
        onClick={() => setIsDialogOpen(true)}
      />

      <UpdateQuarryProductPriceDialogForm
        quarryPriceId={id}
        open={isDialogOpen}
        onOpenChangeAction={setIsDialogOpen}
        current_sell_price={sell}
        current_cost_price={cost}
      />
    </div>
  );
}
