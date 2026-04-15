'use client';

import { PermissionMatrix } from './roles/permission-matrix';

const roles = [
  { name: 'Super Admin', isAdmin: true },
  { name: 'Admin', isAdmin: false },
  { name: 'Account Manager', isAdmin: false },
  { name: 'Operations', isAdmin: false },
  { name: 'User', isAdmin: false },
  { name: 'Driver', isAdmin: false },
];

const sections = [
  {
    sectionName: 'QuarryLink Core — 3,000 dockets / month',
    modules: [
      {
        name: 'Billing & subscription',
        permissions: {
          super_admin: true,
          admin: false,
          account_manager: false,
          operations: false,
          user: false,
          driver: false,
        },
      },
      {
        name: 'User Management',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: false,
          user: false,
          driver: false,
        },
      },
      {
        name: 'Customer Management',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Products & Pricing',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Quarries & Suppliers',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Quotes',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Jobs, Dockets & Invoicing',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Dispatch & Schedule',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Fleet & Drivers',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Driver App',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: true,
          user: false,
          driver: true,
        },
      },
    ],
  },
  {
    sectionName: 'Active add-ons on your subscription',
    modules: [
      {
        name: 'Loader / Weighbridge Integration',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Reports & Dashboard',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: true,
          operations: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Stockpile Management',
        permissions: {
          super_admin: true,
          admin: true,
          account_manager: false,
          operations: true,
          user: true,
          driver: false,
        },
      },
    ],
  },
];

export default function RolesTab() {
  return (
    <div className="py-3 space-y-3">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
        <p className="text-muted-foreground text-[13px]">
          Module access for each role is based on what&apos;s included in your
          subscription.
        </p>
      </div>

      <PermissionMatrix
        description="Who can use each module on your current subscription. ✓ means access in the web app or Driver App as applicable."
        roles={roles}
        sections={sections}
        footerNote="Billing and subscription settings stay Super Admin only. Drivers are limited to the Driver App row unless your organisation assigns additional roles."
      />
    </div>
  );
}
