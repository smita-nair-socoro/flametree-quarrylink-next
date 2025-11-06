export const ProductKeys = {
  all: ['products'] as const,
  list: (filters?: { page?: number; perPage?: number; search?: string }) =>
    [...ProductKeys.all, 'list', filters] as const,
  detail: (id: number) => [...ProductKeys.all, 'detail', id] as const,
  detailWithMaterial: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'material'] as const,
  detailWithQuarrySupplierProduct: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'quarry-supplier-product'] as const,
};

export const CustomerKeys = {
  all: ['customers'] as const,
  list: () => [...CustomerKeys.all, 'list'] as const,
  detail: (id: number) => [...CustomerKeys.all, 'detail', id] as const,
};
