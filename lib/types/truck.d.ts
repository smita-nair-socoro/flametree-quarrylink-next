import { TRUCK_STATUS, TRUCK_TYPE } from './truck-enums';

interface TruckDTO {
  id?: number;
  licensePlate: string;
  vin?: string;
  model: string;
  truckType: TRUCK_TYPE;
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
  haulierName?: string;
  version?: number;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
