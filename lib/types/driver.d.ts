import { DRIVER_STATUS, DRIVER_TYPE } from './driver-enums';

interface DriverTruckAssignment {
  id: number;
  registration: string;
  status: string;
}

interface DriverComplianceRecord {
  id: number;
  checklistId: string;
  date: string;
  status: string;
  notes?: string;
}

export interface PatchDriverInfoDTO {
  version: number;
  driverName: string;
  phoneNumber: string;
  licenseNumber: string;
  emailAddress: string;
}

export interface PatchDriverTypeDTO {
  driverType: DRIVER_TYPE;
  haulierId?: number;
  truckIds?: number[];
}

export interface PatchDriverTrucksDTO {
  version: number;
  truckIds: number[];
}

export interface PatchDriverHaulierDTO {
  haulierId: number;
}

export interface PutDriverDTO {
  version: number;
  driverName: string;
  licenseNumber: string;
  driverType: DRIVER_TYPE;
  driverStatus: DRIVER_STATUS;
  truckIds: number[];
  haulierId?: number;
}

export interface DriverHaulierDetail {
  id: number;
  haulierName: string;
  emailAddress: string;
  phoneNumber: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy: string;
  version: number;
  deleted: boolean;
}

export interface DriverDetailDTO {
  id: number;
  driverName: string;
  driverType: DRIVER_TYPE;
  emailAddress: string;
  phoneNumber: string;
  licenseNumber: string;
  driverStatus: DRIVER_STATUS;
  appInvitationSent: boolean;
  appInvitationSentAt: string | null;
  appActivated: boolean;
  appActivatedAt: string | null;
  updatedAt: string;
  lastModifiedBy: string;
  deviceToken: string | null;
  lastChecklistCompleted: string | null;
  truckIds: number[];
  haulier: DriverHaulierDetail | null;
  createdBy?: string;
  createdAt?: string;
  version: number;
}

interface DriverDTO {
  id?: number;
  driverName: string;
  driverType: DRIVER_TYPE;
  emailAddress: string;
  phoneNumber: string;
  licenseNumber: string;
  haulierId?: number;
  haulierName?: string;
  haulierEmailAddress?: string;
  haulierPhoneNumber?: string;
  truckIds?: number[];
  trucks?: DriverTruckAssignment[];
  complianceRecords?: DriverComplianceRecord[];
  driverStatus?: DRIVER_STATUS;
  appInvitationSent?: boolean;
  appInvitationSentAt?: string | null;
  appActivated?: boolean;
  appActivatedAt?: string | null;
  deviceToken?: string | null;
  lastChecklistCompleted?: string | null;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  updatedAt?: string;
}
