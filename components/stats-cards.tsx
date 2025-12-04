'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = React.useState(true);

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

  // Helper to extract short title from full title
  const getShortTitle = (title: string) => {
    // Extract key words from titles
    const titleMap: Record<string, string> = {
      'Total Customers': 'Total',
      'Active Customers': 'Active',
      'Total Business Customers': 'Business',
      'Total Individual Customers': 'Individual',
      'Total Quotations': 'Total',
      'Pending Approval': 'Pending',
      'Total Quote Value': 'Value',
      'Expiring Soon': 'Expiring',
      'Most Quoted Product': 'Top Product',
      'Unavailable Products': 'Unavailable',
      'Average Product Margin': 'Avg Margin',
      'Total Products': 'Total',
      'Monthly Value - Suppliers': 'Suppliers',
      'Top Supplier': 'Top Supplier',
      'Monthly Value - Quarries': 'Quarries',
      'Top Quarry': 'Top Quarry',
    };
    return titleMap[title] || title.split(' ')[0];
  };

  // Mobile view - Quick Insights collapsible list
  if (!isDesktop) {
    return (
      <Card className="overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-lg font-semibold">Quick Insights</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {isExpanded && (
          <div className="border-t">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: loadingCount }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-20" />
                    <div className="ml-auto flex items-center gap-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="flex items-center gap-3 p-4"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${card.iconBgColor}`}
                      >
                        <Icon className={`h-5 w-5 opacity-70 ${card.iconColor}`} />
                      </div>
                      <span className="text-[#737373] text-base">
                        {getShortTitle(card.title)}
                      </span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xl font-bold">{card.value}</span>
                        <span
                          className={`text-sm ${card.descriptionColor} whitespace-nowrap`}
                        >
                          {card.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // Desktop view - Grid of cards
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

            return (
              <Card key={card.title} className="p-5 overflow-hidden">
                <CardContent className="p-2 space-y-1">
                  <div className="flex justify-between gap-2 items-start">
                    <span className="font-medium leading-tight text-[#737373] text-sm break-words">
                      {card.title}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${card.iconBgColor}`}
                    >
                      <Icon className={`h-5 w-5 opacity-70 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold pt-1 break-all">
                    {card.value}
                  </div>
                  <div
                    className={`text-sm font-normal ${card.descriptionColor} truncate`}
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
