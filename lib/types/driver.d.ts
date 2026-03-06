import { DRIVER_STATUS, DRIER_TYPE } from './driver-enums';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: DRIVER_STATUS;
  type: DRIER_TYPE;
  haulier: number;
  haulierName: string;
  driver_license_number: string;
  assigned_trucks: number[];
}
