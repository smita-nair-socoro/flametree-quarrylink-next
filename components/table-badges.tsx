'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn, BADGE_COLORS } from '@/lib/utils';
interface TableBadgesProps {
  names: string | string[];
  visibleCount?: number;
  variant?: 'default' | 'suburb';
}
const PALETTE: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-800 dark:bg-red-200 dark:text-red-900 dark:border-red-900',
  yellow:
    'bg-yellow-100 text-yellow-800 border-yellow-800 dark:bg-yellow-200 dark:text-yellow-900 dark:border-yellow-900',
  emerald:
    'bg-emerald-100 text-emerald-800 border-emerald-800 dark:bg-emerald-200 dark:text-emerald-900 dark:border-emerald-900',
  teal: 'bg-teal-100 text-teal-800 border-teal-800 dark:bg-teal-200 dark:text-teal-900 dark:border-teal-900',
  sky: 'bg-sky-100 text-sky-800 border-sky-800 dark:bg-sky-200 dark:text-sky-900 dark:border-sky-900',
  indigo:
    'bg-indigo-100 text-indigo-800 border-indigo-800 dark:bg-indigo-200 dark:text-indigo-900 dark:border-indigo-900',
  violet:
    'bg-violet-100 text-violet-800 border-violet-800 dark:bg-violet-200 dark:text-violet-900 dark:border-violet-900',
  pink: 'bg-pink-100 text-pink-800 border-pink-800 dark:bg-pink-200 dark:text-pink-900 dark:border-pink-900',
};

// Suburb palette: darker background (600), lighter border and text (100)
const SUBURB_PALETTE: Record<string, string> = {
  red: 'bg-red-600 text-red-100 border-red-100 dark:bg-red-600 dark:text-red-100 dark:border-red-100',
  yellow:
    'bg-yellow-600 text-yellow-100 border-yellow-100 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-100',
  emerald:
    'bg-emerald-600 text-emerald-100 border-emerald-100 dark:bg-emerald-600 dark:text-emerald-100 dark:border-emerald-100',
  teal: 'bg-teal-600 text-teal-100 border-teal-100 dark:bg-teal-600 dark:text-teal-100 dark:border-teal-100',
  sky: 'bg-sky-600 text-sky-100 border-sky-100 dark:bg-sky-600 dark:text-sky-100 dark:border-sky-100',
  indigo:
    'bg-indigo-600 text-indigo-100 border-indigo-100 dark:bg-indigo-600 dark:text-indigo-100 dark:border-indigo-100',
  violet:
    'bg-violet-600 text-violet-100 border-violet-100 dark:bg-violet-600 dark:text-violet-100 dark:border-violet-100',
  pink: 'bg-pink-600 text-pink-100 border-pink-100 dark:bg-pink-600 dark:text-pink-100 dark:border-pink-100',
  purple:
    'bg-purple-600 text-purple-100 border-purple-100 dark:bg-purple-600 dark:text-purple-100 dark:border-purple-100',
  orange:
    'bg-orange-600 text-orange-100 border-orange-100 dark:bg-orange-600 dark:text-orange-100 dark:border-orange-100',
  amber:
    'bg-amber-600 text-amber-100 border-amber-100 dark:bg-amber-600 dark:text-amber-100 dark:border-amber-100',
};

const PALETTE_KEYS = Object.keys(PALETTE);
const SUBURB_PALETTE_KEYS = Object.keys(SUBURB_PALETTE);

function pickKey(name: string): string {
  let h = 0;
  for (const ch of name) {
    h = (h * 31 + ch.charCodeAt(0)) % PALETTE_KEYS.length;
  }
  return PALETTE_KEYS[h];
}

function pickSuburbKey(name: string): string {
  let h = 0;
  for (const ch of name) {
    h = (h * 31 + ch.charCodeAt(0)) % SUBURB_PALETTE_KEYS.length;
  }
  return SUBURB_PALETTE_KEYS[h];
}

function getBadgeClassName(name: string, variant: 'default' | 'suburb' = 'default'): string {
  if (!name || typeof name !== 'string') {
    console.log('Invalid name:', name);
    return variant === 'suburb' ? SUBURB_PALETTE.sky : PALETTE.sky;
  }
  const key = name.trim().toUpperCase().replace(/_/g, ' ');

  // Check if it's a predefined color in BADGE_COLORS (for statuses, types, etc.)
  if (BADGE_COLORS[key]) {
    return BADGE_COLORS[key];
  }

  // For suburbs or dynamic values, use the appropriate palette
  if (variant === 'suburb') {
    const dynamicKey = pickSuburbKey(key);
    return SUBURB_PALETTE[dynamicKey] || SUBURB_PALETTE.sky;
  }

  const dynamicKey = pickKey(key);
  return PALETTE[dynamicKey] || PALETTE.sky;
}
export function TableBadges({ names, visibleCount = 2, variant = 'default' }: TableBadgesProps) {
  const all = Array.isArray(names) ? names : [names];
  const visible = all.slice(0, visibleCount);
  const hidden = all.slice(visibleCount);
  return (
    <div className="flex items-center gap-1">
      {visible.map((n) => (
        <Badge
          key={n}
          className={cn(
            'px-2 py-0.5 text-xs font-medium border',
            getBadgeClassName(n, variant)
          )}
        >
          {n.replace(/_/g, ' ')}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-pointer border-gray-400 bg-gray-100 text-gray-800 dark:bg-gray-200 dark:text-gray-900"
            >
              +{hidden.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="start"
            variant="table"
            className="p-2"
          >
            <div className="grid grid-cols-2 gap-1">
              {hidden.sort().map((n) => (
                <Badge
                  key={n}
                  className={cn(
                    'uppercase px-2 py-0.5 text-xs font-medium border',
                    getBadgeClassName(n, variant)
                  )}
                >
                  {n.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
