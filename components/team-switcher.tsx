'use client';

import * as React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { TenantsGetDetailQueryOptions } from '@/lib/api/tenant';

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
  // const { data: tenantDetails } = useQuery(TenantsGetDetailQueryOptions());
  // console.log('tenantDetails', tenantDetails);
  // const tenantName = tenantDetails?.tenantName || 'Acme Quarry';
  // const tenantInitials = React.useMemo(() => {
  //   const parts = tenantName.trim().split(/\s+/);
  //   const letters = parts
  //     .slice(0, 2)
  //     .map((p: string) => p[0]?.toUpperCase() || '')
  //     .join('');
  //   return letters || 'AQ';
  // }, [tenantName]);

  // const activeClient = client || { name: tenantName, initials: tenantInitials };
  const activeClient = client || { name: 'Acme Quarry', initials: 'AQ' };

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
