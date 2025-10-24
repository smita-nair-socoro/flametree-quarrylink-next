'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface UpgradeFeaturesCardProps {
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
    <Card className="w-full border-[#E9D4FF] rounded-[12.75px]" style={{ background: 'linear-gradient(to right, #FAF5FF, #FFF6FF)' }}>
      <CardContent className="px-[22px]">
        <div className="flex items-center justify-between gap-4">
          {/* Left Content */}
          <div className="space-y-1">
            <h3 className="text-[14px] font-semibold text-[#101828]">
              {title}
            </h3>
            <p className="text-[12.1078px] text-[#4A5565]">{description}</p>
          </div>

          {/* Right Button */}
          <Button
            onClick={onUpgrade}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 h-[31.5px] rounded-[6.75px] px-[14px] py-[7px] text-[12.3px] font-medium leading-[17.5px] flex items-center gap-2"
          >
            {buttonText}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
