'use client';
import * as React from 'react';
import { MoreHorizontal, UserX, Eye, Key, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/lib/types/user';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { useTeamMemberStore } from '@/app/stores/team-member-store';

interface TeamMemberTableActionsProps {
  teamMember: TeamMember;
}

export function TeamMemberTableActions({
  teamMember,
}: TeamMemberTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, deleteDialog, viewDialog } = useTeamMemberActions(
    teamMember.id,
    teamMember
  );
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember
  );

  const createHandler =
    (actionFn: () => void, additionalSetup?: () => void) => () => {
      additionalSetup?.();
      setDropdownOpen(false);
      actionFn();
    };

  const handleDeactivate = createHandler(actions.deactivate);
  const handleViewEdit = createHandler(actions.viewEdit, () =>
    setSelectedTeamMember(teamMember)
  );
  const handleResetPassword = createHandler(actions.resetPassword);
  const handleDelete = createHandler(actions.delete);

  return (
    <div>
      {deleteDialog}
      {viewDialog}
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDeactivate}>
            <UserX className="h-4 w-4 mr-2" />
            Deactivate
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewEdit}>
            <Eye className="h-4 w-4 mr-2" />
            View/Edit User
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleResetPassword}>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
