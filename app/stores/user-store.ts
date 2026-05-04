import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/lib/types/user';

interface UserStore {
  user: User;
  userName: string;
  userGroups: string[];
  selectedUser: User | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setUserName: (userName: string) => void;
  setUserGroups: (groups: string[]) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  getUserById: (id: number) => User | undefined;
  getUserName: () => string;
  isSuperAdmin: () => boolean;
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      user: {},
      userName: '',
      userGroups: [],
      selectedUser: null,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user }),

      setUserName: (userName) => set({ userName }),

      setUserGroups: (groups) => set({ userGroups: groups }),

      setSelectedUser: (user) => set({ selectedUser: user }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getUserById: (id) => {
        const state = get();
        return state.user.id === id;
      },

      getUserName: () => {
        const state = get();
        return state.userName;
      },
      isSuperAdmin: () => {
        const { userGroups } = get();
        return userGroups.some(
          (g) =>
            g.toLowerCase() === 'super_admin' ||
            g.toLowerCase() === 'superadmin',
        );
      },
    }),
    { name: 'user-store' },
  ),
);

export const useSelectedUser = () =>
  useUserStore((state) => state.selectedUser);

export const useUsers = () => useUserStore((state) => state.user);

export const useUserLoading = () => useUserStore((state) => state.isLoading);

export const useIsSuperAdmin = () =>
  useUserStore((state) =>
    state.userGroups.some(
      (g) =>
        g.toLowerCase() === 'super_admin' || g.toLowerCase() === 'superadmin',
    ),
  );
