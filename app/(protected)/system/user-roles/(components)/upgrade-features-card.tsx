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
    <Card className="w-full border-purple-200 bg-gradient-to-r from-purple-50/30 to-pink-50/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left Content */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Right Button */}
          <Button
            onClick={onUpgrade}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
          >
            {buttonText}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
