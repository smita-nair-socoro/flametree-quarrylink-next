'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
} from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { TenantCompleteDetailsQueryOptions } from '@/lib/api/tenant';
import { UserDetailQueryOptions } from '@/lib/api/user';

export const navItems = [
  {
    title: 'Reports & Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    plan: 'PLUS',
  },
  {
    title: 'Customer Operations',
    url: '/customer-operations',
    icon: Users,
    items: [
      {
        title: 'Customers',
        url: '/customer-operations/customers',
        plan: 'ESSENTIAL',
      },
      {
        title: 'Quotations',
        url: '/customer-operations/quotation',
        plan: 'ESSENTIAL',
      },
      { title: 'Jobs', url: '/customer-operations/jobs', plan: 'PLUS' },
      {
        title: 'Dockets',
        url: '/customer-operations/dockets',
        plan: 'PLUS',
      },
    ],
  },
  {
    title: 'Inventory & Production',
    url: '/inventory',
    icon: Package,
    items: [
      { title: 'Products', url: '/inventory/products', plan: 'ESSENTIAL' },
      {
        title: 'Quarries & Suppliers',
        url: '/inventory/quarries-suppliers',
        plan: 'ESSENTIAL',
      },
      { title: 'Stockpile', url: '/inventory/stockpile', plan: 'PRO' },
      { title: 'Weighbridge', url: '/inventory/weigh-bridge', plan: 'PLUS' },
      {
        title: 'Production Planning',
        url: '/inventory/production',
        plan: 'PRO',
      },
    ],
  },
  {
    title: 'Logistics',
    url: '/logistics',
    icon: Truck,
    plan: 'PLUS',
    items: [
      { title: 'Drivers', url: '/logistics/drivers', plan: 'PLUS' },
      { title: 'Trucks', url: '/logistics/trucks', plan: 'PLUS' },
      { title: 'Deliveries', url: '/logistics/deliveries', plan: 'PLUS' },
      {
        title: 'Site & Driver Sign-In',
        url: '/logistics/sign-in',
        plan: 'PRO',
      },
    ],
  },
  // {
  //   title: 'Tenant Management',
  //   url: '/system/tenant-management',
  //   icon: Settings2,
  //   plan: 'ESSENTIAL',
  // },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: amplifyUser, attributes } = useAuth();
  const {
    data: tenantCompleteDetails,
    isLoading,
    isFetching,
  } = useQuery(TenantCompleteDetailsQueryOptions());

  // Fetch current user details so name/email reflect updates immediately after saving in settings
  const { data: currentUser } = useQuery(
    UserDetailQueryOptions(amplifyUser?.userId || ''),
  );

  const isPending = isLoading || (isFetching && !tenantCompleteDetails);

  React.useEffect(() => {
    if (tenantCompleteDetails) {
      console.log(
        '🏢 [AppSidebar] Tenant Complete Details:',
        tenantCompleteDetails,
      );
      console.log(
        '🏷️ [AppSidebar] Tenant Name:',
        tenantCompleteDetails.tenantDetails?.tenantName,
      );
      console.log(
        '📋 [AppSidebar] Subscription Plan:',
        tenantCompleteDetails.subscriptionAndInvoices?.subscriptions
          ?.subscriptions?.[1]?.subscriptionPlan,
      );
    }
  }, [tenantCompleteDetails]);

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

  // Get subscription plan from the first active subscription
  const subscriptionPlan =
    tenantCompleteDetails?.subscriptionAndInvoices?.subscriptions
      ?.subscriptions?.[1]?.subscriptionPlan;

  // Set Clarity tags for filtering/segmentation (only after window.clarity is ready)
  React.useEffect(() => {
    claritySafe((c) => {
      if (tenantCompleteDetails?.tenantDetails?.tenantName) {
        c('set', 'tenantName', tenantCompleteDetails.tenantDetails.tenantName);
      }
      if (subscriptionPlan) {
        c('set', 'subscriptionPlan', subscriptionPlan);
      }
      if (displayName) {
        c('set', 'userName', displayName);
      }
      if (email) {
        c('set', 'userEmail', email);
      }
    });
  }, [tenantCompleteDetails, subscriptionPlan, displayName, email]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <SidebarTrigger className="h-8 w-8 text-white" />
        </div>
        <div className="mb-1">
          <QuarryLinkBranding
            subscriptionType={subscriptionPlan}
            isLoading={isPending}
          />
        </div>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} subscriptionPlan={subscriptionPlan} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
