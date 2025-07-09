import { ProductQueryParams, ProductsQueryParams } from '../types/product';

export const UserKeys = {
  all: ['users'] as const,
  lists: () => [...UserKeys.all, 'list'] as const,
  details: (hostUrl: string) => [...UserKeys.all, 'detail', hostUrl] as const,
  detail: (id: number) => [...UserKeys.all, 'detail', id] as const,
};

export const ProductKeys = {
  all: ['products'] as const,
  lists: () => [...ProductKeys.all, 'list'] as const,
  list: (params: ProductQueryParams) =>
    [...ProductKeys.lists(), params] as const,
  //TODO: This can be moved to list later, and deleted after initial version just for testing purposes
  list_v2: (params: ProductsQueryParams) =>
    [...ProductKeys.lists(), params] as const,

  details: () => [...ProductKeys.all, 'detail'] as const,
  detail: (id: number) => [...ProductKeys.details(), id] as const,
};
