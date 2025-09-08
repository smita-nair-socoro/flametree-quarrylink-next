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
import { useAuth } from 'react-oidc-context';
import { useCookieAuth } from '@/lib/auth/cookieAuthContext';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        { title: 'Reports & Dashboard', url: '/dashboard' },
        { title: 'Drone Analytics', url: '/dashboard/drone-analytics' },
      ],
    },
    {
      title: 'Customer Operations',
      url: '/customer-operations',
      icon: Users,
      items: [
        {
          title: 'Customers Management',
          url: '/customer-operations/customers',
        },
        { title: 'Quotation', url: '/customer-operations/quotation' },
        {
          title: 'Jobs, Dockets & Invoicing',
          url: '/customer-operations/jobs',
        },
        { title: 'Client Portal', url: '/customer-operations/client-portal' },
      ],
    },
    {
      title: 'Inventory & Production',
      url: '/inventory',
      icon: Package,
      items: [
        { title: 'Products', url: '/inventory/products' },
        { title: 'Stockpile', url: '/inventory/stockpile' },
        { title: 'Weigh-Bridge Module', url: '/inventory/weigh-bridge' },
        { title: 'Production Planning', url: '/inventory/production' },
      ],
    },
    {
      title: 'Logistics',
      url: '/logistics',
      icon: Truck,
      items: [
        { title: 'Driver Management', url: '/logistics/drivers' },
        { title: "Driver's Application", url: '/logistics/driver-app' },
        { title: 'Site & Driver Sign-In', url: '/logistics/sign-in' },
        { title: 'Delivery Tracking', url: '/logistics/delivery' },
      ],
    },
    {
      title: 'System Settings',
      url: '/system',
      icon: Settings2,
      items: [
        { title: 'User Role Management', url: '/system/user-roles' },
        { title: 'Camera Feed Add-On', url: '/system/camera' },
        { title: 'Accounting Integrations', url: '/system/accounting' },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: oidcUser } = useAuth();
  const { user: cookieUser } = useCookieAuth();

  const user = {
    name:
      oidcUser?.profile.name ??
      (cookieUser
        ? `${cookieUser.user.username} ${cookieUser.user.username}`
        : 'Unknown Name'),
    email: oidcUser?.profile.email ?? cookieUser?.user.email ?? 'Unknown Email',
    avatar:
      oidcUser?.profile.picture ??
      cookieUser?.user.username ??
      '/avatars/default.png',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <SidebarTrigger className="h-8 w-8" />
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
