'use client';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';
import { useTeamMemberActions } from '@/hooks/use-team-member-actions';

export function useClientUserActions(
  userId: number | undefined,
  userData?: User | null,
  roles?: readonly FormSelectOption[],
  currentUserId?: number | string
) {
  // Reuse the team member actions hook
  return useTeamMemberActions(userId, userData, roles, currentUserId);
}
