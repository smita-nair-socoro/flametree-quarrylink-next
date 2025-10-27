'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TeamMember } from '@/lib/types/team-member';
import {
  TEAM_MEMBER_STATUS,
  TEAM_MEMBER_ROLE,
} from '@/lib/types/team-member-enums';
import { teamMemberColumns } from '../(data-tables)/team-member/columns';
import {
  DataTableClient,
  FacetDefinition,
} from '@/components/ui/data-table-client';
import PendingInvitations from '../pending-invitations';

// Mock data for team members
const TeamsMemberMockData: TeamMember[] = [
  {
    id: 1,
    user_name: 'Armin Menhaji',
    email: 'armin@terminco.com.au',
    role: TEAM_MEMBER_ROLE.ADMIN,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    user_name: 'Sarah Johnson',
    email: 'sarah@terminco.com.au',
    role: TEAM_MEMBER_ROLE.ADMIN,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    user_name: 'Mike Chen',
    email: 'mike@terminco.com.au',
    role: TEAM_MEMBER_ROLE.ADMIN,
    status: TEAM_MEMBER_STATUS.PENDING,
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    user_name: 'Emma Wilson',
    email: 'emma.wilson@terminco.com.au',
    role: TEAM_MEMBER_ROLE.MANAGER,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    user_name: 'David Martinez',
    email: 'david.martinez@terminco.com.au',
    role: TEAM_MEMBER_ROLE.MANAGER,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    user_name: 'Lisa Anderson',
    email: 'lisa.anderson@terminco.com.au',
    role: TEAM_MEMBER_ROLE.USER,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 7,
    user_name: 'James Brown',
    email: 'james.brown@terminco.com.au',
    role: TEAM_MEMBER_ROLE.USER,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    user_name: 'Maria Garcia',
    email: 'maria.garcia@terminco.com.au',
    role: TEAM_MEMBER_ROLE.USER,
    status: TEAM_MEMBER_STATUS.ACTIVE,
    last_login: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    user_name: 'Tom Rodriguez',
    email: 'tom.rodriguez@terminco.com.au',
    role: TEAM_MEMBER_ROLE.MANAGER,
    status: TEAM_MEMBER_STATUS.PENDING,
    last_login: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    user_name: 'Jessica Lee',
    email: 'jessica.lee@terminco.com.au',
    role: TEAM_MEMBER_ROLE.USER,
    status: TEAM_MEMBER_STATUS.INACTIVE,
    last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function TeamAdminTab() {
  // Handle row click to open member details
  const handleRowClick = (member: TeamMember) => {
    // TODO: Implement member details view
    console.log('Selected member:', member);
  };

  const facetDefs: FacetDefinition[] = [
    { column: 'role', title: 'Role', icon: Plus },
    { column: 'status', title: 'Status', icon: Plus },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-[24px] font-bold">Team Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            dialogTitle="Invite User"
            dialogWidth="max-w-md"
            trigger={
              <Button className="bg-[#8E51FF] hover:bg-[#7a42e6] text-white">
                <Plus className="h-4 w-4" /> Invite User
              </Button>
            }
          >
            <InviteUserForm />
          </FormDialog>
        </div>
      </div>

      <div className="border border-[#E4E4E7] rounded-lg bg-white p-6">
        <h3 className="text-[24px] font-semibold mb-4 text-[#09090B]">
          Team Members
        </h3>
        <DataTableClient
          tableId="team_member_data_table"
          data={TeamsMemberMockData}
          columns={teamMemberColumns}
          facetDefination={facetDefs}
          searchPlaceHolder="Search team members..."
          onRowClick={handleRowClick}
        />
      </div>

      <PendingInvitations />
    </div>
  );
}
