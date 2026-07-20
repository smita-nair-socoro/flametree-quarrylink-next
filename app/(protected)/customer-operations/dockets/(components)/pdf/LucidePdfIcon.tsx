import React from 'react';
import {
  Svg,
  Path,
  Circle,
  Ellipse,
  Line,
  Polygon,
  Polyline,
  Rect,
} from '@react-pdf/renderer';
import type { IconNode } from 'lucide-react';
import type { Style } from '@react-pdf/types';

// react-pdf can't render lucide-react components (they emit DOM <svg>),
// so this draws a lucide icon from its raw IconNode data instead.
// Loosely typed: each tag's required attrs (d, cx, points, …) come from the icon data
const TAG_MAP = {
  path: Path,
  circle: Circle,
  ellipse: Ellipse,
  line: Line,
  polygon: Polygon,
  polyline: Polyline,
  rect: Rect,
} as unknown as Record<string, React.ComponentType<Record<string, unknown>>>;

export function LucidePdfIcon({
  icon,
  size = 14,
  color,
  strokeWidth = 2,
  style,
}: Readonly<{
  icon: IconNode;
  size?: number;
  color: string;
  strokeWidth?: number;
  style?: Style;
}>) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {icon.map(([tag, attrs]) => {
        const Component = TAG_MAP[tag];
        if (!Component) return null;
        const { key, ...rest } = attrs;
        return (
          <Component
            key={key}
            {...rest}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      })}
    </Svg>
  );
}
