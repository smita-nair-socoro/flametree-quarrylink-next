'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types/user';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { useTeamMemberStore } from '@/app/stores/team-member-store';
import { useUserStore } from '@/app/stores/user-store';
import { FormSelectOption } from '@/components/ui/form-select';

function isUserSuperAdmin(groups: string[] | undefined): boolean {
  if (!groups?.length) return false;
  const g = groups.join(',').toLowerCase();
  return g.includes('super_admin') || g.includes('superadmin');
}

interface TeamMemberTableActionsProps {
  teamMember: User;
  roles?: readonly FormSelectOption[];
  currentUserId?: number | string;
}

export function TeamMemberTableActions({
  teamMember,
  roles,
  currentUserId,
}: TeamMemberTableActionsProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isSuperAdmin = useUserStore((state) => state.isSuperAdmin());
  const currentUserSub = useUserStore((state) => state.user?.sub);

  const isTargetSuperAdmin = isUserSuperAdmin(teamMember.groups);
  const isTargetSelf =
    !!currentUserSub && String(teamMember.sub) === String(currentUserSub);

  // Admins cannot edit or delete a Super Admin; no one can delete themselves
  const canEdit = isSuperAdmin || !isTargetSuperAdmin;
  const canDelete = !isTargetSelf && (isSuperAdmin || !isTargetSuperAdmin);

  const { actions, deleteDialog, viewDialog } = useTeamMemberActions(
    teamMember.sub,
    teamMember,
    roles,
    currentUserId
  );
  const setSelectedTeamMember = useTeamMemberStore(
    (state) => state.setSelectedTeamMember
  );

  const handleViewEdit = () => {
    setDropdownOpen(false);
    setSelectedTeamMember(teamMember);
    actions.viewEdit();
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    actions.delete();
  };

  // Hide the ellipsis entirely when no actions are available
  if (!canEdit && !canDelete) return null;

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
          {canEdit && (
            <DropdownMenuItem onClick={handleViewEdit}>
              <Eye className="h-4 w-4 mr-2" />
              View/Edit User
            </DropdownMenuItem>
          )}
          {canEdit && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
              Delete User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
