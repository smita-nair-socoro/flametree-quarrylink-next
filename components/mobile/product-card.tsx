'use client';

import * as React from 'react';
import { Tag, Box } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { TableBadges } from '../table-badges';
import { ProductDetails } from '@/lib/types/product';
import { ProductTableActions } from '@/app/(protected)/inventory/products/(components)/(data-tables)/products/product-table-actions';

export interface ProductCardProps {
  product: ProductDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const { productName, productCode, status, material } = product;
  const materialName = material?.name || '';

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="pb-0 gap-1">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-base font-semibold text-gray-900">
            {productName}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span>{productCode}</span>
          </div>
        </div>
        <CardAction>
          <ProductTableActions product={product} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Badges */}
        <div className="flex items-center gap-2">
          {status && <TableBadges names={[status]} visibleCount={1} />}
          {materialName && (
            <TableBadges names={[materialName]} visibleCount={1} />
          )}
        </div>

        {/* Fields with icons */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Box className="h-4 w-4" />
              <span>Material</span>
            </div>
            <span className="text-gray-900 font-medium">{materialName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
