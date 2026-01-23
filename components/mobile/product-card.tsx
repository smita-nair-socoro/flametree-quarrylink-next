'use client';

import * as React from 'react';
import { MoreHorizontal, Eye, Tag, Box } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { TableBadges } from '../table-badges';
import { PRODUCT_STATUS } from '@/lib/types/product-enums';

export interface ProductCardProps {
  id?: number;
  productName: string;
  productCode: string;
  status: PRODUCT_STATUS;
  materialName: string;
  onViewDetails?: () => void;
}

export function ProductCard({
  productName,
  productCode,
  status,
  materialName,
  onViewDetails,
}: ProductCardProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleViewDetails = () => {
    setDropdownOpen(false);
    onViewDetails?.();
  };

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
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
