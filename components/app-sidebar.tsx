'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Package,
  Settings2,
  Truck,
  Users,
} from 'lucide-react';

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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

const data = {
  navMain: [
    {
      title: 'Reports & Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Customer Operations',
      url: '/customer-operations',
      icon: Users,
      items: [
        {
          title: 'Customers',
          url: '/customer-operations/customers',
        },
        { title: 'Quotations', url: '/customer-operations/quotation' },
        { title: 'Jobs', url: '/customer-operations/jobs' },
        {
          title: 'Dockets',
          url: '/customer-operations/dockets',
        },
      ],
    },
    {
      title: 'Inventory & Production',
      url: '/inventory',
      icon: Package,
      items: [
        { title: 'Products', url: '/inventory/products' },
        { title: 'Quarries & Suppliers', url: '/inventory/quarries-suppliers' },
        { title: 'Stockpile', url: '/inventory/stockpile' },
        { title: 'Weighbridge', url: '/inventory/weigh-bridge' },
        { title: 'Production Planning', url: '/inventory/production' },
      ],
    },
    {
      title: 'Logistics',
      url: '/logistics',
      icon: Truck,
      items: [
        { title: 'Drivers', url: '/logistics/drivers' },
        { title: 'Trucks', url: '/logistics/trucks' },
        { title: 'Deliveries', url: '/logistics/deliveries' },
        { title: 'Site & Driver Sign-In', url: '/logistics/sign-in' },
      ],
    },
    {
      title: 'Tenant Management',
      url: '/system/tenant-management',
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: amplifyUser, attributes } = useAuth();

  const displayName =
    attributes?.name ||
    amplifyUser?.signInDetails?.loginId ||
    amplifyUser?.username ||
    'Unknown Name';
  const email =
    attributes?.email ||
    amplifyUser?.signInDetails?.loginId ||
    amplifyUser?.username ||
    'Unknown Email';

  const user = {
    name: displayName,
    email,
    avatar: '/default-user.png',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <SidebarTrigger className="h-8 w-8 text-white" />
        </div>
        <div className="mb-1">
          <QuarryLinkBranding subscriptionType="Enterprise" />
        </div>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
