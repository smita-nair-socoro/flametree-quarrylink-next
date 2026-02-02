'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcwSquare } from 'lucide-react';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';
import { User } from '@/lib/types/user';
import { UserStatus } from '@/lib/types/user-enums';
import { FormSelectOption } from '@/components/ui/form-select';

interface TeamMemberActionButtonsProps {
  teamMember: User | null | undefined;
  roles?: readonly FormSelectOption[];
  currentUserId?: number | string;
}

export function TeamMemberActionButtons({
  teamMember,
  roles,
  currentUserId,
}: TeamMemberActionButtonsProps) {
  const { actions, deleteDialog } = useTeamMemberActions(
    teamMember?.sub,
    teamMember,
    roles,
    currentUserId
  );

  // Early return for null team member
  if (!teamMember) {
    return null;
  }

  return (
    <div>
      {deleteDialog}

      <div className="inline-flex overflow-hidden rounded-md border bg-white text-[14px] font-medium text-[#09090B] mr-5">
        {teamMember?.status === UserStatus.PENDING ? (
          <Button
            variant="outline"
            className="rounded-none px-4 h-auto py-1.5 gap-2 bg-white border-0 border-r"
            onClick={actions.resendInvitation}
          >
            <RotateCcwSquare className="h-4 w-4" />
            Resend Invitation
          </Button>
        ) : (
          null
        )}

        <Button
          variant="outline"
          className="rounded-none px-4 h-auto py-1.5 gap-2 bg-[#FEF2F2] text-red-600 hover:text-red-600 border-0"
          onClick={actions.delete}
        >
          <Trash2 className="h-4 w-4" />
          Delete User
        </Button>
      </div>
    </div>
  );
}
