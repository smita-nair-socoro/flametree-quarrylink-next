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

export const QuarryKeys = {
  all: ['quarries'] as const,
  list: () => [...QuarryKeys.all, 'list'] as const,
  detail: (id: number) => [...QuarryKeys.all, 'detail', id] as const,
  suburbs: () => [...QuarryKeys.all, 'suburbs'] as const,
  linkedProducts: (quarryId: number) =>
    [...QuarryKeys.all, 'linked-products', quarryId] as const,
};

export const CategoryKeys = {
  all: ['categories'] as const,
  list: () => [...CategoryKeys.all, 'list'] as const,
  detail: (id: number) => [...CategoryKeys.all, 'detail', id] as const,
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

export const QuotationKeys = {
  all: ['quotations'] as const,
  list: () => [...QuotationKeys.all, 'list'] as const,
  detail: (id: number) => [...QuotationKeys.all, 'detail', id] as const,
};

export const TenantKeys = {
  all: ['tenants'] as const,
  list: () => [...TenantKeys.all, 'list'] as const,
  detail: (id: string) => [...TenantKeys.all, 'detail', id] as const,
};
export const MaterialsKeys = {
  all: ['materials'] as const,
  list: () => [...MaterialsKeys.all, 'list'] as const,
  detail: (id: number) => [...MaterialsKeys.all, 'detail', id] as const,
};

export const QuarrySupplierProductKeys = {
  all: ['quarry-supplier-products'] as const,
  detail: (quarrySupplierId: number, productId: number) =>
    [
      ...QuarrySupplierProductKeys.all,
      'detail',
      quarrySupplierId,
      productId,
    ] as const,
};

export const UserKeys = {
  all: ['users'] as const,
  list: () => [...UserKeys.all, 'list'] as const,
  detail: (id: string) => [...UserKeys.all, 'detail', id] as const,
  dependencies: (id: string) => [...UserKeys.all, 'dependencies', id] as const,
};
