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
        'relative overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white',
        isSelected
          ? `bg-[#FAF5FF] border-2 border-[#AD46FF]`
          : 'border-border hover:border-purple-300'
      )}
    >
      <CardContent className="px-6">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1 justify-between">
            <div
              className={cn(
                'flex items-baseline gap-1 rounded-md px-2 py-1 border',
                priceBgColor
              )}
              style={{
                borderColor: priceBorderColor?.replace('border-[', '').replace(']', ''),
              }}
            >
              <span className={cn('text-1xl font-bold', priceColor)}>
                {price}
              </span>
              <span className={cn('text-sm', priceColor)}>/ mo</span>
            </div>
            {isSelected && (
              <Crown className="h-5 w-5 text-purple-600 fill-purple-200" />
            )}
          </div>

          {/* Plan Name */}
          <h3 className="text-lg font-semibold text-foreground">{planName}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Max Users */}
          <p className="text-sm font-medium text-foreground">{maxUsers}</p>
        </div>
      </CardContent>
    </Card>
  );
}
