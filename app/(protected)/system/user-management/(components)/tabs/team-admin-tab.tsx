'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { RotateCcwSquare, Delete, Loader2 } from 'lucide-react';
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
import { useUserStore } from '@/app/stores/user-store';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { FormSelectOption } from '@/components/ui/form-select';
import { TableSkeleton } from '@/components/table-skeleton';
import { useQuery } from '@tanstack/react-query';
import {
  isUserSuperAdmin,
  getRoleLabel,
  getHighestRole,
  getInitials,
  getAvatarColor,
} from '@/lib/utils/user-helper';
import {
  UsersListQueryOptions,
  useResendUserInvitation,
  useDeleteUser,
} from '@/lib/api/user';
import { UserDelete } from '@/lib/types/user';
import { notifyError, notifySuccess } from '@/lib/toast';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TeamMemberTableActions } from '../(data-tables)/team-member/team-member-table-actions';

const allRolesOptions: readonly FormSelectOption[] = [
  { label: 'User', value: Role.USER },
  { label: 'Admin', value: Role.ADMIN },
  { label: 'Super Admin', value: Role.SUPERADMIN },
];



export default function TeamAdminTab() {
  const isMobile = useMediaQuery('(max-width: 910px)');
  const userGroups = useUserStore((state) => state.userGroups);
  const currentUser = useUserStore((state) => state.user);
  const isSuperAdmin = useUserStore((state) => state.isSuperAdmin());

  React.useEffect(() => {
    console.log('[TeamAdminTab] userGroups:', userGroups);
  }, [userGroups]);

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

  // Convert pending users from API to PendingInvitation format
  const pendingInvitations: PendingInvitation[] = React.useMemo(() => {
    const pending = (users || [])
      .filter((user) => user.status === UserStatus.PENDING)
      .map((user) => ({
        id: user.id || 0,
        sub: user.sub,
        tenant_id: user.tenantId || '',
        email: user.email,
        role: getHighestRole(user.groups),
        invited_by: 'System', // API doesn't provide this, using placeholder
        expires_at: user.createdAt
          ? new Date(
              new Date(user.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString() // 7 days from creation
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

    return pending;
  }, [users]);

  // Use Zustand store for selected team member
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember,
  );

  const resendInvitationMutation = useResendUserInvitation();
  const deleteUserMutation = useDeleteUser();

  const handleResend = async (invitation: PendingInvitation) => {
    try {
      await resendInvitationMutation.mutateAsync(invitation.sub);
      notifySuccess('Invitation resent successfully.');
    } catch {
      notifyError('Failed to resend invitation.');
    }
  };

  const handleRevoke = async (invitation: PendingInvitation) => {
    const payload: UserDelete = { reassignments: { customers: [] } };
    try {
      await deleteUserMutation.mutateAsync({ id: invitation.sub, data: payload });
      notifySuccess('User deleted successfully.');
    } catch {
      notifyError('Failed to delete user.');
    }
  };

  // Separate state for the actions hook (like customer implementation)
  const [selectedTeamMemberForActions, setSelectedTeamMemberForActions] =
    React.useState<User | null>(null);

  // Admins cannot assign Super Admin role; filter it out for non-super-admins
  const rolesOptions = React.useMemo(
    () =>
      isSuperAdmin
        ? allRolesOptions
        : allRolesOptions.filter((r) => r.value !== Role.SUPERADMIN),
    [isSuperAdmin],
  );

  const { actions, viewDialog } = useTeamMemberActions(
    selectedTeamMemberForActions?.sub,
    selectedTeamMemberForActions,
    rolesOptions,
    currentUser?.sub,
  );

  // Handle row click to open member details
  const handleRowClick = (member: User) => {
    // Admins cannot edit Super Admins
    if (!isSuperAdmin && isUserSuperAdmin(member.groups)) return;
    setSelectedTeamMember(member);
    setSelectedTeamMemberForActions(member);
    actions.viewEdit();
  };

  // Create columns with roles and currentUserId
  const columns = React.useMemo(
    () => createTeamMemberColumns(rolesOptions, currentUser?.sub),
    [rolesOptions, currentUser?.sub],
  );

  const facetDefs: FacetDefinition[] = [
    { column: 'role', title: 'Role' },
  ];

  const renderTeamMemberCard = React.useCallback(
    (user: User, onViewDetails?: () => void) => {
      // Admins cannot view/edit Super Admins — suppress the detail handler
      const effectiveOnViewDetails =
        !isSuperAdmin && isUserSuperAdmin(user.groups)
          ? undefined
          : onViewDetails;
      const initials = getInitials(user.name, user.email);
      const color = getAvatarColor(user.name || user.email || '');
      const roleLabel = getRoleLabel(user.groups);

      return (
        <div
          className="flex items-center gap-3 border-t border-[#E4E4E7] bg-white px-4 py-3 transition-colors hover:bg-gray-50"
          onClick={effectiveOnViewDetails}
          role={effectiveOnViewDetails ? 'button' : undefined}
          tabIndex={effectiveOnViewDetails ? 0 : undefined}
          onKeyDown={
            effectiveOnViewDetails
              ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    effectiveOnViewDetails();
                  }
                }
              : undefined
          }
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {user.name || '—'}
            </div>
            <div className="truncate text-sm text-gray-500">{user.email}</div>
            <span className="mt-1 inline-block rounded-full border border-[#F5F3FF] bg-[#F5F3FF] px-2 py-0.5 text-xs font-medium text-[#7008E7]">
              {roleLabel}
            </span>
          </div>

          <div
            className="flex-shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            <TeamMemberTableActions
              teamMember={user}
              roles={rolesOptions}
              currentUserId={currentUser?.sub}
            />
          </div>
        </div>
      );
    },
    [isSuperAdmin, rolesOptions, currentUser?.sub],
  );

  return (
    <>
      {viewDialog}
      <div className="flex flex-1 flex-col gap-4 py-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-2xl font-semibold">Team Management</h2>
          </div>
        </div>

        <div
          className={`border border-[#E4E4E7] rounded-lg bg-white overflow-hidden ${isMobile ? '' : 'p-6'}`}
        >
          <div
            className={`flex flex-row justify-between items-center gap-2 ${isMobile ? 'px-4 pt-4 pb-3' : 'mb-4'}`}
          >
            <div>
              <h1 className="text-2xl font-medium text-[#09090B]">
                Team Members
              </h1>
            </div>
            <div>
              <FormDialog
                dialogTitle="Invite User"
                dialogWidth="max-w-md"
                buttonTitle={isMobile ? 'Invite' : 'Invite User'}
                headerClassName="pb-2 h-[32px] pb-6"
                preserveEmptyBadgeSpace={false}
              >
                <InviteUserForm roleOptions={rolesOptions} />
              </FormDialog>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={8} columns={5} />
          ) : (
            <div className="min-h-0 flex-1 rounded-xl">
              <div className="relative [&>div>div:first-child>div:first-child]:px-4 [&>div>div:first-child>div:first-child]:md:px-0 [&>div>div.space-y-3]:!space-y-0">
                {isFetching && !isLoading && (
                  <div className="absolute top-2 right-2 z-10">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                <DataTableClient
                  tableId="team_member_data_table"
                  data={users || []}
                  columns={columns}
                  facetDefinition={facetDefs}
                  searchPlaceHolder="Search team members..."
                  onRowClick={handleRowClick}
                  useColumnSizing={true}
                  isShowHideColumns={false}
                  defaultSorting={[{ id: 'name', desc: false }]}
                  mobileCardRenderer={renderTeamMemberCard}
                  mobileUseTablePagination={true}
                />
              </div>
            </div>
          )}
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
                        disabled={resendInvitationMutation.isPending}
                        onClick={() => handleResend(invitation)}
                      >
                        <RotateCcwSquare className="h-4 w-4" />
                        Resend Invitation
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-none px-4 h-auto py-2.5 gap-2 bg-[#FEF2F2] text-red-600 hover:text-red-600 border-0"
                        disabled={deleteUserMutation.isPending}
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
