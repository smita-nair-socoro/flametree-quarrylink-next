import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProductDetails } from '@/lib/types/product';
import { PRODUCT_STATUS } from '@/lib/types/product-enums';

interface ProductStore {
  products: ProductDetails[];
  selectedProduct: ProductDetails | null;
  isLoading: boolean;

  // Actions
  setProducts: (products: ProductDetails[]) => void;
  setSelectedProduct: (product: ProductDetails | null) => void;
  setLoading: (loading: boolean) => void;

  getProductById: (id: number) => ProductDetails | undefined;
  getProductsByStatus: (status: boolean) => ProductDetails[];

  getProductStats: () => {
    total: number;
    available: number;
    unavailable: number;
    archived: number;
  };
}

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      products: [],
      selectedProduct: null,
      isLoading: false,

      // Actions
      setProducts: (products) => set({ products }),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getProductById: (id) => {
        const state = get();
        return state.products.find((p) => p.id === id);
      },

      getProductsByStatus: (status: PRODUCT_STATUS) => {
        const state = get();
        return state.products.filter((p) => p.status === status);
      },

      getProductStats: () => {
        const state = get();
        const products = state.products;

        return {
          total: products.length,
          available: products.filter(
            (p) => p.status === PRODUCT_STATUS.AVAILABLE
          ).length,
          unavailable: products.filter(
            (p) => p.status === PRODUCT_STATUS.UNAVAILABLE
          ).length,
          archived: products.filter((p) => p.status === PRODUCT_STATUS.ARCHIVED)
            .length,
        };
      },
    }),
    { name: 'product-store' }
  )
);

export const useSelectedProduct = () =>
  useProductStore((state) => state.selectedProduct);

export const useProducts = () => useProductStore((state) => state.products);

export const useProductLoading = () =>
  useProductStore((state) => state.isLoading);

export const useProductById = (id: number) => {
  return useProductStore((state) => state.products.find((p) => p.id === id));
};

export const useProductsByStatus = (status: PRODUCT_STATUS) => {
  return useProductStore((state) =>
    state.products.filter((p) => p.status === status)
  );
};

// Get customer stats
export const useProductStats = () => {
  return useProductStore((state) => {
    const products = state.products;
    return {
      total: products.length,
      unavailable: products.filter(
        (p) => p.status === PRODUCT_STATUS.UNAVAILABLE
      ).length,
      available: products.filter((p) => p.status === PRODUCT_STATUS.AVAILABLE)
        .length,
      archived: products.filter((p) => p.status === PRODUCT_STATUS.ARCHIVED)
        .length,
    };
  });
};

import { useMemo } from 'react';

export const useProductByIdOptimized = (id: number) => {
  const products = useProducts();

  return useMemo(() => {
    return products.find((p) => p.id === id);
  }, [products, id]);
};

export const useProductsByStatusOptimized = (status: PRODUCT_STATUS) => {
  const products = useProducts();

  return useMemo(() => {
    return products.filter((p) => p.status === status);
  }, [products, status]);
};
