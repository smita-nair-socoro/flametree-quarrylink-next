'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface StatsCardData {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  descriptionColor: string;
}

interface StatsCardsProps {
  cards: StatsCardData[];
  isLoading?: boolean;
  mobileGridCols?: number;
  desktopGridCols?: number;
  skeletonCount?: number;
}

export function StatsCards({
  cards,
  isLoading = false,
  mobileGridCols = 2,
  desktopGridCols = 4,
  skeletonCount,
}: StatsCardsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const loadingCount = skeletonCount ?? (cards.length || 4);

  // Map numeric values to actual Tailwind classes
  const getGridCols = (cols: number) => {
    const gridMap: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    };
    return gridMap[cols] || 'grid-cols-4';
  };

  const gridColsClass = isDesktop
    ? getGridCols(desktopGridCols)
    : getGridCols(mobileGridCols);

  return (
    <div className={`grid ${gridColsClass} gap-4`}>
      {isLoading
        ? Array.from({ length: loadingCount }).map((_, index) => (
            <Card key={index} className="p-5">
              <CardContent className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-9 w-[100px] mt-4" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))
        : cards.map((card) => {
            const Icon = card.icon;

            // Text sizes based on device
            const titleTextSize = isDesktop ? 'text-sm' : 'text-xs';
            const valueTextSize = isDesktop ? 'text-3xl' : 'text-2xl';
            const descriptionTextSize = isDesktop ? 'text-sm' : 'text-xs';
            const iconSize = isDesktop ? 'h-5 w-5' : 'h-4 w-4';

            return (
              <Card key={card.title} className="p-5 overflow-hidden">
                <CardContent className="p-2 space-y-1">
                  <div className="flex justify-between gap-2 items-start">
                    <span
                      className={`font-medium leading-tight text-[#737373] ${titleTextSize} break-words`}
                    >
                      {card.title}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${card.iconBgColor}`}
                    >
                      <Icon
                        className={`opacity-70 ${card.iconColor} ${iconSize}`}
                      />
                    </div>
                  </div>
                  <div className={`font-bold ${valueTextSize} pt-1 break-all`}>
                    {card.value}
                  </div>
                  <div
                    className={`font-normal ${card.descriptionColor} ${descriptionTextSize} truncate`}
                  >
                    {card.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );
}
