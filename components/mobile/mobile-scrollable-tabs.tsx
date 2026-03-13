'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

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

  // Scroll the active tab into view smoothly whenever the selection changes.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>('[aria-selected="true"]');
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [value]);

  const activeIndex = tabs.findIndex((t) => t.value === value);

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scrollRef}
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={value === tab.value}
            tabIndex={value === tab.value ? 0 : -1}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              value === tab.value
                ? 'bg-[#8E51FF] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.length > 1 && (
        <div role="presentation" className="flex justify-center items-center gap-1.5">
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
