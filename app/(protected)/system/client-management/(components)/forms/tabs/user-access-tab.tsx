import { TeamMember } from '@/lib/types/user';
import { userColumns } from '../../(data-tables)/users/columns';
import { DataTableClient } from '@/components/ui/data-table-client';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '@/app/(protected)/system/user-management/(components)/forms/invite-user-form';

interface UserAccessTabProps {
  convertedClientWithUsers: TeamMember[];
}

export default function UserAccessTab({
  convertedClientWithUsers,
}: UserAccessTabProps) {
  const teamMemberCount = convertedClientWithUsers.length;

  return (
    <div>
      <div className="flex flex-col space-y-5">
        <div className="flex justify-between items-center mt-5">
          <h1 className="text-lg font-semibold">Users ({teamMemberCount}/20)</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <FormDialog
              dialogTitle="Invite User"
              dialogDescription="Send an invitation to a new team member with their assigned role and contact information."
              dialogWidth="max-w-md"
              buttonTitle="Add New User"
            >
              <InviteUserForm teamMemberCount={teamMemberCount} />
            </FormDialog>
          </div>
        </div>
        <DataTableClient
          columns={userColumns}
          data={convertedClientWithUsers}
          simpleTable={true}
        />
      </div>
    </div>
  );
}
