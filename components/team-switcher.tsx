'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TenantCompleteDetailsQueryOptions } from '@/lib/api/tenant';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export function TeamSwitcher({
  client,
}: {
  client?: {
    name: string;
    initials: string;
  };
}) {
  const {
    data: tenantCompleteDetails,
    isLoading,
    isFetching,
  } = useQuery(TenantCompleteDetailsQueryOptions());

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
              <span className="truncate font-medium text-white" title={activeClient.name}>
                {activeClient.name}
              </span>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
