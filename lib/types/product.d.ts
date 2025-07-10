import { Category } from './category';
import { QuarriesWithPrice } from './quarry';

export interface Product {
  id: number;
  organisation_id: number;
  name: string;
  product_code?: string;
  unit: string;
  description: string | null;
  cost_price: number;
  sell_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategoriesAndQuarry {
  product: Product;
  categories: Category[];
  quarries: QuarriesWithPrice[];
}

export interface AllProductWithCategoriesAndQuarryResponse {
  items: ProductWithCategoriesAndQuarry[];
}

export interface PaginatedProductsResponse {
  items: ProductWithCategoriesAndQuarry[];
  total_pages: number;
  category_counts: Record<string, number>;
  quarry_counts: Record<string, number>;
}

export interface ProductQueryParams {
  page: number; // 1-based
  per_page: number;
  search?: string;
  sort_by?: string; // "name", "id", "status", etc.
  sort_desc?: boolean;

  categories?: string[]; // e.g. ["Fruit","Hardware"]
  quarries?: string[]; // e.g. ["Main Quarry","Secondary"]
}
