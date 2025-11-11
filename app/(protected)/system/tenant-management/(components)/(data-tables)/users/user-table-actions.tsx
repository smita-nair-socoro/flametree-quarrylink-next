'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Key, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { TeamMember } from '@/lib/types/user';

interface UserTableActionsProps {
  user: TeamMember;
}

export function UserTableActions({ user }: UserTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleViewEdit = () => {
    setDropdownOpen(false);
    // TODO: Implement view/edit user functionality
    console.log('View/Edit user:', user);
  };

  const handleResetPassword = () => {
    setDropdownOpen(false);
    // TODO: Implement reset password functionality
    console.log('Reset password for user:', user);
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    // TODO: Implement delete user functionality
    console.log('Delete user:', user);
  };

  return (
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

          <DropdownMenuItem onClick={handleResetPassword}>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
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
  );
}
