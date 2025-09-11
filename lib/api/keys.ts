export const UserKeys = {
  all: ['users'] as const,
  lists: () => [...UserKeys.all, 'list'] as const,
  details: (hostUrl: string) => [...UserKeys.all, 'detail', hostUrl] as const,
  detail: (id: number) => [...UserKeys.all, 'detail', id] as const,
};

export const ProductKeys = {
  all: ['products'] as const,
  list: (filters?: { page?: number; perPage?: number; search?: string }) =>
    [...ProductKeys.all, 'list', filters] as const,
  detail: (id: number) => [...ProductKeys.all, 'detail', id] as const,
};

export const QuarryKeys = {
  all: ['quarries'] as const,
  list: () => [...QuarryKeys.all, 'list'] as const,
  detail: (id: number) => [...QuarryKeys.all, 'detail', id] as const,
};

export const CategoryKeys = {
  all: ['categories'] as const,
  list: () => [...CategoryKeys.all, 'list'] as const,
  detail: (id: number) => [...CategoryKeys.all, 'detail', id] as const,
};

export const CustomerKeys = {
  all: ['customers'] as const,
  list: () => [...CustomerKeys.all, 'list'] as const,
  detail: (id: number) => [...CustomerKeys.all, 'detail', id] as const,
};
