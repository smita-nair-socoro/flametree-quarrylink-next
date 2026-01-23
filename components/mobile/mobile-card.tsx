'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '../ui/card';

export interface MobileCardField {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export interface MobileCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  fields: MobileCardField[];
}

export function MobileCard({
  title,
  description,
  badges,
  actions,
  fields,
}: MobileCardProps) {
  return (
    <Card className="gap-3 py-4 w-full">
      <CardHeader className="pb-0 gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <CardTitle className="text-base font-semibold text-gray-900 truncate">
            {title}
          </CardTitle>
          {description && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
              {description}
            </div>
          )}
        </div>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}

        <div className="space-y-2 text-sm">
          {fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                {field.icon}
                <span>{field.label}</span>
              </div>
              <span className="text-gray-900 font-medium min-w-0 text-right truncate max-w-[55%]">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
