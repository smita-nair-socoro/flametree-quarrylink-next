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
import { useQuery } from '@tanstack/react-query';
import { UsersListQueryOptions } from '@/lib/api/user';

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
  // Fetch users from API
  const {
    data: users = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    ...UsersListQueryOptions(),
    retry: false, // Don't retry on failure to prevent multiple logout attempts
  });

  React.useEffect(() => {
    if (error) {
      console.error('[TeamAdminTab] API Error', {
        message: (error as Error).message,
        error: error,
      });
    }
  }, [error]);

  React.useEffect(() => {
    if (users && users.length > 0) {
      console.log('[TeamAdminTab] Users data:', users);
    } else if (users && users.length === 0) {
      console.log('[TeamAdminTab] ⚠️ No users returned from API');
    }
  }, [users]);

  // Helper function to convert groups array to Role string for display
  const getHighestRole = (groups: string[] | undefined): Role => {
    if (!groups || !Array.isArray(groups)) return Role.USER;
    const groupsStr = groups.join(',').toLowerCase();
    if (groupsStr.includes('super_admin') || groupsStr.includes('superadmin')) {
      return Role.SUPERADMIN;
    }
    if (groupsStr.includes('admin')) return Role.USER; // Map admin to USER for now
    return Role.USER;
  };

  // Convert pending users from API to PendingInvitation format
  const pendingInvitations: PendingInvitation[] = React.useMemo(() => {
    const pending = users
      .filter((user) => user.status === UserStatus.PENDING)
      .map((user) => ({
        id: user.id || 0, // Fallback to 0 if no id (should use sub for unique identifier)
        tenant_id: user.tenantId || '',
        email: user.email,
        role: getHighestRole(user.groups),
        invited_by: 'System', // API doesn't provide this, using placeholder
        expires_at: user.createdAt
          ? new Date(
              new Date(user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
            ).toISOString() // 7 days from creation
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

    return pending;
  }, [users]);

  // Use Zustand store for selected team member
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember
  );

  // Separate state for the actions hook (like customer implementation)
  const [selectedTeamMemberForActions, setSelectedTeamMemberForActions] =
    React.useState<User | null>(null);

  const { actions, viewDialog } = useTeamMemberActions(
    selectedTeamMemberForActions?.sub,
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
  const teamMemberCount = users.length;

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
                  data={users.filter(
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

        {pendingInvitations.length > 0 && (
          <div className="border border-[#E4E4E7] rounded-lg bg-white p-6">
            <h3 className="text-[24px] font-semibold mb-4">
              Pending Invitations ({pendingInvitations.length})
            </h3>
            <div className="space-y-3">
              {pendingInvitations.map((invitation, index) => (
                <div
                  key={`${invitation.email}-${index}`}
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
                          {invitation.role === Role.USER
                            ? 'User'
                            : 'Super Admin'}
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
        )}
      </div>
    </>
  );
}
