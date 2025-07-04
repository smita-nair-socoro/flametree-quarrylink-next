import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface CategoryBadgesProps {
  names: string | string[];
  visibleCount?: number;
}

function nameToPastelHsl(name: string) {
  const hash = Array.from(name).reduce(
    (h, c) => (h * 31 + c.charCodeAt(0)) % 360,
    0,
  );
  return `hsl(${hash}, 50%, 85%)`;
}

function textColorForBg(hsl: string) {
  const match = hsl.match(/hsl\(\d+,\s*[\d.]+%,\s*([\d.]+)%/);
  const lightness = match ? parseFloat(match[1]) : 85;
  return lightness > 60 ? '#111' : '#fff';
}

function getBadgeStyle(name: string): React.CSSProperties {
  switch (name) {
    case 'ACTIVE':
      return { backgroundColor: '#dcfce7', color: '#166534' };
    case 'INACTIVE':
      return { backgroundColor: '#fee2e2', color: '#991b1b' };
    default:
      const bg = nameToPastelHsl(name);
      const txt = textColorForBg(bg);
      return { backgroundColor: bg, color: txt };
  }
}

export function TableBadges({ names, visibleCount = 2 }: CategoryBadgesProps) {
  const allNames = Array.isArray(names) ? names : [names];

  const visible = allNames.slice(0, visibleCount);
  const hidden = allNames.slice(visibleCount);

  return (
    <div className="flex items-center gap-1">
      {visible.map((n) => (
        <Badge key={n} style={getBadgeStyle(n)}>
          {n}
        </Badge>
      ))}

      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="cursor-pointer">
              +{hidden.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {hidden.sort().map((n) => (
                <Badge key={n} style={getBadgeStyle(n)}>
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
