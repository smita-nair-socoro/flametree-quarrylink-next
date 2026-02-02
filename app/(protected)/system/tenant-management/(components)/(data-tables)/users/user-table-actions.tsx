'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types/user';
import { useClientUserActions } from '@/hooks/use-client-user-actions';
import { FormSelectOption } from '@/components/ui/form-select';
import { useTeamMemberStore } from '@/app/stores/team-member-store';

interface UserTableActionsProps {
  user: User;
  roles?: readonly FormSelectOption[];
  currentUserId?: number | string;
}

export function UserTableActions({
  user,
  roles = [],
  currentUserId
}: UserTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Get the Zustand store setter to update selected user
  const setSelectedTeamMember = useTeamMemberStore(state => state.setSelectedTeamMember);

  const { actions, deleteDialog, viewDialog } = useClientUserActions(
    user?.sub,
    user,
    roles,
    currentUserId
  );

  const handleViewEdit = () => {
    setDropdownOpen(false);
    // Update Zustand store with the user data BEFORE opening dialog
    setSelectedTeamMember(user);
    actions.viewEdit();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    actions.delete();
  };

  return (
    <>
      {viewDialog}
      {deleteDialog}
      <div>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleViewEdit}>
              <Eye className="h-4 w-4 mr-2" />
              View/Edit User
            </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Delete className="h-4 w-4 mr-2 text-red-600" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    </>
  );
}
