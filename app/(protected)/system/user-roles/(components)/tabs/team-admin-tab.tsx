'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Plus } from 'lucide-react';
import { PendingInvitation, User } from '@/lib/types/user';
import { Role, UserStatus } from '@/lib/types/user-enums';
import { teamMemberColumns } from '../(data-tables)/team-member/columns';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import { Button } from '@/components/ui/button';
import { getRelativeTimeFuture } from '@/lib/utils/date';
import { useTeamMemberStore } from '@/app/stores/team-member-store';
import { EditTeamMemberForm } from '../forms/team-member-form';
import { FormSelectOption } from '@/components/ui/form-select';

// Mock data for team members
const teamMemberMockData: User[] = [
  {
    id: 1,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Armin Menhaji',
    email: 'armin@terminco.com.au',
    phone: '+61 400 000 001',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-29T13:00:00.000Z',
    total_logins: 156,
    quotation_created: 23,
    jobs_managed: 12,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 2,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Sarah Johnson',
    email: 'sarah@terminco.com.au',
    phone: '+61 400 000 002',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    last_login_at: null,
    total_logins: 89,
    quotation_created: 15,
    jobs_managed: 8,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 3,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Mike Chen',
    email: 'mike@terminco.com.au',
    phone: '+61 400 000 003',
    role: Role.ADMIN,
    status: UserStatus.PENDING,
    last_login_at: '2025-10-30T19:11:00.000Z',
    total_logins: 0,
    quotation_created: 0,
    jobs_managed: 0,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 4,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Emma Wilson',
    email: 'emma.wilson@terminco.com.au',
    phone: '+61 400 000 004',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-30T23:11:00.000Z',
    total_logins: 45,
    quotation_created: 12,
    jobs_managed: 6,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 5,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'David Martinez',
    email: 'david.martinez@terminco.com.au',
    phone: '+61 400 000 005',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-24T22:00:00.000Z',
    total_logins: 72,
    quotation_created: 8,
    jobs_managed: 4,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 6,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Lisa Anderson',
    email: 'lisa.anderson@terminco.com.au',
    phone: '+61 400 000 006',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-30T13:00:00.000Z',
    total_logins: 120,
    quotation_created: 18,
    jobs_managed: 10,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 7,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'James Brown',
    email: 'james.brown@terminco.com.au',
    phone: '+61 400 000 007',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-30T13:00:00.000Z',
    total_logins: 65,
    quotation_created: 9,
    jobs_managed: 5,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 8,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Maria Garcia',
    email: 'maria.garcia@terminco.com.au',
    phone: '+61 400 000 008',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-10-30T00:00:00.000Z',
    total_logins: 34,
    quotation_created: 6,
    jobs_managed: 3,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 9,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Tom Rodriguez',
    email: 'tom.rodriguez@terminco.com.au',
    phone: '+61 400 000 009',
    role: Role.USER,
    status: UserStatus.PENDING,
    last_login_at: null,
    total_logins: 0,
    quotation_created: 0,
    jobs_managed: 0,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
    created_at: '2025-10-30T13:00:00.000Z',
    updated_at: '2025-10-30T13:00:00.000Z',
  },
  {
    id: 10,
    tenant_id: 'Tenant-001',
    client_id: 1,
    full_name: 'Jessica Lee',
    email: 'jessica.lee@terminco.com.au',
    phone: '+61 400 000 010',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    last_login_at: '2025-09-28T22:00:00.000Z',
    total_logins: 98,
    quotation_created: 20,
    jobs_managed: 11,
    invited_by: 1,
    deletion_reason: '',
    isDeleted: false,
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
  const [viewOpen, setViewOpen] = React.useState(false);
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember
  );

  // Handle row click to open member details
  const handleRowClick = (member: User) => {
    setSelectedTeamMember(member);
    setViewOpen(true);
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'role', title: 'Role', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  // Render view/edit dialog
  const viewDialog = viewOpen ? (
    <FormDialog
      dialogTitle="Edit Team Member"
      open={viewOpen}
      onOpenChangeAction={(open) => {
        setViewOpen(open);
        if (!open) {
          setViewOpen(false);
        }
      }}
      hideTrigger
    >
      <EditTeamMemberForm roles={rolesOptions} currentUserId={1} />
    </FormDialog>
  ) : null;

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
                dialogDescription="Send an invitation to a new team member with their assigned role and contact information."
                dialogWidth="max-w-md"
                buttonTitle="Invite User"
              >
                <InviteUserForm />
              </FormDialog>
            </div>
          </div>

          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <DataTableClient
              tableId="team_member_data_table"
              data={teamMemberMockData}
              columns={teamMemberColumns}
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
