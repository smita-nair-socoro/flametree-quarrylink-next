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
  version: number;
}
