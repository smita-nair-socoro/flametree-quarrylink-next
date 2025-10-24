'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionPlanCardProps {
  price: string;
  planName: string;
  description: string;
  maxUsers: string;
  featured?: boolean;
  priceColor?: string;
  priceBgColor?: string;
  priceBorderColor?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function SubscriptionPlanCard({
  price,
  planName,
  description,
  maxUsers,
  priceColor,
  priceBgColor,
  priceBorderColor,
  isSelected = false,
  onClick,
}: SubscriptionPlanCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'py-3 relative overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white',
        isSelected
          ? `bg-[#FAF5FF] border-2 border-[#AD46FF]`
          : 'border-border hover:border-purple-300'
      )}
    >
      <CardContent className="px-3">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1 justify-between">
            <div
              className="flex items-baseline gap-1 rounded-md px-1.5 py-0.5 border"
              style={{
                backgroundColor: priceBgColor,
                borderColor: priceBorderColor,
              }}
            >
              <span
                className="text-[10.5px] font-medium"
                style={{ color: priceColor }}
              >
                {price}
              </span>
              <span
                className="text-[10.5px] font-medium"
                style={{ color: priceColor }}
              >
                / mo
              </span>
            </div>
            {isSelected && (
              <Crown className="h-[14px] w-[14px] text-[#9810FA]" />
            )}
          </div>

          {/* Plan Name */}
          <h3 className="text-lg font-semibold text-foreground text-[12.3px]">
            {planName}
          </h3>

          {/* Description */}
          <p className="font-normal text-muted-foreground leading-relaxed text-[10.5px]">
            {description}
          </p>

          {/* Max Users */}
          <p className="font-medium text-foreground text-[10.5px]">
            {maxUsers}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
