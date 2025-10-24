'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleDetailsCardProps {
  roleName: string;
  roleType: 'admin' | 'user';
  title: string;
  description: string;
  features: string[];
}

export function RoleDetailsCard({
  roleName,
  roleType,
  title,
  description,
  features,
}: RoleDetailsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <div className="space-y-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'w-fit',
                roleType === 'admin'
                  ? 'text-[#6E11B0] border border-[#E9D4FF] bg-[#F3E8FF]'
                  : 'bg-blue-50 text-blue-700 border-blue-300'
              )}
            >
              <span className="font-medium text-[10.5px]">{roleName}</span>
            </Badge>
            {roleType === 'admin' && (
              <Crown className="h-4 w-4 text-[#9810FA]" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15.0594px] font-normal">{title}</h3>

          {/* Description */}
          <p className="text-[13.6719px] font-normal text-[#717182] leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Features List */}
        <ul className="list-disc pl-6 space-y-0">
          {features.map((feature, index) => (
            <li
              key={index}
              className="marker:text-[#99A1AF] marker:text-[11.99px] text-[12.1078px] font-normal text-[#4A5565]"
            >
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
