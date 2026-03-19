'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { SubscriptionPlanCard } from './roles/subscription-card';
import { PermissionMatrix } from './roles/permission-matrix';
// import { RoleDetailsCard } from './roles/role-details-card';
import { UpgradeFeaturesCard } from './roles/upgrade-features-card';

// ==================== Main RolesTab Component ====================
export default function RolesTab() {
  // Selected plan state (default to first plan)
  const [selectedPlanId, setSelectedPlanId] = React.useState('essentials');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const subscriptionPlans = [
    {
      id: 'essentials',
      price: '$116 user / month',
      planName: 'QuarryLink Essentials',
      description: 'Your Digital Foundation',
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
          name: 'Weighbridge Integration',
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
          name: 'Production Planning',
          permissions: { super_admin: false, user: false },
        },
      ],
    },
    {
      id: 'plus',
      price: '$233 user / month',
      planName: 'QuarryLink Plus',
      description: 'Automate Your Workflows',
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
          name: 'Weighbridge Integration',
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
          name: 'Production Planning',
          permissions: { super_admin: false, user: false },
        },
      ],
    },
    {
      id: 'pro',
      price: 'Custome Pricing / Contact Us',
      mobilePrice: 'Contact Us',
      planName: 'QuarryLink Pro',
      description: 'See Everything, Control Everything',
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
          name: 'Weighbridge Integration',
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
      <div className="border rounded-lg px-6 pt-6 pb-0 space-y-4 bg-white">
        <div>
          <h3 className="font-semibold text-[15px]">
            Current Subscription Plan
          </h3>
          <p className="text-[13px] font-normal text-muted-foreground">
            Select a plan to view its permission matrix and available features
          </p>
        </div>

        {/* Subscription Cards — horizontal scroll on mobile, grid on md+ */}
        <div className="md:hidden flex flex-col gap-3 pb-0">
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                data-plan-id={plan.id}
                className="flex-shrink-0 w-[45vw]"
              >
                <SubscriptionPlanCard
                  price={plan.price}
                  mobilePrice={plan.mobilePrice}
                  planName={plan.planName}
                  description={plan.description}
                  tone={plan.tone}
                  isSelected={selectedPlanId === plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    const el = scrollRef.current;
                    if (!el) return;
                    const cardEl = el.querySelector<HTMLElement>(
                      `[data-plan-id="${plan.id}"]`,
                    );
                    cardEl?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'nearest',
                      inline: 'center',
                    });
                  }}
                />
              </div>
            ))}
          </div>
          {/* Scroll dot indicators */}
          {(() => {
            const activeIndex = subscriptionPlans.findIndex(
              (p) => p.id === selectedPlanId,
            );
            return (
              <div
                role="presentation"
                className="flex justify-center items-center gap-1.5"
              >
                {subscriptionPlans.map((plan, i) => (
                  <div
                    key={plan.id}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      i === activeIndex
                        ? 'bg-[#8E51FF] w-5 h-2'
                        : 'bg-gray-300 w-2 h-2',
                    )}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              price={plan.price}
              planName={plan.planName}
              description={plan.description}
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

      {/* Role Details Cards
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
      </div> */}

      {/* Upgrade Features Card - Disabled, Future Plan */}
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
