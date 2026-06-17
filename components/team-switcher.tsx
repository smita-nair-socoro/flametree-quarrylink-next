'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenantLogoQueryOptions } from '@/lib/api/tenant';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    data: tenantLogo,
    isLoading,
    isFetching,
  } = useQuery(TenantLogoQueryOptions());

  const isPending = isLoading || (isFetching && !tenantLogo);

  const logoUrl = tenantLogo?.logoPublicS3Url;

  const tenantName = tenantLogo?.tenantBusinessName ?? client?.name;

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
                <Avatar className="size-8 rounded-lg border border-purple-300">
                  <AvatarImage src={logoUrl} alt={activeClient.name || 'Logo'} />
                  <AvatarFallback className="rounded-lg bg-white text-purple-500 text-sm font-semibold">
                    {activeClient.initials}
                  </AvatarFallback>
                </Avatar>
              </SidebarMenuButton>
            </HoverCardTrigger>
            <HoverCardContent
              side="right"
              align="start"
              className="w-64 p-1.5 bg-[#1e293b] border-[#334155] shadow-lg rounded-xl"
              sideOffset={8}
            >
              <div className="flex items-center gap-2.5 px-3 py-2 bg-[#7138F5] rounded-lg">
                <Avatar className="size-8 rounded-lg border border-purple-300">
                  <AvatarImage src={logoUrl} alt={activeClient.name || 'Logo'} />
                  <AvatarFallback className="rounded-lg bg-white text-purple-500 text-sm font-semibold">
                    {activeClient.initials}
                  </AvatarFallback>
                </Avatar>
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
          <Avatar className="size-8 rounded-lg border border-purple-300">
            <AvatarImage src={logoUrl} alt={activeClient.name || 'Logo'} />
            <AvatarFallback className="rounded-lg bg-white text-purple-500 text-sm font-semibold">
              {isPending ? (
                <Skeleton className="h-3 w-4 bg-black/10" />
              ) : (
                activeClient.initials
              )}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {isPending ? (
              <Skeleton className="h-4 w-36 bg-white/30" />
            ) : (
              <Tooltip delayDuration={300} mobileClickable={false}>
                <TooltipTrigger asChild>
                  <span className="truncate font-medium text-white">
                    {activeClient.name}
                  </span>
                </TooltipTrigger>
                <TooltipContent variant="white">
                  <p>{activeClient.name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
