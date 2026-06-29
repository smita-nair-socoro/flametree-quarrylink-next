export interface HaulierCreateDTO {
  haulierName: string;
  haulierEmailAddress: string;
  haulierPhoneNumber: string;
}

export interface HaulierDTO {
  id: number;
  haulierName: string;
  emailAddress: string;
  phoneNumber: string;
  haulierType?: string;
  version: number;
}

export interface HauliersPage {
  content: HaulierDTO[];
  totalElements: number;
  totalPages: number;
  empty?: boolean;
  first?: boolean;
  last?: boolean;
  number?: number;
  numberOfElements?: number;
  size?: number;
}
