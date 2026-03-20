'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface MobileScrollableTabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileScrollableTabsProps {
  tabs: MobileScrollableTabItem[];
  value: string;
  onValueChange: (value: string) => void;
}

export function MobileScrollableTabs({
  tabs,
  value,
  onValueChange,
}: MobileScrollableTabsProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = React.useState(false);

  const recalcOverflow = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setHasOverflow(el.scrollWidth > el.clientWidth);
  }, []);

  // ResizeObserver handles initial measurement and container size changes.
  // tabs included so overflow recalculates if the tab list changes.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    recalcOverflow();
    const ro = new ResizeObserver(recalcOverflow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalcOverflow, tabs]);

  // Scroll the active tab into view smoothly whenever the selection changes.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[aria-selected="true"]');
    activeBtn?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [value]);

  const activeIndex = tabs.findIndex((t) => t.value === value);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            onClick={() => onValueChange(tab.value)}
            variant="ghost"
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-4 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
              value === tab.value
                ? 'bg-[#8E51FF] text-white hover:bg-[#8E51FF] hover:text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-500',
            )}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {hasOverflow && (
        <div
          role="presentation"
          className="flex justify-center items-center gap-1.5"
        >
          {tabs.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-200',
                i === activeIndex
                  ? 'bg-[#8E51FF] w-5 h-2'
                  : 'bg-gray-300 w-2 h-2',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
