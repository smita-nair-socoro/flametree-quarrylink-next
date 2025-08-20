'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn, STATUS_COLORS } from '@/lib/utils';

interface TableBadgesProps {
  names: string | string[];
  visibleCount?: number;
}

const PALETTE: Record<string, string> = {
  red: 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900',
  yellow:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900',
  emerald:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-200 dark:text-emerald-900',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-200 dark:text-teal-900',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-200 dark:text-sky-900',
  indigo:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-200 dark:text-indigo-900',
  violet:
    'bg-violet-100 text-violet-800 dark:bg-violet-200 dark:text-violet-900',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-200 dark:text-pink-900',
};

const PALETTE_KEYS = Object.keys(PALETTE);

function pickKey(name: string): string {
  let h = 0;
  for (const ch of name) {
    h = (h * 31 + ch.charCodeAt(0)) % PALETTE_KEYS.length;
  }
  return PALETTE_KEYS[h];
}

function getBadgeClassName(name: string): string {
  if (!name || typeof name !== 'string') {
    console.log('Invalid name:', name);
    return PALETTE.sky;
  }

  const key = name.trim().toUpperCase();
  if (STATUS_COLORS[key]) {
    return STATUS_COLORS[key];
  }

  const dynamicKey = pickKey(key);
  return PALETTE[dynamicKey] || PALETTE.sky;
}

export function TableBadges({ names, visibleCount = 2 }: TableBadgesProps) {
  const all = Array.isArray(names) ? names : [names];
  const visible = all.slice(0, visibleCount);
  const hidden = all.slice(visibleCount);

  return (
    <div className="flex items-center gap-1">
      {visible.map((n) => (
        <Badge
          key={n}
          className={cn(
            'uppercase px-2 py-0.5 text-xs font-medium border',
            getBadgeClassName(n),
          )}
        >
          {n}
        </Badge>
      ))}

      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-pointer border">
              +{hidden.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {hidden.sort().map((n) => (
                <Badge
                  key={n}
                  className={cn(
                    'uppercase px-2 py-0.5 text-xs font-medium border',
                    getBadgeClassName(n),
                  )}
                >
                  {n}
                </Badge>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
