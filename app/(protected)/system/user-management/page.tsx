'use client';

import React from 'react';
import Image from 'next/image';
import { Tab } from '@/components/ui/tabs';
import {
  CreditCard,
  SettingsIcon,
  Shield,
  UsersRound,
  Palette,
} from 'lucide-react';
import SettingsTab from './(components)/tabs/settings-tab';
import TeamAdminTab from './(components)/tabs/team-admin-tab';
import RolesTab from './(components)/tabs/roles-tab';
import BillingTab from './(components)/tabs/billing-tab';
import BrandingTab from './(components)/tabs/branding-tab';
import { useIsSuperAdmin } from '@/app/stores/user-store';

export default function UserRolesPage() {
  const isSuperAdmin = useIsSuperAdmin();

  const tabs = [
    {
      name: 'Settings',
      content: <SettingsTab />,
      icon: <SettingsIcon className="w-4 h-4" />,
    },
    ...(isSuperAdmin
      ? [
          {
            name: 'Team & Admin',
            content: <TeamAdminTab />,
            icon: <UsersRound className="w-4 h-4" />,
          },
        ]
      : []),
    {
      name: 'Roles',
      content: <RolesTab />,
      icon: <Shield className="w-4 h-4" />,
    },
    // {
    //   name: 'Billing',
    //   content: <BillingTab />,
    //   icon: <CreditCard className="w-4 h-4" />,
    // },
    {
      name: 'Branding',
      content: <BrandingTab />,
      icon: <Palette className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="px-6 py-4 bg-[#8E51FF] bg-gradient-to-r from-transparent to-black w-full">
          <Image
            src="/unearth-potential-unleash-efficiency.svg"
            alt="Unearth Potential, Unleash Efficiency"
            width={1000}
            height={1000}
            className="w-80 h-full"
          />
        </div>
      </div>
      <div className="w-full flex min-w-0">
        <Tab
          tabs={tabs}
          className="w-full min-w-0"
          tabsClassName="h-12 w-full overflow-x-auto flex-nowrap rounded-lg"
          tabsTriggerClassName="h-10 flex-1 justify-center"
          enableDropdownOnMobile={true}
        />
      </div>
    </div>
  );
}
