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
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  teal: 'bg-teal-100 text-teal-800',
  sky: 'bg-sky-100 text-sky-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  violet: 'bg-violet-100 text-violet-800',
  pink: 'bg-pink-100 text-pink-800',
};

// Suburb palette: darker background (600), lighter border and text (100)
const SUBURB_PALETTE: Record<string, string> = {
  red: 'bg-red-600 text-red-100 border-red-100',
  yellow: 'bg-yellow-600 text-yellow-100 border-yellow-100',
  emerald: 'bg-emerald-600 text-emerald-100 border-emerald-100',
  teal: 'bg-teal-600 text-teal-100 border-teal-100',
  sky: 'bg-sky-600 text-sky-100 border-sky-100',
  indigo: 'bg-indigo-600 text-indigo-100 border-indigo-100',
  violet: 'bg-violet-600 text-violet-100 border-violet-100',
  pink: 'bg-pink-600 text-pink-100 border-pink-100',
  purple: 'bg-purple-600 text-purple-100 border-purple-100',
  orange: 'bg-orange-600 text-orange-100 border-orange-100',
  amber: 'bg-amber-600 text-amber-100 border-amber-100',
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

function getBadgeClassName(
  name: string,
  variant: 'default' | 'suburb' = 'default'
): string {
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
export function TableBadges({
  names,
  visibleCount = 2,
  variant = 'default',
}: TableBadgesProps) {
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
              className="cursor-pointer border-gray-400 bg-gray-100 text-gray-800"
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

// Simplified badge component for PDF rendering
// No tooltips, no array handling, just a single badge
interface SimplePdfBadgeProps {
  name: string;
  variant?: 'default' | 'suburb';
}

export function SimplePdfBadge({
  name,
  variant = 'default',
}: SimplePdfBadgeProps) {
  return (
    <div
      className={cn(
        'inline-block h-6 px-3 text-xs font-medium border rounded-md',
        getBadgeClassName(name, variant)
      )}
      style={{ lineHeight: '8px' }}
    >
      {name.replace(/_/g, ' ')}
    </div>
  );
}
