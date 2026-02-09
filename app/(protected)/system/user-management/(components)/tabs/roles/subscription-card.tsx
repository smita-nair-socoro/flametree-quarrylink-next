'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const toneVariants = {
  essentials: {
    bg: 'bg-[#F3F4F6]',
    border: 'border-[#E5E7EB]',
    text: 'text-[#1E2939]',
  },
  plus: {
    bg: 'bg-[#DBEAFE]',
    border: 'border-[#BEDBFF]',
    text: 'text-[#193CB8]',
  },
  pro: {
    bg: 'bg-[#F3E8FF]',
    border: 'border-[#E9D4FF]',
    text: 'text-[#6E11B0]',
  },
} as const;

interface SubscriptionPlanCardProps {
  price: string;
  planName: string;
  description: string;
  tone: keyof typeof toneVariants;
  isSelected: boolean;
  onClick?: () => void;
}

export function SubscriptionPlanCard({
  price,
  planName,
  description,
  tone,
  isSelected = false,
  onClick,
}: SubscriptionPlanCardProps) {
  const toneStyle = toneVariants[tone];

  return (
    <button onClick={onClick} className="w-full text-left bg-transparent">
      <Card
        className={cn(
          'py-3 relative overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white',
          isSelected
            ? `bg-[#FAF5FF] border-2 border-[#AD46FF]`
            : 'border-border hover:border-purple-300',
          tone !== 'essentials' && 'opacity-50'
        )}
      >
        <CardContent className="px-3">
          <div>
            {/* Price */}
            <div className="flex items-baseline gap-1 justify-between">
              <div
                className={cn(
                  'flex items-baseline gap-1 rounded-sm px-1 py-0.5 border',
                  toneStyle.bg,
                  toneStyle.border
                )}
              >
                <span className={cn('text-[11px] font-medium', toneStyle.text)}>
                  {price}
                </span>
              </div>
              {isSelected && (
                <Crown className="h-[14px] w-[14px] text-[#9810FA]" />
              )}
            </div>

            {/* Plan Name */}
            <h3 className="text-xs font-semibold text-foreground mt-2">
              {planName}
            </h3>

            {/* Description */}
            <p className="font-normal text-muted-foreground leading-relaxed text-[11px]">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
