'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function QuarryLinkBranding({
  subscriptionType = 'Lite Plus',
}: {
  subscriptionType?: string;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-[#7138F533]  cursor-pointer"
          asChild
        >
          <Link href="/dashboard">
            <div className="flex aspect-square size-8 items-center justify-center">
              <img
                src="/quarrylink-logo.png"
                alt="QuarryLink Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-white">
                QuarryLink
              </span>
              <span className="truncate text-xs text-[#71717B]">
                {subscriptionType}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
