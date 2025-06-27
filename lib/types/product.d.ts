export interface Product {
  id: number;
  organisation_id: number;
  name: string;
  product_code?: string;
  unit: string;
  description: string;
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

// Microservice Ranil Version..

export interface Products {
  id: number;
  qlClientId: number;
  quarryId: number;
  productName: string;
  productCode: string;
  productDetails: string;
}

export interface ProductsQueryParams {
  quarryId: number;
}

export interface ProductMgmtResponse {
  /** Whether the operation succeeded */
  exeStatus: boolean;
  /** Any error messages returned by the operation */
  exeErrorMsg: string[];
  /** Numeric status or error code */
  exeCode: number;
  /** List of products */
  products: Products[];
  /** Single product object (often the “current” or newly created/updated one) */
  productVo: Products;
}
