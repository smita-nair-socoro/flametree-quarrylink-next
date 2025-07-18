export interface QuarryProductPrice {
  id: number;
  organisation_id: number;
  quarries_id: number;
  product_id: number;
  cost_price: number;
  sell_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface NewQuarryProductPriceRequest {
  organisation_id: number;
  quarries_id: number;
  product_id: number;
  cost_price: number;
  sell_price: number;
  status: string;
}

export interface QuarryProductPricePatch {
  cost_price?: number;
  sell_price?: number;
  status?: string;
}

export interface Quarry {
  id: number;
  organisation_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QuarriesWithPrice {
  /// The primary key from the `quarry_products` table
  quarry_product_id: number;
  quarry: Quarry;
  price: QuarryProductPrice;
}
