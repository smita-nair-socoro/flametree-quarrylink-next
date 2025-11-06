'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Plus, Bug } from 'lucide-react';
import { PendingInvitation, User } from '@/lib/types/user';
import { Role, UserStatus } from '@/lib/types/user-enums';
import { createTeamMemberColumns } from '../(data-tables)/team-member/columns';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Button } from '@/components/ui/button';
import { getRelativeTimeFuture } from '@/lib/utils/date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamMemberStore } from '@/app/stores/team-member-store';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { FormSelectOption } from '@/components/ui/form-select';

// Mock data for team members
const teamMemberMockData: User[] = [
  {
    id: 1,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Armin Menhaji',
    phone: '+61412345678',
    email: 'armin@terminco.com.au',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    total_logins: 120,
    quotation_created: 15,
    jobs_managed: 8,
    invited_by: 0,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-29T13:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 2,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Sarah Johnson',
    phone: '+61412345679',
    email: 'sarah@terminco.com.au',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    total_logins: 0,
    quotation_created: 0,
    jobs_managed: 0,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: null,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 3,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Mike Chen',
    phone: '+61412345680',
    email: 'mike@terminco.com.au',
    role: Role.ADMIN,
    status: UserStatus.PENDING,
    total_logins: 5,
    quotation_created: 2,
    jobs_managed: 1,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-30T19:11:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 4,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Emma Wilson',
    phone: '+61412345681',
    email: 'emma.wilson@terminco.com.au',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    total_logins: 45,
    quotation_created: 8,
    jobs_managed: 3,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-30T23:11:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 5,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'David Martinez',
    phone: '+61412345682',
    email: 'david.martinez@terminco.com.au',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    total_logins: 32,
    quotation_created: 5,
    jobs_managed: 2,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-24T22:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 6,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Lisa Anderson',
    phone: '+61412345683',
    email: 'lisa.anderson@terminco.com.au',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    total_logins: 78,
    quotation_created: 12,
    jobs_managed: 5,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-30T13:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 7,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'James Brown',
    phone: '+61412345684',
    email: 'james.brown@terminco.com.au',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    total_logins: 25,
    quotation_created: 3,
    jobs_managed: 0,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-30T13:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 8,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Maria Garcia',
    phone: '+61412345685',
    email: 'maria.garcia@terminco.com.au',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    total_logins: 15,
    quotation_created: 4,
    jobs_managed: 1,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-10-30T00:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 9,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Tom Rodriguez',
    phone: '+61412345686',
    email: 'tom.rodriguez@terminco.com.au',
    role: Role.USER,
    status: UserStatus.PENDING,
    total_logins: 0,
    quotation_created: 0,
    jobs_managed: 0,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: null,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 10,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Jessica Lee',
    phone: '+61412345687',
    email: 'jessica.lee@terminco.com.au',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    total_logins: 95,
    quotation_created: 10,
    jobs_managed: 4,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    last_login_at: '2025-09-28T22:00:00.000Z',
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
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
  { label: 'Admin', value: Role.ADMIN },
  { label: 'User', value: Role.USER },
  { label: 'Super Admin', value: Role.SUPERADMIN },
];

export default function TeamAdminTab() {
  // Debug mode state for testing different UI states
  const [debugMode, setDebugMode] = React.useState(false);
  const [debugCount, setDebugCount] = React.useState<number>(5);

  // Use Zustand store for selected team member
  const setSelectedTeamMember = useTeamMemberStore(state => state.setSelectedTeamMember);

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

  // Calculate team member count based on debug mode
  const teamMemberCount = debugMode ? debugCount : teamMemberMockData.length;

  // Create columns with roles and currentUserId
  const columns = React.useMemo(
    () => createTeamMemberColumns(rolesOptions, 1),
    [rolesOptions]
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
              {/* Debug Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Bug className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Debug Mode:
                </span>
                <Button
                  variant={debugMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDebugMode(!debugMode)}
                  className="h-7 text-xs"
                >
                  {debugMode ? 'ON' : 'OFF'}
                </Button>
                {debugMode && (
                  <Select
                    value={debugCount.toString()}
                    onValueChange={(value) => setDebugCount(parseInt(value))}
                  >
                    <SelectTrigger className="h-7 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Under Limit (5)</SelectItem>
                      <SelectItem value="10">Over Limit (10)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <FormDialog
                dialogTitle="Invite User"
                dialogWidth="max-w-md"
                buttonTitle="Invite User"
                key={teamMemberCount}
              >
                <InviteUserForm teamMemberCount={teamMemberCount} />
              </FormDialog>
            </div>
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <DataTableClient
              tableId="team_member_data_table"
              data={teamMemberMockData}
              columns={columns}
              facetDefination={facetDefs}
              searchPlaceHolder="Search team members..."
              onRowClick={handleRowClick}
              useColumnSizing={true}
              isShowHideColumns={false}
            />
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
                        {invitation.role === Role.USER
                          ? 'User'
                          : invitation.role === Role.ADMIN
                          ? 'Admin'
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
                  <div className="flex gap-2 text-[14px] font-medium text-[#09090B] ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(invitation)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke(invitation)}
                    >
                      Revoke
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
