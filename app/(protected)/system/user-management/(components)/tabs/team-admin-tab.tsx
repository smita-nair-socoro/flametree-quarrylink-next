'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Plus, RotateCcwSquare, Delete, Loader2 } from 'lucide-react';
import { PendingInvitation, User } from '@/lib/types/user';
import { Role, UserStatus } from '@/lib/types/user-enums';
import { createTeamMemberColumns } from '../(data-tables)/team-member/columns';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Button } from '@/components/ui/button';
import { getRelativeTimeFuture } from '@/lib/utils/date';
import { useTeamMemberStore } from '@/app/stores/team-member-store';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { FormSelectOption } from '@/components/ui/form-select';
import { TableSkeleton } from '@/components/table-skeleton';

// Mock data for team members
const teamMemberMockData: User[] = [
  {
    id: 1,
    tenantId: 1,
    clientId: 1,
    name: 'Armin Menhaji',
    phone: '+61412345678',
    email: 'armin@terminco.com.au',
    groups: '[SUPERADMIN]',
    status: UserStatus.ACTIVE,
    totalLogins: 120,
    quotationCreated: 15,
    lastLoginAt: '2025-10-29T13:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 2,
    tenantId: 1,
    clientId: 1,
    name: 'Sarah Johnson',
    phone: '+61412345679',
    email: 'sarah@terminco.com.au',
    groups: '[SUPERADMIN]',
    status: UserStatus.DELETED,
    totalLogins: 0,
    quotationCreated: 0,
    lastLoginAt: null,
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 3,
    tenantId: 1,
    clientId: 1,
    name: 'Mike Chen',
    phone: '+61412345680',
    email: 'mike@terminco.com.au',
    groups: '[SUPERADMIN]',
    status: UserStatus.PENDING,
    totalLogins: 5,
    quotationCreated: 2,
    lastLoginAt: '2025-10-30T19:11:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 4,
    tenantId: 1,
    clientId: 1,
    name: 'Emma Wilson',
    phone: '+61412345681',
    email: 'emma.wilson@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.INACTIVE,
    totalLogins: 45,
    quotationCreated: 8,
    lastLoginAt: '2025-10-30T23:11:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 5,
    tenantId: 1,
    clientId: 1,
    name: 'David Martinez',
    phone: '+61412345682',
    email: 'david.martinez@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.ACTIVE,
    totalLogins: 32,
    quotationCreated: 5,
    lastLoginAt: '2025-10-24T22:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 6,
    tenantId: 1,
    clientId: 1,
    name: 'Lisa Anderson',
    phone: '+61412345683',
    email: 'lisa.anderson@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.ACTIVE,
    totalLogins: 78,
    quotationCreated: 12,
    lastLoginAt: '2025-10-30T13:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 7,
    tenantId: 1,
    clientId: 1,
    name: 'James Brown',
    phone: '+61412345684',
    email: 'james.brown@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.ACTIVE,
    totalLogins: 25,
    quotationCreated: 3,
    lastLoginAt: '2025-10-30T13:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 8,
    tenantId: 1,
    clientId: 1,
    name: 'Maria Garcia',
    phone: '+61412345685',
    email: 'maria.garcia@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.ACTIVE,
    totalLogins: 15,
    quotationCreated: 4,
    lastLoginAt: '2025-10-30T00:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 9,
    tenantId: 1,
    clientId: 1,
    name: 'Tom Rodriguez',
    phone: '+61412345686',
    email: 'tom.rodriguez@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.PENDING,
    totalLogins: 0,
    quotationCreated: 0,
    lastLoginAt: null,
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 10,
    tenantId: 1,
    clientId: 1,
    name: 'Jessica Lee',
    phone: '+61412345687',
    email: 'jessica.lee@terminco.com.au',
    groups: '[SUPERADMIN]',
    status: UserStatus.ACTIVE,
    totalLogins: 95,
    quotationCreated: 10,
    lastLoginAt: '2025-09-28T22:00:00.000Z',
    createdAt: '2025-10-30T13:00:00.000Z',
    updatedAt: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 11,
    tenantId: 1,
    clientId: 1,
    name: 'John Deleted',
    phone: '+61412345688',
    email: 'john.deleted@terminco.com.au',
    groups: '[USER]',
    status: UserStatus.DELETED,
    totalLogins: 50,
    quotationCreated: 5,
    lastLoginAt: '2025-09-15T10:00:00.000Z',
    createdAt: '2025-08-01T13:00:00.000Z',
    updatedAt: '2025-09-20T13:00:00.000Z',
  },
];

// Mock data for pending invitations
const pendingInvitationsMockData: PendingInvitation[] = [
  {
    id: 1,
    tenant_id: 'Tenant-001',
    email: 'new@company.com',
    role: Role.USER,
    invited_by: 'John Doe',
    expires_at: '2025-11-05T13:00:00.000Z',
  },
  {
    id: 2,
    tenant_id: 'Tenant-001',
    email: 'temp@company.com',
    role: Role.USER,
    invited_by: 'Sarah M',
    expires_at: '2025-11-02T13:00:00.000Z',
  },
];

