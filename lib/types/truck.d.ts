import { TRUCK_STATUS, TRUCK_TYPE } from './truck-enums';
import { HaulierDTO } from './haulier';
import { DriverTruckEntry } from './driver';

interface TruckDTO {
  id?: number;
  licensePlate: string;
  vin?: string;
  model: string;
  truckBusinessType?: 'INTERNAL' | 'SUBCONTRACTOR';
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
  /** Flat ID used in create/update request bodies */
  haulierId?: number;
  /** Nested haulier object returned by getById */
  haulier?: HaulierDTO;
  /** Driver assignments returned by getByIdWithDrivers */
  driverTrucks?: DriverTruckEntry[];
  /** Driver objects returned by getById */
  drivers?: DriverDTO[];
  /** Flat driver IDs used in create/update request bodies */
  driverIds?: number[];
  version?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
