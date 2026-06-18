export interface MyobConnectRequestDTO {
  tenantId: string;
  userEmail: string;
}

export interface MyobStatusResponseDTO {
  tenantId: string;
  connected: boolean;
}

export interface MyobConnectResponseDTO {
  authorizeUrl: string;
}