const handleResend = (invitation: PendingInvitation) => {
  // TODO: Implement resend invitation functionality
  console.log('Resend invitation to:', invitation.email);
};

const handleRevoke = (invitation: PendingInvitation) => {
  // TODO: Implement revoke invitation functionality
  console.log('Revoke invitation for:', invitation.email);
};

// Roles options for the form
const rolesOptions: readonly FormSelectOption[] = [
  { label: 'User', value: Role.USER },
  { label: 'Super Admin', value: Role.SUPERADMIN },
];

export default function TeamAdminTab() {
  // Simulate loading state (remove this when using real API)
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFetching, setIsFetching] = React.useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars

  React.useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Use Zustand store for selected team member
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember
  );

  // Separate state for the actions hook (like customer implementation)
  const [selectedTeamMemberForActions, setSelectedTeamMemberForActions] =
    React.useState<User | null>(null);

  const { actions, viewDialog } = useTeamMemberActions(
    selectedTeamMemberForActions?.id,
    selectedTeamMemberForActions,
    rolesOptions,
    1
  );

  // Handle row click to open member details
  const handleRowClick = (member: User) => {
    setSelectedTeamMember(member);
    setSelectedTeamMemberForActions(member);
    actions.viewEdit();
  };

  // Calculate team member count based on actual data
  const teamMemberCount = teamMemberMockData.length;

  // Create columns with roles and currentUserId
  const columns = React.useMemo(
    () => createTeamMemberColumns(rolesOptions, 1),
    [] // rolesOptions is a constant, no need to track it
  );

  const facetDefs: FacetDefinition[] = [
    { column: 'role', title: 'Role', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <>
      {viewDialog}
      <div className="flex flex-1 flex-col gap-4 py-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Team Management</h2>
          </div>
        </div>

        <div className="border border-[#E4E4E7] rounded-lg bg-white p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-2xl font-medium mb-4 text-[#09090B]">
                Team Members
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <FormDialog
                dialogTitle="Invite User"
                dialogWidth="max-w-md"
                buttonTitle="Invite User"
                headerClassName="pb-2 h-[32px] pt-10"
                preserveEmptyBadgeSpace={false}
                key={teamMemberCount}
              >
                <InviteUserForm
                  teamMemberCount={teamMemberCount}
                  roleOptions={rolesOptions}
                />
              </FormDialog>
            </div>
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            {isLoading ? (
              <TableSkeleton rows={8} columns={5} />
            ) : (
              <div className="relative">
                {/* Subtle loading indicator during background refresh */}
                {isFetching && !isLoading && (
                  <div className="absolute top-2 right-2 z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                <DataTableClient
                  tableId="team_member_data_table"
                  data={teamMemberMockData.filter(
                    (member) =>
                      member.status !== UserStatus.DELETED &&
                      member.status !== UserStatus.INACTIVE
                  )}
                  columns={columns}
                  facetDefination={facetDefs}
                  searchPlaceHolder="Search team members..."
                  onRowClick={handleRowClick}
                  useColumnSizing={true}
                  isShowHideColumns={false}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border border-[#E4E4E7] rounded-lg bg-white p-6">
          <h3 className="text-[24px] font-semibold mb-4">
            Pending Invitations
          </h3>
          <div className="space-y-3">
            {pendingInvitationsMockData.map((invitation) => (
              <div
                key={invitation.id}
                className="border border-gray-200 rounded-lg bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-[16px]">
                      {invitation.email}
                    </div>
                    <div className="text-[14px] text-[#4B5563] font-normal mt-1">
                      <span>
                        Role:{' '}
                        {invitation.role === Role.USER ? 'User' : 'Super Admin'}
                      </span>
                      <span className="mx-2">•</span>
                      <span>Invited by: {invitation.invited_by}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Expires in:{' '}
                        {getRelativeTimeFuture(invitation.expires_at)}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex overflow-hidden rounded-md border bg-white text-[14px] font-medium text-[#09090B] ml-4">
                    <Button
                      variant="outline"
                      className="rounded-none px-4 h-auto py-2.5 gap-2 bg-white border-0 border-r"
                      onClick={() => handleResend(invitation)}
                    >
                      <RotateCcwSquare className="h-4 w-4" />
                      Resend Invitation
                    </Button>

                    <Button
                      variant="outline"
                      className="rounded-none px-4 h-auto py-2.5 gap-2 bg-[#FEF2F2] text-red-600 hover:text-red-600 border-0"
                      onClick={() => handleRevoke(invitation)}
                    >
                      <Delete className="h-4 w-4" />
                      Delete User
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
