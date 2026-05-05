export interface XeroConnectRequestDTO {
  tenantId: string;
  userEmail: string;
}

export interface XeroStatusResponseDTO {
  tenantId: string;
  connected: boolean;
}

export interface XeroConnectResponseDTO {
  authorizeUrl: string;
}
