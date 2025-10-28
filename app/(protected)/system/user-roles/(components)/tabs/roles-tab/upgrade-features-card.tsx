'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UpgradeFeaturesCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onUpgrade?: () => void;
}

export function UpgradeFeaturesCard({
  title,
  description,
  buttonText = 'Upgrade Plan',
  onUpgrade,
}: UpgradeFeaturesCardProps) {
  return (
    <Card
      className={cn(
        'w-full border-[#E9D4FF] rounded-[13px]',
        'bg-gradient-to-r from-[#FAF5FF] to-[#FFF6FF]'
      )}
    >
      <CardContent className="px-[22px]">
        <div className="flex items-center justify-between gap-4">
          {/* Left Content */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[#101828]">{title}</h3>
            <p className="text-xs text-[#4A5565]">{description}</p>
          </div>

          {/* Right Button */}
          <Button
            onClick={onUpgrade}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 h-8 rounded-md px-4 py-2 text-xs font-medium flex items-center gap-2"
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
