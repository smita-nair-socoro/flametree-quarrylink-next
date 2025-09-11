import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Customer } from '@/lib/types/customer';

interface CustomerStore {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setLoading: (loading: boolean) => void;

  getCustomerById: (id: number) => Customer | undefined;
  getCustomersByStatus: (status: string) => Customer[];

  getCustomerStats: () => {
    total: number;
    active: number;
    archived: number;
  };
}

export const useCustomerStore = create<CustomerStore>()(
  devtools(
    (set, get) => ({
      customers: [],
      selectedCustomer: null,
      isLoading: false,

      // Actions
      setCustomers: (customers) => set({ customers }),

      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getCustomerById: (id) => {
        const state = get();
        return state.customers.find((c) => c.id === id);
      },

      getCustomersByStatus: (status) => {
        const state = get();
        return state.customers.filter((c) => c.customer_status === status);
      },

      getCustomerStats: () => {
        const state = get();
        const customers = state.customers;

        return {
          total: customers.length,
          active: customers.filter((c) => c.customer_status === 'ACTIVE')
            .length,
          archived: customers.filter((c) => c.customer_status === 'ARCHIVED')
            .length,
        };
      },
    }),
    { name: 'customer-store' }
  )
);

export const useSelectedCustomer = () =>
  useCustomerStore((state) => state.selectedCustomer);

export const useCustomers = () => useCustomerStore((state) => state.customers);

export const useCustomerLoading = () =>
  useCustomerStore((state) => state.isLoading);

export const useCustomerById = (id: number) => {
  return useCustomerStore((state) => state.customers.find((c) => c.id === id));
};

export const useCustomersByStatus = (status: string) => {
  return useCustomerStore((state) =>
    state.customers.filter((c) => c.customer_status === status)
  );
};

// Get customer stats
export const useCustomerStats = () => {
  return useCustomerStore((state) => {
    const customers = state.customers;
    return {
      total: customers.length,
      active: customers.filter((c) => c.customer_status === 'ACTIVE').length,
      archived: customers.filter((c) => c.customer_status === 'ARCHIVED')
        .length,
    };
  });
};

import { useMemo } from 'react';

export const useCustomerByIdOptimized = (id: number) => {
  const customers = useCustomers();

  return useMemo(() => {
    return customers.find((c) => c.id === id);
  }, [customers, id]);
};

export const useCustomersByStatusOptimized = (status: string) => {
  const customers = useCustomers();

  return useMemo(() => {
    return customers.filter((c) => c.customer_status === status);
  }, [customers, status]);
};
