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
  const key = name.trim().toUpperCase().replace(/_/g, ' ');
  if (BADGE_COLORS[key]) {
    return BADGE_COLORS[key];
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
            'px-2 py-0.5 text-xs font-medium border',
            getBadgeClassName(n)
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
                    getBadgeClassName(n)
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
