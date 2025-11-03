import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TeamMember } from '@/lib/types/user';

interface TeamMemberStore {
  teamMembers: TeamMember[];
  selectedTeamMember: TeamMember | null;
  isLoading: boolean;

  // Actions
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  setSelectedTeamMember: (teamMember: TeamMember | null) => void;
  setLoading: (loading: boolean) => void;

  getTeamMemberById: (id: number) => TeamMember | undefined;
}

export const useTeamMemberStore = create<TeamMemberStore>()(
  devtools(
    (set, get) => ({
      teamMembers: [],
      selectedTeamMember: null,
      isLoading: false,

      // Actions
      setTeamMembers: (teamMembers) => set({ teamMembers }),

      setSelectedTeamMember: (teamMember) => set({ selectedTeamMember: teamMember }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getTeamMemberById: (id) => {
        const state = get();
        return state.teamMembers.find((t) => t.id === id);
      },
    }),
    { name: 'team-member-store' }
  )
);

export const useSelectedTeamMember = () =>
  useTeamMemberStore((state) => state.selectedTeamMember);

export const useTeamMembers = () => useTeamMemberStore((state) => state.teamMembers);

export const useTeamMemberLoading = () =>
  useTeamMemberStore((state) => state.isLoading);
