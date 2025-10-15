'use client';

import * as React from 'react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function TeamSwitcher({
  client,
}: {
  client?: {
    name: string;
    initials: string;
  };
}) {
  // Default to placeholder data until client module integration
  const defaultClient = {
    name: 'One Quarry',
    initials: 'OQ',
  };

  const activeClient = client || defaultClient;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default bg-[#7138F5] hover:bg-[#7138F533] pointer-events-none"
        >
          <div className="bg-white border border-purple-300 text-purple-500 flex aspect-square size-8 items-center justify-center rounded-lg">
            <span className="text-sm font-semibold">
              {activeClient.initials}
            </span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium text-white">
              {activeClient.name}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
