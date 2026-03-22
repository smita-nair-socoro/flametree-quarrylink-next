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

interface DriverDTO {
  id: number;
  driverName: string;
  driverType: DRIVER_STATUS;
  emailAddress: string;
  phoneNumber: string;
  licenseNumber: string;
  driverStatus: DRIVER_STATUS;
  appInvitationSent: boolean;
  appInvitationSentAt: string | null;
  appActivated: boolean;
  appActivatedAt: string | null;
  deviceToken: string | null;
  lastChecklistCompleted: string | null;
  version: number;
}
