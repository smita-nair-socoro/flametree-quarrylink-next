'use client';
import * as React from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types/user';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { useTeamMemberStore } from '@/app/stores/team-member-store';
import { FormSelectOption } from '@/components/ui/form-select';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useIsSuperAdmin } from '@/app/stores/user-store';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const isSuperAdmin = useIsSuperAdmin();
  const { actions, deleteDialog, viewDialog } = useTeamMemberActions(
    teamMember.sub,
    teamMember,
    roles,
    currentUserId
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

  const handleViewEdit = createHandler(() => {
    // Set the selected member in the store FIRST, then open dialog
    setSelectedTeamMember(teamMember);
    actions.viewEdit();
  });
  // const handleResetPassword = createHandler(actions.resetPassword);
  const handleDelete = createHandler(actions.delete);

  return (
    <div>
      {deleteDialog}
      {viewDialog}
      {isDesktop ? (
        <div className="inline-flex overflow-hidden rounded-md border bg-white text-[14px] font-medium text-[#09090B]">
          <Button
            variant="outline"
            className="rounded-none px-4 h-auto py-2 gap-2 bg-white border-0 border-r"
            onClick={handleViewEdit}
          >
            <Eye className="h-4 w-4" />
            View/Edit User
          </Button>
          {isSuperAdmin && (
            <Button
              variant="outline"
              className="rounded-none px-4 h-auto py-2 gap-2 bg-[#FEF2F2] text-red-600 hover:text-red-600 border-0"
              onClick={handleDelete}
            >
              Delete User
            </Button>
          )}
        </div>
      ) : (
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

            {isSuperAdmin && (
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
      )}
    </div>
  );
}
