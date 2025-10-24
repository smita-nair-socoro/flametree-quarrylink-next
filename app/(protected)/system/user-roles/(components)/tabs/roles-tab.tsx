'use client';

import React from 'react';
import { SubscriptionPlanCard } from '../subscription-plan-card';
import { PermissionMatrix } from '../permission-matrix';
import { RoleDetailsCard } from '../role-details-card';
import { UpgradeFeaturesCard } from '../upgrade-features-card';

export default function RolesTab() {
  // Selected plan state (default to first plan)
  const [selectedPlanIndex, setSelectedPlanIndex] = React.useState(0);

  const subscriptionPlans = [
    {
      id: 'essentials',
      price: '$399',
      planName: 'Essentials',
      description: 'Basic quotation and customer management',
      maxUsers: '10 min users',
      featured: true,
      priceBgColor: '#F3F4F6',
      priceBorderColor: '#E5E7EB',
      priceColor: '#1E2939',
      permissions: [
        {
          name: 'User Management',
          permissions: { super_admin: true, user: false },
        },
        {
          name: 'Customer Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Product Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Suppliers & Quarries',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Quote Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Jobs, Dockets & Invoicing',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Driver & Fleet Management',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Deliveries Schedule',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Reports & Dashboards',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Driver Application',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Stockpile Management',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Site & Driver Sign-in',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Weighbridge Integration',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Production Planning',
          permissions: { super_admin: false, user: false },
        },
      ],
    },
    {
      id: 'plus',
      price: '$999',
      planName: 'Plus',
      description: 'Complete job and fleet management',
      maxUsers: '10 min users',
      featured: false,
      priceBgColor: '#DBEAFE',
      priceBorderColor: '#BEDBFF',
      priceColor: '#193CB8',
      permissions: [
        {
          name: 'User Management',
          permissions: { super_admin: true, user: false },
        },
        {
          name: 'Customer Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Product Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Suppliers & Quarries',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Quote Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Jobs, Dockets & Invoicing',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Driver & Fleet Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Deliveries Schedule',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Reports & Dashboards',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Driver Application',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Stockpile Management',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Site & Driver Sign-in',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Weighbridge Integration',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Production Planning',
          permissions: { super_admin: false, user: false },
        },
        {
          name: 'Integrations',
          permissions: { super_admin: false, user: false },
        },
      ],
    },
    {
      id: 'pro',
      price: '$1,899',
      planName: 'Pro',
      description: 'Advanced operations with driver app',
      maxUsers: '10 min users',
      featured: false,
      priceBgColor: '#F3E8FF',
      priceBorderColor: '#E9D4FF',
      priceColor: '#6E11B0',
      permissions: [
        {
          name: 'User Management',
          permissions: { super_admin: true, user: false },
        },
        {
          name: 'Customer Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Product Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Suppliers & Quarries',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Quote Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Jobs, Dockets & Invoicing',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Driver & Fleet Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Deliveries Schedule',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Reports & Dashboards',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Driver Application',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Stockpile Management',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Site & Driver Sign-in',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Weighbridge Integration',
          permissions: { super_admin: true, user: true },
        },
        {
          name: 'Production Planning',
          permissions: { super_admin: true, user: true },
        },
      ],
    },
  ];

  const selectedPlan = subscriptionPlans[selectedPlanIndex];

  // Permission matrix configuration
  const permissionRoles = [
    { name: 'Super Admin', isAdmin: true },
    { name: 'User', isAdmin: false },
  ];

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-[20.1797px] font-bold mb-2">Roles & Permissions</h2>
        <p className="text-muted-foreground text-[13.5625px]">
          Simplified two-tier access control: Super Admin with full control,
          Users with operational access
        </p>
      </div>

      {/* Current Subscription Plan Section */}
      <div className="border rounded-lg p-6 space-y-4 bg-white">
        <div>
          <h3 className="font-medium text-[13.7813px]">
            Current Subscription Plan
          </h3>
          <p className="text-[13.5625px] font-normal text-muted-foreground">
            Select a plan to view its permission matrix and available features
          </p>
        </div>

        {/* Subscription Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan, index) => (
            <SubscriptionPlanCard
              key={index}
              price={plan.price}
              planName={plan.planName}
              description={plan.description}
              maxUsers={plan.maxUsers}
              featured={plan.featured}
              priceColor={plan.priceColor}
              priceBgColor={plan.priceBgColor}
              priceBorderColor={plan.priceBorderColor}
              isSelected={selectedPlanIndex === index}
              onClick={() => setSelectedPlanIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix
        title={selectedPlan.planName}
        description="Feature access by role for the selected subscription plan. Users have full operational access except for system administration."
        roles={permissionRoles}
        modules={selectedPlan.permissions}
        titleBgColor={selectedPlan.priceBgColor}
        titleTextColor={selectedPlan.priceColor}
        titleBorderColor={selectedPlan.priceBorderColor}
      />

      {/* Role Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RoleDetailsCard
          roleName="Super Admin"
          roleType="admin"
          title="Complete system control"
          description="Full access to all features and settings including user management and billing"
          features={[
            'Full system administration',
            'User and role management',
            'Billing and subscription control',
            'All operational features',
            'System configuration',
            'Security settings',
          ]}
        />
        <RoleDetailsCard
          roleName="User"
          roleType="user"
          title="Operational access"
          description="Full access to all operational features except user management and billing"
          features={[
            'Complete operational control',
            'Customer and product management',
            'Job and quotation management',
            'Fleet and driver management',
            'Reports and analytics',
            'Stockpile management',
          ]}
        />
      </div>

      {/* Upgrade Features Card - Only show if not on PRO plan */}
      {selectedPlanIndex < subscriptionPlans.length - 1 && (
        <UpgradeFeaturesCard
          title="Unlock More Features"
          description={
            selectedPlanIndex === 0
              ? 'Upgrade to QuarryLink Plus for advanced features'
              : 'Upgrade to QuarryLink Pro for advanced features'
          }
          buttonText="Upgrade Plan"
          onUpgrade={() => {
            console.log('Upgrade clicked');
            // TODO: Implement upgrade logic
          }}
        />
      )}
    </div>
  );
}
