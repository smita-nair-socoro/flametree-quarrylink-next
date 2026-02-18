'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function QuarryLinkBranding({
  subscriptionType,
  isLoading = false,
}: {
  subscriptionType?: string;
  isLoading?: boolean;
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-[#7138F533]  cursor-pointer"
          asChild
        >
          <Link href="/customer-operations/customers">
            <div className="flex aspect-square size-8 items-center justify-center">
              <Image
                src="/quarrylink-logo.png"
                alt="QuarryLink Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <Tooltip delayDuration={300} mobileClickable={false}>
                <TooltipTrigger asChild>
                  <span className="truncate font-semibold text-white">
                    QuarryLink
                  </span>
                </TooltipTrigger>
                <TooltipContent variant="white">
                  <p>QuarryLink</p>
                </TooltipContent>
              </Tooltip>
              {isLoading ? (
                <Skeleton className="h-3 w-20 bg-white/30" />
              ) : (
                <Tooltip delayDuration={300} mobileClickable={false}>
                  <TooltipTrigger asChild>
                    <span className="truncate text-xs text-[#71717B]">
                      {subscriptionType || 'Lite Plus'}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="white">
                    <p>{subscriptionType || 'Lite Plus'}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
