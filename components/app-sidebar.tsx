'use client';

import * as React from 'react';
import { Blocks, Package, Truck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { claritySafe } from '@/lib/clarity';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { QuarryLinkBranding } from '@/components/quarrylink-branding';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { TenantLogoQueryOptions } from '@/lib/api/tenant';
import { UserDetailQueryOptions } from '@/lib/api/user';
import { PaymentsFailedCountQueryOptions } from '@/lib/api/payments';
import { useTenantStore } from '@/app/stores/tenant-store';
import { HelpCentreButton } from '@/components/help-centre-modal';

export const navItems = [
  {
    title: 'Customer Operations',
    url: '/customer-operations',
    icon: Users,
    items: [
      { title: 'Customers', url: '/customer-operations/customers' },
      { title: 'Quotations', url: '/customer-operations/quotation' },
      { title: 'Jobs', url: '/customer-operations/jobs' },
      { title: 'Payments', url: '/customer-operations/payments' },
      { title: 'Dockets', url: '/customer-operations/dockets' },
      { title: 'Schedule', url: '/customer-operations/schedule' },
    ],
  },
  {
    title: 'Logistics',
    url: '/logistics',
    icon: Truck,
    items: [
      { title: 'Drivers', url: '/logistics/drivers' },
      { title: 'Trucks', url: '/logistics/trucks' },
      { title: 'Hauliers', url: '/logistics/haulier' },
      { title: 'Dispatch', url: '/logistics/dispatch' },
    ],
  },
  {
    title: 'Inventory & Production',
    url: '/inventory',
    icon: Package,
    items: [
      { title: 'Products', url: '/inventory/products' },
      { title: 'Quarries & Suppliers', url: '/inventory/quarries-suppliers' },
    ],
  },
  {
    title: 'Add-ons',
    url: '/add-ons',
    icon: Blocks,
    items: [
      { title: 'Reports & Dashboard', url: '/dashboard', isDisabled: true },
      { title: 'Stockpile', url: '/inventory/stockpile', isDisabled: true },
      {
        title: 'Weighbridge',
        url: '/inventory/weigh-bridge',
        isDisabled: true,
      },
      {
        title: 'Production Planning',
        url: '/inventory/production',
        isDisabled: true,
      },
      {
        title: 'Site & Driver Sign-In',
        url: '/logistics/sign-in',
        isDisabled: true,
      },
    ],
  },
];

function withPaymentsFailedBadge(
  items: typeof navItems,
  failedCount: number,
): typeof navItems {
  if (failedCount < 1) return items;
  return items.map((group) => {
    if (group.url !== '/customer-operations') return group;
    return {
      ...group,
      items: group.items.map((item) =>
        item.url === '/customer-operations/payments'
          ? { ...item, badge: failedCount }
          : item,
      ),
    };
  });
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: amplifyUser, attributes } = useAuth();
  const { data: tenantLogo } = useQuery(TenantLogoQueryOptions());
  const { data: failedSync } = useQuery(PaymentsFailedCountQueryOptions());
  const failedCount = failedSync?.failedCount ?? 0;

  const { data: currentUser } = useQuery(
    UserDetailQueryOptions(amplifyUser?.userId || ''),
  );

  const tenantName = tenantLogo?.tenantBusinessName;

  const displayName =
    currentUser?.name ||
    attributes?.name ||
    amplifyUser?.signInDetails?.loginId ||
    amplifyUser?.username ||
    'Unknown Name';
  const email =
    currentUser?.email ||
    attributes?.email ||
    amplifyUser?.signInDetails?.loginId ||
    amplifyUser?.username ||
    'Unknown Email';

  const user = {
    name: displayName,
    email,
    avatar: '/default-user.png',
  };

  React.useEffect(() => {
    useTenantStore.getState().setUser(displayName);
  }, [displayName]);

  React.useEffect(() => {
    claritySafe((c) => {
      if (tenantName) {
        c('set', 'tenantName', tenantName);
      }
      if (displayName) {
        c('set', 'userName', displayName);
      }
      if (email) {
        c('set', 'userEmail', email);
      }
    });
  }, [tenantName, displayName, email]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <SidebarTrigger className="h-8 w-8 text-white" />
        </div>
        <div className="mb-1">
          <QuarryLinkBranding />
        </div>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={withPaymentsFailedBadge(navItems, failedCount)} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0 w-full" />
        <HelpCentreButton />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
