'use client';

import React from 'react';
import { Tab } from '@/components/ui/tabs';
import { CreditCard, SettingsIcon, Shield, UsersRound } from 'lucide-react';
import SettingsTab from './(components)/tabs/settings-tab';
import TeamAdminTab from './(components)/tabs/team-admin-tab';
import RolesTab from './(components)/tabs/roles-tab';
import BillingTab from './(components)/tabs/billing-tab';

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
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="px-6 py-4 bg-[#8E51FF] bg-gradient-to-r from-transparent to-black w-full">
          <div className="flex flex-col gap-2 text-white text-[16px] sm:text-[24px]">
            <div className="flex justify-start gap-1">
              {/* Will talk to Armin about the font */}
              <span className=" font-medium">Unearth</span>
              <span className=" font-medium">Potential</span>
            </div>
            <div className="flex justify-start gap-1">
              <span className=" font-medium">Unleash</span>
              <span className=" font-medium">Efficiency</span>
            </div>
          </div>
        </div>
      </div>
      <Tab tabs={tabs} tabsClassName="h-12" tabsTriggerClassName="h-10 " />
    </div>
  );
}
