import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Client } from '@/lib/types/client';

interface ClientStore {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  user: string;

  // Actions
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (userName: string) => void;

  getClientById: (id: number) => Client | undefined;
  getClientsByStatus: (status: string) => Client[];
  getUser: () => string;
}

export const useClientStore = create<ClientStore>()(
  devtools(
    (set, get) => ({
      clients: [],
      selectedClient: null,
      isLoading: false,
      user: '',

      // Actions
      setClients: (clients) => set({ clients }),

      setUser: (userName) => set({ user: userName }),

      setSelectedClient: (client) => set({ selectedClient: client }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getClientById: (id) => {
        const state = get();
        return state.clients.find((c) => c.id === id);
      },

      getUser: () => {
        const state = get();
        return state.user;
      },

      getClientsByStatus: (status) => {
        const state = get();
        return state.clients.filter((c) => c.clientStatus === status);
      },
    }),
    { name: 'client-store' },
  ),
);

export const useSelectedClient = () =>
  useClientStore((state) => state.selectedClient);

export const useClients = () => useClientStore((state) => state.clients);
