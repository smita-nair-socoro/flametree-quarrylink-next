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
import { TeamMember, User } from '@/lib/types/user';
import { useClientUserActions } from '@/hooks/use-client-user-actions';
import { FormSelectOption } from '@/components/ui/form-select';

interface UserTableActionsProps {
  user: TeamMember;
  roles?: readonly FormSelectOption[];
  currentUserId?: number | string;
}

export function UserTableActions({
  user,
  roles = [],
  currentUserId
}: UserTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  // Convert TeamMember to User format for the hook
  const userData: User | null = React.useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      tenant_id: user.tenant_id,
      client_id: 0, // This should be passed from parent or fetched
      status: user.status,
      full_name: user.user_name,
      phone: '',
      email: user.email,
      role: user.role,
      total_logins: 0,
      quotation_created: 0,
      jobs_managed: 0,
      invited_by: 0,
      deletion_reason: '',
      isDeleted: false,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at,
    };
  }, [user]);

  const { actions, deleteDialog, viewDialog } = useClientUserActions(
    user?.id,
    userData,
    roles,
    currentUserId
  );

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
    actions.delete();
  };

  return (
    <>
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
      {deleteDialog}
      {viewDialog}
    </>
  );
}
