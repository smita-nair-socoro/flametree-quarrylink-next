import * as React from 'react';
import { User } from '@/lib/types/user';
import { createUserColumns } from '../../(data-tables)/users/columns';
import { DataTableClient } from '@/components/ui/data-table-client';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '@/app/(protected)/system/user-management/(components)/forms/invite-user-form';
import { FormSelectOption } from '@/components/ui/form-select';
import { Role } from '@/lib/types/user-enums';
import { useClientUserActions } from '@/hooks/use-client-user-actions';
import { useTeamMemberStore } from '@/app/stores/team-member-store';

// Roles options for the form
const rolesOptions: readonly FormSelectOption[] = [
  { label: 'Admin', value: Role.ADMIN },
  { label: 'User', value: Role.USER },
  { label: 'Super Admin', value: Role.SUPERADMIN },
];

interface UserAccessTabProps {
  convertedClientWithUsers: User[];
}

export default function UserAccessTab({
  convertedClientWithUsers,
}: UserAccessTabProps) {
  const teamMemberCount = convertedClientWithUsers.length;

  // Use Zustand store for selected team member
  const setSelectedTeamMember = useTeamMemberStore(state => state.setSelectedTeamMember);

  // Separate state for the actions hook
  const [selectedUserForActions, setSelectedUserForActions] = React.useState<User | null>(null);

  // Ref to track if we should open the dialog after state update
  const shouldOpenDialogRef = React.useRef(false);

  const { actions, viewDialog } = useClientUserActions(
    selectedUserForActions?.id,
    selectedUserForActions,
    rolesOptions,
    undefined // TODO: Pass actual currentUserId when available
  );

  // Handle row click to open user details
  const handleRowClick = (user: User) => {
    setSelectedTeamMember(user);
    setSelectedUserForActions(user);
    shouldOpenDialogRef.current = true;
  };

  // Open dialog after state has been updated
  React.useEffect(() => {
    if (shouldOpenDialogRef.current && selectedUserForActions) {
      actions.viewEdit();
      shouldOpenDialogRef.current = false;
    }
  }, [selectedUserForActions, actions]);

  // Create columns with roles and currentUserId
  const columns = React.useMemo(
    () => createUserColumns(rolesOptions, undefined), // TODO: Pass actual currentUserId when available
    []
  );

  return (
    <>
      {viewDialog}
      <div>
        <div className="flex flex-col space-y-5">
          <div className="flex justify-between items-center mt-5">
            <h1 className="text-lg font-semibold">Users ({teamMemberCount}/20)</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <FormDialog
                  dialogTitle="Invite User"
                  dialogWidth="max-w-md"
                  buttonTitle="Invite User"
                  headerClassName='pb-2 h-[32px] pt-10'
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
          <DataTableClient
            columns={columns}
            data={convertedClientWithUsers}
            simpleTable={false}
            onRowClick={handleRowClick}
            allowClicksInsideModal={true}
          />
        </div>
      </div>
    </>
  );
}
