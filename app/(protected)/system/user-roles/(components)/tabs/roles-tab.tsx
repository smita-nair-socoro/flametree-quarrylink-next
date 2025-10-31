'use client';

import React from 'react';
import { SubscriptionPlanCard } from './roles-tab/subscription-card';
import { PermissionMatrix } from './roles-tab/permission-matrix';
import { RoleDetailsCard } from './roles-tab/role-details-card';
import { UpgradeFeaturesCard } from './roles-tab/upgrade-features-card';

// ==================== Main RolesTab Component ====================
export default function RolesTab() {
  // Selected plan state (default to first plan)
  const [selectedPlanId, setSelectedPlanId] = React.useState('essentials');

  const subscriptionPlans = [
    {
      id: 'essentials',
      price: '$399',
      planName: 'Essentials',
      description: 'Basic quotation and customer management',
      minUsers: 10,
      tone: 'essentials' as const,
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
      minUsers: 10,
      tone: 'plus' as const,
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
      minUsers: 10,
      tone: 'pro' as const,
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

  const selectedPlan =
    subscriptionPlans.find((plan) => plan.id === selectedPlanId) ||
    subscriptionPlans[0];

  // Permission matrix configuration
  const permissionRoles = [
    { name: 'Super Admin', isAdmin: true },
    { name: 'User', isAdmin: false },
  ];

  return (
    <div className="py-3 space-y-3">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
        <p className="text-muted-foreground text-[13px]">
          Simplified two-tier access control: Super Admin with full control,
          Users with operational access
        </p>
      </div>

      {/* Current Subscription Plan Section */}
      <div className="border rounded-lg p-6 space-y-4 bg-white">
        <div>
          <h3 className="font-medium text-[13px]">Current Subscription Plan</h3>
          <p className="text-[13px] font-normal text-muted-foreground">
            Select a plan to view its permission matrix and available features
          </p>
        </div>

        {/* Subscription Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              price={plan.price}
              planName={plan.planName}
              description={plan.description}
              minUsers={plan.minUsers}
              tone={plan.tone}
              isSelected={selectedPlanId === plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
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
        tone={selectedPlan.tone}
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
      {selectedPlanId !== 'pro' && (
        <UpgradeFeaturesCard
          title="Unlock More Features"
          description={
            selectedPlanId === 'essentials'
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
