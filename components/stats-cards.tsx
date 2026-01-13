'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
}

export function StatsCards({
  cards,
  isLoading = false,
  mobileGridCols = 2,
  desktopGridCols = 4,
}: StatsCardsProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const loadingCount = cards.length || 4;
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
      <Card className="overflow-hidden py-3 gap-3">
        <div
          className="flex items-center justify-between px-6 mb-0 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-base font-medium">Quick Insights</h3>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {isExpanded && (
          <div className="border-t px-4 pt-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: loadingCount }).map((_, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <Skeleton className="h-4 w-20" />
                      <div className="ml-auto flex items-center gap-2">
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card
                      key={card.title}
                      className="py-2 px-3 border shadow-sm bg-[#F9FAFB]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ${card.iconBgColor}`}
                        >
                          <Icon
                            className={`h-3.5 w-3.5 opacity-70 ${card.iconColor}`}
                          />
                        </div>
                        <span className="text-[#737373] text-xs flex-shrink-0">
                          {getShortTitle(card.title)}
                        </span>
                        <div className="ml-auto flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-bold flex-shrink-0">
                            {card.value}
                          </span>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <span
                                className={`text-xs ${card.descriptionColor} truncate`}
                              >
                                {card.description}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent variant="white">
                              <p>{card.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </Card>
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
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <span className="font-medium leading-tight text-[#737373] text-sm truncate">
                          {card.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent variant="white">
                        <p>{card.title}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${card.iconBgColor}`}
                    >
                      <Icon
                        className={`h-5 w-5 opacity-70 ${card.iconColor}`}
                      />
                    </div>
                  </div>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div className="text-3xl font-bold pt-1 truncate">
                        {card.value}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent variant="white">
                      <p>{String(card.value)}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        className={`text-sm font-normal ${card.descriptionColor} truncate`}
                      >
                        {card.description}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent variant="white">
                      <p>{card.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );
}
