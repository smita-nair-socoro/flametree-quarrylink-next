import { TRUCK_STATUS, TRUCK_TYPE } from './truck-enums';
import { HaulierDTO } from './haulier';

export interface AssignDriversToTruckDTO {
  version: number;
  driverIds: number[];
}

interface TruckDTO {
  id?: number;
  licensePlate: string;
  model: string;
  truckType: TRUCK_TYPE;
  truckBodyType?: string;
  tankVolumeM3?: number;
  truckStatus?: TRUCK_STATUS;
  year?: number;
  truckBodyType?: string;
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
  /** Flat ID used in create/update request bodies */
  haulierId?: number;
  /** Nested haulier object returned by the API */
  haulier?: HaulierDTO;
  /** Driver IDs currently assigned to this truck (returned by getById) */
  driverIds?: number[];
  version?: number;
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  updatedAt?: string;
}
