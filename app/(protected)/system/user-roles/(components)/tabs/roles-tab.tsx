'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Crown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== SubscriptionPlanCard Component ====================
interface SubscriptionPlanCardProps {
  price: string;
  planName: string;
  description: string;
  maxUsers: string;
  featured?: boolean;
  priceColor?: string;
  priceBgColor?: string;
  priceBorderColor?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

function SubscriptionPlanCard({
  price,
  planName,
  description,
  maxUsers,
  priceColor,
  priceBgColor,
  priceBorderColor,
  isSelected = false,
  onClick,
}: SubscriptionPlanCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'py-3 relative overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white',
        isSelected
          ? `bg-[#FAF5FF] border-2 border-[#AD46FF]`
          : 'border-border hover:border-purple-300'
      )}
    >
      <CardContent className="px-3">
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1 justify-between">
            <div
              className={cn(
                'flex items-baseline gap-1 rounded-md px-1.5 py-0.5 border',
                priceBgColor && `bg-[${priceBgColor}]`,
                priceBorderColor && `border-[${priceBorderColor}]`
              )}
            >
              <span
                className={cn(
                  'text-[10.5px] font-medium',
                  priceColor && `text-[${priceColor}]`
                )}
              >
                {price}
              </span>
              <span
                className={cn(
                  'text-[10.5px] font-medium',
                  priceColor && `text-[${priceColor}]`
                )}
              >
                / mo
              </span>
            </div>
            {isSelected && (
              <Crown className="h-[14px] w-[14px] text-[#9810FA]" />
            )}
          </div>

          {/* Plan Name */}
          <h3 className="text-lg font-semibold text-foreground text-[12.3px]">
            {planName}
          </h3>

          {/* Description */}
          <p className="font-normal text-muted-foreground leading-relaxed text-[10.5px]">
            {description}
          </p>

          {/* Max Users */}
          <p className="font-medium text-foreground text-[10.5px]">
            {maxUsers}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== PermissionMatrix Component ====================
interface PermissionRole {
  name: string;
  isAdmin?: boolean;
}

interface PermissionModule {
  name: string;
  permissions: {
    [roleKey: string]: boolean;
  };
}

interface PermissionMatrixProps {
  title: string;
  description: string;
  roles: PermissionRole[];
  modules: PermissionModule[];
  titleBgColor?: string;
  titleTextColor?: string;
  titleBorderColor?: string;
}

function PermissionMatrix({
  title,
  description,
  roles,
  modules,
  titleBgColor = '#F3F4F6',
  titleTextColor = '#374151',
  titleBorderColor = '#E5E7EB',
}: PermissionMatrixProps) {
  return (
    <Card className="w-full">
      <CardHeader className="py-1">
        <div className="space-y-0.75">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[13.6719px] font-normal">Permission Matrix</h3>
            <span
              className={cn(
                'text-[10.5px] px-1.5 py-0.5 rounded-md font-medium border',
                titleBgColor && `bg-[${titleBgColor}]`,
                titleTextColor && `text-[${titleTextColor}]`,
                titleBorderColor && `border-[${titleBorderColor}]`
              )}
            >
              {title}
            </span>
          </div>
          <p className="text-[13.5625px] font-normal text-muted-foreground">
            {description}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid border-b">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `300px repeat(${roles.length}, 1fr)`,
              }}
            >
              <div className="px-2 py-1 font-medium text-[13.7813px]">
                Module
              </div>
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="px-2 py-1 font-medium text-[13.7813px] text-center flex items-center justify-center gap-2"
                >
                  {role.isAdmin && <Crown className="h-4 w-4 text-[#9810FA]" />}
                  {role.name}
                </div>
              ))}
            </div>
          </div>

          {/* Table Body */}
          <div>
            {modules.map((module, moduleIndex) => (
              <div
                key={moduleIndex}
                className={cn(
                  'grid',
                  moduleIndex % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                )}
                style={{
                  gridTemplateColumns: `300px repeat(${roles.length}, 1fr)`,
                }}
              >
                <div className="px-2 py-2 text-[13.7813px] font-medium">
                  {module.name}
                </div>
                {roles.map((role, roleIndex) => {
                  const roleKey = role.name.toLowerCase().replace(/\s+/g, '_');
                  const hasAccess = module.permissions[roleKey];
                  return (
                    <div
                      key={roleIndex}
                      className="px-4 py-3 flex items-center justify-center"
                    >
                      {hasAccess ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 px-2 py-3 bg-[#F9FAFB] rounded-md space-y-2">
          <div className="font-medium text-foreground text-[13.7813px]">
            Legend:
          </div>
          <div className="flex items-center text-[12.1078px] font-normal justify-between">
            <div className="flex items-center gap-2 w-1/3">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Full Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <X className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">No Access</span>
            </div>
            <div className="flex items-center gap-2 w-1/3">
              <Crown className="h-4 w-4 text-[#9810FA]" />
              <span className="text-muted-foreground">Admin Only</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== RoleDetailsCard Component ====================
interface RoleDetailsCardProps {
  roleName: string;
  roleType: 'admin' | 'user';
  title: string;
  description: string;
  features: string[];
}

function RoleDetailsCard({
  roleName,
  roleType,
  title,
  description,
  features,
}: RoleDetailsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <div className="space-y-3">
          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'w-fit',
                roleType === 'admin'
                  ? 'text-[#6E11B0] border border-[#E9D4FF] bg-[#F3E8FF]'
                  : 'bg-blue-50 text-blue-700 border-blue-300'
              )}
            >
              <span className="font-medium text-[10.5px]">{roleName}</span>
            </Badge>
            {roleType === 'admin' && (
              <Crown className="h-4 w-4 text-[#9810FA]" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15.0594px] font-normal">{title}</h3>

          {/* Description */}
          <p className="text-[13.6719px] font-normal text-[#717182] leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Features List */}
        <ul className="list-disc pl-6 space-y-0">
          {features.map((feature, index) => (
            <li
              key={index}
              className="marker:text-[#99A1AF] marker:text-[11.99px] text-[12.1078px] font-normal text-[#4A5565]"
            >
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ==================== UpgradeFeaturesCard Component ====================
interface UpgradeFeaturesCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onUpgrade?: () => void;
}

function UpgradeFeaturesCard({
  title,
  description,
  buttonText = 'Upgrade Plan',
  onUpgrade,
}: UpgradeFeaturesCardProps) {
  return (
    <Card
      className={cn(
        'w-full border-[#E9D4FF] rounded-[12.75px]',
        'bg-gradient-to-r from-[#FAF5FF] to-[#FFF6FF]'
      )}
    >
      <CardContent className="px-[22px]">
        <div className="flex items-center justify-between gap-4">
          {/* Left Content */}
          <div className="space-y-1">
            <h3 className="text-[14px] font-semibold text-[#101828]">
              {title}
            </h3>
            <p className="text-[12.1078px] text-[#4A5565]">{description}</p>
          </div>

          {/* Right Button */}
          <Button
            onClick={onUpgrade}
            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0 h-[31.5px] rounded-[6.75px] px-[14px] py-[7px] text-[12.3px] font-medium leading-[17.5px] flex items-center gap-2"
          >
            {buttonText}
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== Main RolesTab Component ====================
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

  // useEffect to handle subscription plan changes
  React.useEffect(() => {
    console.log('Selected plan changed:', {
      index: selectedPlanIndex,
      planName: selectedPlan.planName,
      planId: selectedPlan.id,
    });

    // You can add additional logic here when the plan changes
    // For example: fetching data, updating analytics, etc.
  }, [selectedPlanIndex, selectedPlan]);

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
