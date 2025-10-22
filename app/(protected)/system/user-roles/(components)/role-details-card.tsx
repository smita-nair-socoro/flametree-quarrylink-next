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
      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Role Badge */}
          <Badge
            variant="outline"
            className={cn(
              'w-fit',
              roleType === 'admin'
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-blue-50 text-blue-700 border-blue-300'
            )}
          >
            <div className="flex items-center gap-1.5">
              {roleType === 'admin' && (
                <Crown className="h-3.5 w-3.5 fill-purple-200" />
              )}
              <span className="font-medium">{roleName}</span>
            </div>
          </Badge>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Features List */}
        <ul className="space-y-2.5">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-muted-foreground mt-0.5">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
