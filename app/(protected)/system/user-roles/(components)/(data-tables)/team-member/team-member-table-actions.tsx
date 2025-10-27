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
import { DeleteTeamMemberModal } from './delete-team-member-modal';

interface TeamMemberTableActionsProps {
  teamMember: TeamMember;
}

export function TeamMemberTableActions({ teamMember }: TeamMemberTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const handleDeactivate = () => {
    setDropdownOpen(false);
    // TODO: Implement deactivate functionality
    console.log('Deactivate user:', teamMember);
  };

  const handleViewEdit = () => {
    setDropdownOpen(false);
    // TODO: Implement view/edit functionality
    console.log('View/Edit user:', teamMember);
  };

  const handleResetPassword = () => {
    setDropdownOpen(false);
    // TODO: Implement reset password functionality
    console.log('Reset password for user:', teamMember);
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    setDeleteModalOpen(true);
  };

  return (
    <div>
      <DeleteTeamMemberModal
        teamMember={teamMember}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
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
