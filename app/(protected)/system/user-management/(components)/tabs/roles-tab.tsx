'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Truck } from 'lucide-react';

import {
  UsersListQueryOptions,
  OperationsListQueryOptions,
  useAddUserToOperations,
  useRemoveUserFromOperations,
} from '@/lib/api/user';
import { UserKeys } from '@/lib/api/keys';
import { getRoleLabel } from '@/lib/utils/user-helper';
import { notifyError, notifySuccess } from '@/lib/toast';
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
      'Receives operational notifications about jobs, dockets, deliveries, and vehicle compliance.',
    emailTypes: [
      'Pre-start check failures',
      'Vehicle inspection failures',
      'Job status changes',
      'Docket interruptions (Stop/Cancel/Void)',
    ],
  },
  {
    name: 'Account Manager',
    icon: FileText,
    manageable: false,
    description:
      'Receives job, docket, and quote notifications for their linked customer accounts.',
    emailTypes: [
      'Quote approval notifications',
      'Quote decline notifications',
      'Job status changes',
      'Docket interruptions (Stop/Cancel/Void)',
    ],
  },
];

export default function RolesTab() {
  const [managedGroupName, setManagedGroupName] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery(UsersListQueryOptions());
  const { data: operations = [] } = useQuery(OperationsListQueryOptions());

  const addToOperations = useAddUserToOperations();
  const removeFromOperations = useRemoveUserFromOperations();

  const refreshOperations = () =>
    queryClient.invalidateQueries({ queryKey: UserKeys.operations() });

  // Every non-driver user belongs to the Account Manager group.
  const accountManagerCount = users.filter(
    (user) => getRoleLabel(user.groups) !== 'Driver',
  ).length;

  // Current members of the Operations notification group.
  const operationMembers: GroupMember[] = operations.map((user) => ({
    id: user.sub,
    name: user.name,
    email: user.email,
    role: getRoleLabel(user.groups),
  }));

  const memberCountByGroup: Record<string, number> = {
    'Account Manager': accountManagerCount,
    Operations: operationMembers.length,
  };

  const notificationGroups: NotificationGroup[] = groupDefinitions.map(
    (group) => ({
      ...group,
      memberCount: memberCountByGroup[group.name] ?? 0,
    }),
  );

  const managedGroup =
    notificationGroups.find((group) => group.name === managedGroupName) ?? null;

  const managedMembers =
    managedGroupName === 'Operations' ? operationMembers : [];

  const handleAddMembers = async (added: GroupMember[]) => {
    if (managedGroupName !== 'Operations' || added.length === 0) return;
    try {
      await Promise.all(
        added.map((member) => addToOperations.mutateAsync(member.id)),
      );
      notifySuccess(
        `Added ${added.length} member${added.length > 1 ? 's' : ''} to the Operations group.`,
      );
    } catch {
      notifyError('Failed to add some members to the Operations group.');
    } finally {
      refreshOperations();
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    if (managedGroupName !== 'Operations') return;
    try {
      await removeFromOperations.mutateAsync(member.id);
      notifySuccess(`Removed ${member.name} from the Operations group.`);
    } catch {
      notifyError(`Failed to remove ${member.name} from the Operations group.`);
    } finally {
      refreshOperations();
    }
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
        members={managedMembers}
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
