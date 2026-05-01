'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DeliveriesOperationsTab = 'dispatch' | 'schedule';

const ACTIVE_TEXT = 'text-[#8E51FF]';
const ACTIVE_BG = 'bg-[#F3E8FF]';
const INACTIVE_TEXT = 'text-[#64748B]';

const deliveriesSidebarWidthClass = (collapsed: boolean) =>
  collapsed ? 'w-[72px]' : 'w-[220px]';

type HeaderProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function DeliveriesOperationsHeader({
  collapsed,
  onToggleCollapsed,
}: HeaderProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col justify-center border-r border-gray-200 bg-white px-4 py-3',
        deliveriesSidebarWidthClass(collapsed),
        collapsed && 'items-center px-2',
      )}
    >
      <div
        className={cn(
          'flex w-full items-start justify-between gap-2',
          collapsed && 'flex-col items-center',
        )}
      >
        <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#94A3B8]">
            Quarrylink
          </p>
          <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[#0F172A]">
            Operations
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded-md border-gray-200 bg-white shadow-none"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggleCollapsed}
        >
          {collapsed ? (
            <ChevronRight className="size-4 text-[#64748B]" />
          ) : (
            <ChevronLeft className="size-4 text-[#64748B]" />
          )}
        </Button>
      </div>
    </div>
  );
}

type NavProps = {
  collapsed: boolean;
  activeTab: DeliveriesOperationsTab;
  onTabChange: (tab: DeliveriesOperationsTab) => void;
};

export function DeliveriesOperationsNav({
  collapsed,
  activeTab,
  onTabChange,
}: NavProps) {
  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-gray-200 bg-white',
        deliveriesSidebarWidthClass(collapsed),
      )}
    >
      <nav className="flex flex-col gap-1 p-2" aria-label="Operations sections">
        <button
          type="button"
          onClick={() => onTabChange('dispatch')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'dispatch'
              ? cn(ACTIVE_BG, ACTIVE_TEXT)
              : cn('hover:bg-muted/60', INACTIVE_TEXT),
            collapsed && 'justify-center px-2',
          )}
        >
          <LayoutGrid
            className={cn(
              'size-5 shrink-0',
              activeTab === 'dispatch' ? ACTIVE_TEXT : INACTIVE_TEXT,
            )}
            strokeWidth={2.25}
          />
          {!collapsed && <span>Dispatch</span>}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('schedule')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors cursor-pointer',
            activeTab === 'schedule'
              ? cn(ACTIVE_BG, ACTIVE_TEXT)
              : cn('hover:bg-muted/60', INACTIVE_TEXT),
            collapsed && 'justify-center px-2',
          )}
        >
          <CalendarIcon
            className={cn(
              'size-5 shrink-0',
              activeTab === 'schedule' ? ACTIVE_TEXT : INACTIVE_TEXT,
            )}
            strokeWidth={2.25}
          />
          {!collapsed && <span>Schedule</span>}
        </button>
      </nav>
    </aside>
  );
}
