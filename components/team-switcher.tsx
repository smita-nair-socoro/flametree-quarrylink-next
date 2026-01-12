'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenantCompleteDetailsQueryOptions } from '@/lib/api/tenant';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useIsMobile } from '@/hooks/use-mobile';

export function TeamSwitcher({
  client,
}: {
  client?: {
    name: string;
    initials: string;
  };
}) {
  const { state, openMobile } = useSidebar();
  const isMobileDevice = useIsMobile();
  const [forceUpdate, setForceUpdate] = React.useState(0);
  // Reset hover state when sidebar state changes
  React.useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [state, openMobile, isMobileDevice]);
  const {
    data: tenantCompleteDetails,
    isLoading,
    isFetching,
  } = useQuery(TenantCompleteDetailsQueryOptions());
  React.useEffect(() => {
    if (tenantCompleteDetails) {
      console.log(
        '🏢 [TeamSwitcher] Tenant Complete Details:',
        tenantCompleteDetails
      );
      console.log(
        '🏷️ [TeamSwitcher] Tenant Name:',
        tenantCompleteDetails.tenantDetails?.tenantName
      );
    }
  }, [tenantCompleteDetails]);

  const isPending = isLoading || (isFetching && !tenantCompleteDetails);

  const tenantName =
    tenantCompleteDetails?.tenantDetails?.tenantName ?? client?.name;

  const tenantInitials = React.useMemo(() => {
    const base = tenantName?.trim() ?? '';
    const parts = base.split(/\s+/);
    const letters = parts
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase() || '')
      .join('');
    return letters || 'AQ';
  }, [tenantName]);

  const activeClient = client || { name: tenantName, initials: tenantInitials };

  // Determine if sidebar is truly collapsed
  const isCollapsed = isMobileDevice ? !openMobile : state === 'collapsed';

  // If collapsed, show hover card
  if (isCollapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <HoverCard
            key={`team-switcher-${forceUpdate}`}
            openDelay={150}
            closeDelay={150}
          >
            <HoverCardTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-default bg-[#7138F5] hover:bg-[#7138F533] pointer-events-auto"
              >
                <div className="bg-white border border-purple-300 text-purple-500 flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-sm font-semibold">
                    {activeClient.initials}
                  </span>
                </div>
              </SidebarMenuButton>
            </HoverCardTrigger>
            <HoverCardContent
              side="right"
              align="start"
              className="w-64 p-1.5 bg-[#1e293b] border-[#334155] shadow-lg rounded-xl"
              sideOffset={8}
            >
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#7138F5] rounded-lg">
                <div className="bg-white border border-purple-300 text-purple-500 flex aspect-square size-8 items-center justify-center rounded-lg">
                  <span className="text-sm font-semibold">
                    {activeClient.initials}
                  </span>
                </div>
                <span className="text-sm font-semibold text-white truncate">
                  {activeClient.name}
                </span>
              </div>
            </HoverCardContent>
          </HoverCard>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // If expanded, show normal button
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default bg-[#7138F5] hover:bg-[#7138F533] pointer-events-none"
        >
          <div className="bg-white border border-purple-300 text-purple-500 flex aspect-square size-8 items-center justify-center rounded-lg">
            {isPending ? (
              <Skeleton className="h-3 w-4 bg-black/10" />
            ) : (
              <span className="text-sm font-semibold">
                {activeClient.initials}
              </span>
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {isPending ? (
              <Skeleton className="h-4 w-36 bg-white/30" />
            ) : (
              <span className="truncate font-medium text-white">
                {activeClient.name}
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
