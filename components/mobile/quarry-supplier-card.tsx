'use client';

import * as React from 'react';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '../ui/card';
import { TableBadges } from '../table-badges';
import { QuarrySupplierTableActions } from '@/app/(protected)/inventory/quarries-suppliers/(components)/(data-tables)/quarries/quarry-supplier-table-actions';
import { Quarry } from '@/lib/types/quarry';

export interface QuarrySupplierCardProps {
  quarrySupplier: Quarry;
}

export function QuarrySupplierCard({
  quarrySupplier,
}: QuarrySupplierCardProps) {
  const suburb =
    quarrySupplier.suburb || quarrySupplier.address?.suburb || '';

  return (
    <Card className="gap-3 py-4 w-full">
      <CardHeader className="pb-0 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle className="text-base font-semibold text-gray-900 truncate">
            {quarrySupplier.name}
          </CardTitle>
        </div>
        <CardAction>
          <QuarrySupplierTableActions quarrySupplier={quarrySupplier} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-wrap items-center gap-2">
          <TableBadges
            names={[quarrySupplier.quarrySupplierType]}
            visibleCount={1}
          />
          {quarrySupplier.status && (
            <TableBadges names={[quarrySupplier.status]} visibleCount={1} />
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Suburb</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {suburb || '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {quarrySupplier.email || '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Phone</span>
            </div>
            <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
              {quarrySupplier.phone || '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
