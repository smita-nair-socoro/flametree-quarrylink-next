'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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

// Specific mappings for known statuses (case-insensitive)
const STATUS_COLORS: Record<string, string> = {
  DRAFT:
    'bg-gray-100 text-gray-800 border-gray-800 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-800',
  PENDING:
    'bg-yellow-100 text-yellow-900 border-yellow-900 dark:bg-yellow-200 dark:text-yellow-900 dark:border-yellow-900',
  APPROVED:
    'bg-green-100 text-green-900 border-green-900 dark:bg-green-200 dark:text-green-900 dark:border-green-900',

  'CONVERTED TO JOB':
    'bg-blue-100 text-blue-900 border-blue-900 dark:bg-blue-200 dark:text-blue-900 dark:border-blue-900',

  EXPIRED:
    'bg-red-100 text-red-900 border-red-900 dark:bg-red-200 dark:text-red-900 dark:border-red-900',
  DECLINED:
    'bg-orange-100 text-orange-900 border-orange-900 dark:bg-orange-200 dark:text-orange-800 dark:border-orange-800',
  ARCHIVED:
    'bg-gray-100 text-gray-500 border-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-500',
  ACTIVE:
    'bg-green-100 text-green-800 border-green-800 dark:bg-green-200 dark:text-green-900 dark:border-green-800',
  INACTIVE:
    'bg-gray-100 text-gray-600 border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600',
};

function getBadgeClassName(name: string): string {
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
