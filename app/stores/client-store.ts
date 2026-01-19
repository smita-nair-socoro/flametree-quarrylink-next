import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Client } from '@/lib/types/client';

interface ClientStore {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;

  // Actions
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setLoading: (loading: boolean) => void;

  getClientById: (id: number) => Client | undefined;
  getClientsByStatus: (status: string) => Client[];
}

export const useClientStore = create<ClientStore>()(
  devtools(
    (set, get) => ({
      clients: [],
      selectedClient: null,
      isLoading: false,

      // Actions
      setClients: (clients) => set({ clients }),

      setSelectedClient: (client) => set({ selectedClient: client }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getClientById: (id) => {
        const state = get();
        return state.clients.find((c) => c.id === id);
      },

      getClientsByStatus: (status) => {
        const state = get();
        return state.clients.filter((c) => c.clientStatus === status);
      },
    }),
    { name: 'client-store' }
  )
);

export const useSelectedClient = () =>
  useClientStore((state) => state.selectedClient);

export const useClients = () => useClientStore((state) => state.clients);
