'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  Package,
  Settings2,
  Truck,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAuth } from 'react-oidc-context';
import { useCookieAuth } from '@/lib/auth/cookieAuthContext';

const data = {
  user: {
    name: 'undefined',
    email: 'unknown email',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      id: '351356-12415-634',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      id: '5320521-2151-35135',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      id: '1356973-153-68353',
      logo: Command,
      plan: 'Free',
    },
  ],
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
  const auth = useAuth();
  const cookieAuth = useCookieAuth();

  // Set user details here
  data.user.email =
    auth.user?.profile.email || cookieAuth.user?.email || 'email undefined';
  data.user.name =
    auth.user?.profile.name || cookieAuth.user?.username || 'name undefined';

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
