import { TRUCK_STATUS, TRUCK_TYPE, TRUCK_BUSINESS_TYPE } from './truck-enums';
import { HaulierDTO } from './haulier';

export interface DriverTruckDTO {
  truckId: number;
  driverId: number;
  driver?: DriverDTO;
  version: number;
}

export interface TruckDTO {
  id?: number;
  licensePlate: string;
  vin?: string;
  model: string;
  truckBusinessType?: TRUCK_BUSINESS_TYPE;
  truckType: TRUCK_TYPE;
  truckBodyType?: string;
  tankVolumeM3?: number;
  truckStatus?: TRUCK_STATUS;
  year?: number;
  pbsApproved?: boolean;
  tareWeight?: number;
  netWeight?: number;
  combinationGvm?: number;
  combinationGvmPbs?: number;
  combinationNet?: number;
  combinationNetPbs?: number;
  combinationVolumeM3?: number;
  epaClassification?: string;
  pbsClassification?: string;
  haulierId?: number;
  haulier?: HaulierDTO;
  drivers?: DriverDTO[];
  driverIds?: number[];
  driverTrucks?: DriverTruckDTO[];
  version?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TruckResource {
  id: string;
  name: string;
  capacity: number;
  status: TRUCK_STATUS;
  businessType: TRUCK_BUSINESS_TYPE;
  trips: number;
  drivers: string;
  haulierName?: string;
}
