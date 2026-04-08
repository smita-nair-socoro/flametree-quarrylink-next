import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/lib/types/user';

interface UserStore {
  user: User;
  userName: string;
  selectedUser: User | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setUserName: (userName: string) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  getUserById: (id: number) => User | undefined;
  getUserName: () => string;
}

export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      user: {},
      userName: '',
      selectedUser: null,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user }),

      setUserName: (userName) => set({ userName }),

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
    }),
    { name: 'user-store' },
  ),
);

export const useSelectedUser = () =>
  useUserStore((state) => state.selectedUser);

export const useUsers = () => useUserStore((state) => state.user);

export const useUserLoading = () => useUserStore((state) => state.isLoading);
