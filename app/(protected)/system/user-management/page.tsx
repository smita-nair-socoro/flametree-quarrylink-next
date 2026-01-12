'use client';

import React from 'react';
import Image from 'next/image';
import { Tab } from '@/components/ui/tabs';
import {
  CreditCard,
  SettingsIcon,
  Shield,
  UsersRound,
  // Palette,
} from 'lucide-react';
import SettingsTab from './(components)/tabs/settings-tab';
import TeamAdminTab from './(components)/tabs/team-admin-tab';
import RolesTab from './(components)/tabs/roles-tab';
import BillingTab from './(components)/tabs/billing-tab';
// import BrandingTab from './(components)/tabs/branding-tab';

export default function UserRolesPage() {
  const tabs = [
    {
      name: 'Settings',
      content: <SettingsTab />,
      icon: <SettingsIcon className="w-4 h-4" />,
    },
    {
      name: 'Team & Admin',
      content: <TeamAdminTab />,
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      name: 'Roles',
      content: <RolesTab />,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      name: 'Billing',
      content: <BillingTab />,
      icon: <CreditCard className="w-4 h-4" />,
    },
    // {
    //   name: 'Branding',
    //   content: <BrandingTab />,
    //   icon: <Palette className="w-4 h-4" />,
    // },
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
      <div className="w-full flex">
        <Tab
          tabs={tabs}
          className="w-full"
          tabsClassName="h-15 w-full flex flex-nowrap items-center justify-start overflow-x-auto px-2"
          tabsTriggerClassName="h-10 w-auto flex-shrink-0 min-w-[200px] justify-center px-2"
        />
      </div>
    </div>
  );
}
