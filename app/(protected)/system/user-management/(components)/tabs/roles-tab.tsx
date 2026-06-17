'use client';

import { useState } from 'react';
import { FileText, Truck } from 'lucide-react';

import { PermissionMatrix } from './roles/permission-matrix';
import {
  EmailNotificationGroups,
  type NotificationGroup,
} from './roles/email-notification-groups';
import {
  ManageGroupDialog,
  type GroupMember,
} from './roles/manage-group-dialog';

const roles = [
  { name: 'Super Admin', isAdmin: true },
  { name: 'Admin', isAdmin: true },
  { name: 'User', isAdmin: false },
  { name: 'Driver', isAdmin: false },
];

const sections = [
  {
    sectionName: 'QuarryLink Core Modules',
    modules: [
      {
        name: 'Billing & Subscription',
        permissions: {
          super_admin: true,
          admin: false,
          user: false,
          driver: false,
        },
      },
      {
        name: 'User Management',
        permissions: {
          super_admin: true,
          admin: true,
          user: false,
          driver: false,
        },
      },
      {
        name: 'Customer Management',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Products & Pricing',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Quarries & Suppliers',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Quotations',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Jobs, Dockets & Invoicing',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Dispatch & Schedule',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Fleet & Drivers',
        permissions: {
          super_admin: true,
          admin: true,
          user: true,
          driver: false,
        },
      },
      {
        name: 'Driver App',
        permissions: {
          super_admin: false,
          admin: false,
          user: false,
          driver: true,
        },
      },
    ],
  },
];

const groupDefinitions: Omit<NotificationGroup, 'memberCount'>[] = [
  {
    name: 'Operations',
    icon: Truck,
    description:
      'Receives operational notifications about deliveries, drivers, jobs, and logistics.',
    emailTypes: [
      'Driver assignment changes',
      'Delivery status updates',
      'Job scheduling alerts',
      'Fleet dispatch notifications',
      'Docket completion alerts',
    ],
  },
  {
    name: 'Account Manager',
    icon: FileText,
    manageable: false,
    description:
      'Receives commercial notifications about quotes, customers, and sales activity.',
    emailTypes: [
      'New quote requests',
      'Quote approval notifications',
      'Customer status changes',
      'Pricing updates',
      'Sales activity summaries',
    ],
  },
];

// Dummy current members until the notification group API is available
const initialGroupMembers: Record<string, GroupMember[]> = {
  Operations: [
    {
      id: 'sarah.chen@quarrydemo.com',
      name: 'Sarah Chen',
      email: 'sarah.chen@quarrydemo.com',
      role: 'Admin',
    },
    {
      id: 'mike.j@quarrydemo.com',
      name: 'Mike Johnson',
      email: 'mike.j@quarrydemo.com',
      role: 'User',
    },
    {
      id: 'lisa.w@quarrydemo.com',
      name: 'Lisa Wong',
      email: 'lisa.w@quarrydemo.com',
      role: 'User',
    },
  ],
  'Account Manager': [
    {
      id: 'emma.d@quarrydemo.com',
      name: 'Emma Davis',
      email: 'emma.d@quarrydemo.com',
      role: 'Admin',
    },
    {
      id: 'james.w@quarrydemo.com',
      name: 'James Wilson',
      email: 'james.w@quarrydemo.com',
      role: 'User',
    },
  ],
};

export default function RolesTab() {
  const [groupMembers, setGroupMembers] =
    useState<Record<string, GroupMember[]>>(initialGroupMembers);
  const [managedGroupName, setManagedGroupName] = useState<string | null>(null);

  const notificationGroups: NotificationGroup[] = groupDefinitions.map(
    (group) => ({
      ...group,
      memberCount: groupMembers[group.name]?.length ?? 0,
    }),
  );

  const managedGroup =
    notificationGroups.find((group) => group.name === managedGroupName) ?? null;

  const handleAddMembers = (added: GroupMember[]) => {
    if (!managedGroupName) return;
    setGroupMembers((prev) => ({
      ...prev,
      [managedGroupName]: [...(prev[managedGroupName] ?? []), ...added],
    }));
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (!managedGroupName) return;
    setGroupMembers((prev) => ({
      ...prev,
      [managedGroupName]: (prev[managedGroupName] ?? []).filter(
        (m) => m.id !== member.id,
      ),
    }));
  };

  return (
    <div className="py-3 space-y-3">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Roles & Permissions</h2>
        <p className="text-muted-foreground text-[13px]">
          Manage permission roles and email notification groups for your team.
        </p>
      </div>

      <PermissionMatrix
        description="Access levels for each permission role across QuarryLink Core modules. ✓ means full access in the web app or Driver App as applicable."
        roles={roles}
        sections={sections}
        footerNote="Super Admins have full access including billing and subscription settings. Admins can manage users and operational data. Users have access to day-to-day operations. Drivers are limited to the Driver App for their assigned deliveries."
      />

      <EmailNotificationGroups
        description="Allocate team members to notification groups based on their operational responsibilities. These groups control which transactional emails users receive from the system."
        groups={notificationGroups}
        footerNote="Note: Only Super Admins and Admins can manage notification group membership. Changes take effect immediately and will apply to the next email sent. Group membership does not affect system permissions or access levels."
        onManage={(groupName) => {
          setManagedGroupName(groupName);
        }}
      />

      <ManageGroupDialog
        group={managedGroup}
        members={managedGroupName ? (groupMembers[managedGroupName] ?? []) : []}
        open={managedGroup !== null}
        onOpenChange={(open) => {
          if (!open) setManagedGroupName(null);
        }}
        onAddMembers={handleAddMembers}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}
