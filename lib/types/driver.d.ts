import { DRIVER_STATUS, DRIVER_TYPE } from './driver-enums';
import { HaulierDTO } from './haulier';

interface DriverTruckAssignment {
  id: number;
  licensePlate: string;
  truckType?: string;
  truckStatus: string;
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
  emailAddress: string;
  phoneNumber: string;
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

export interface DriverDTO {
  id?: number;
  driverName: string;
  driverType: DRIVER_TYPE;
  emailAddress: string;
  phoneNumber: string;
  licenseNumber: string;
  haulierId?: number;
  haulier?: HaulierDTO;
  truckIds?: number[];
  trucks?: DriverTruckAssignment[];
  dockets?: DocketDTO[];
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

export interface DriverStatistics {
  totalDrivers: number;
  internalDrivers: number;
  externalDrivers: number;
  driversAvailableForDispatch: number;
  driversOnDuty: number;
  driversAssignedToTrucks: number;
  driversWithoutTrucks: number;
  failedPrestarts: number;
  failedPrestartsLast7Days: number;
}
