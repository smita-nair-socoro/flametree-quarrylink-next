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

export interface Quarry {
  id: number;
  organisation_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface QuarriesWithPrice {
  quarry: Quarry;
  price: QuarryProductPrice;
}

export interface Quarries {
  id: number;
  clientId: number;
  quarryRef: string;
  quarryName: string;
  quarryDescription: string;
  enabled: boolean;
}
