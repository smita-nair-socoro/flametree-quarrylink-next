'use client';
import * as React from 'react';
import { MoreHorizontal, UserX, Eye, Key, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/lib/types/team-member';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';

interface TeamMemberTableActionsProps {
  teamMember: TeamMember;
}

export function TeamMemberTableActions({
  teamMember,
}: TeamMemberTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { actions, deleteDialog, deleteFormDialog } = useTeamMemberActions(
    teamMember.id,
    teamMember
  );

  const handleDeactivate = () => {
    setDropdownOpen(false);
    actions.deactivate();
  };

  const handleViewEdit = () => {
    setDropdownOpen(false);
    actions.viewEdit();
  };

  const handleResetPassword = () => {
    setDropdownOpen(false);
    actions.resetPassword();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    // For now, using the complex delete with dependencies
    // In production, you would check if user has dependencies first
    actions.deleteWithDependencies();
  };

  return (
    <div>
      {deleteDialog}
      {deleteFormDialog}
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

          <DropdownMenuSeparator />

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
