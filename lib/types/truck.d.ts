import { TRUCK_STATUS, TRUCK_TYPE, TRUCK_BODY_TYPE } from './truck-enums';

interface TruckDTO {
  id?: number;
  licensePlate: string;
  model: string;
  truckType: TRUCK_TYPE;
  tankVolumeM3?: number;
  truckStatus?: TRUCK_STATUS;
  year?: number;
  truckBodyType?: TRUCK_BODY_TYPE;
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
}
