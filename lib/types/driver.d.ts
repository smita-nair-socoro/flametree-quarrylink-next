import { DRIVER_STATUS, DRIER_TYPE } from './driver-enums';

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: DRIVER_STATUS;
  type: DRIER_TYPE;
  haulier: number;
  haulierName: string;
  driverLicenseNumber: string;
  assignedTrucks: number[];
}
