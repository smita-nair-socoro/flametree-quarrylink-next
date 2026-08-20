import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/lib/types/user';
import { isUserSuperAdmin, resolveBackendRole } from '@/lib/utils/user-helper';

interface UserStore {
  user: User | null;
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
      user: null,
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
        return state.user?.id === id ? state.user : undefined;
      },

      getUserName: () => {
        const state = get();
        return state.userName;
      },
      isSuperAdmin: () => {
        const { user, userGroups } = get();
        return isUserSuperAdmin({ role: user?.role, groups: userGroups });
      },

      isAdmin: () => {
        const { user, userGroups } = get();
        const backend = resolveBackendRole(user?.role, userGroups);
        return backend === 'ADMIN' || backend === 'SUPER_ADMIN';
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
    isUserSuperAdmin({ role: state.user?.role, groups: state.userGroups }),
  );

export const useIsAdmin = () =>
  useUserStore((state) => {
    const backend = resolveBackendRole(state.user?.role, state.userGroups);
    return backend === 'ADMIN' || backend === 'SUPER_ADMIN';
  });
