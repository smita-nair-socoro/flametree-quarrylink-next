import { DocketDTO } from './docket';

export interface SchedulerDriver {
  id: number;
  driverName: string;
  driverType: string;
  emailAddress: string;
  phoneNumber: string;
  licenseNumber: string;
  driverStatus: string;
  appInvitationSent: boolean;
  appInvitationSentAt: string;
  appActivated: boolean;
  appActivatedAt: string;
  updatedAt: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy: string;
  deviceToken: string;
  lastChecklistCompleted: string;
  truckIds: number[];
  haulier: {
    id: number;
    haulierName: string;
    emailAddress: string;
    phoneNumber: string;
    updatedAt: string;
    createdBy: string;
    createdAt: string;
    lastModifiedBy: string;
    version: number;
  };
  version: number;
}

export interface SchedulerTruckResource {
  id: number;
  licensePlate: string;
  drivers: SchedulerDriver[];
  dockets: DocketDTO[];
}

export interface SchedulerTrucksResponse {
  resources: SchedulerTruckResource[];
  unassignedDockets: DocketDTO[];
}

export interface SchedulerTruck {
  id: number;
  licensePlate: string;
  truckType: string;
  truckStatus: string;
}

export interface SchedulerDriverResource {
  id: number;
  driverName: string;
  driverType?: string;
  trucks: SchedulerTruck[];
  dockets: DocketDTO[];
}

export interface SchedulerDriversResponse {
  resources: SchedulerDriverResource[];
  unassignedDockets: DocketDTO[];
}
