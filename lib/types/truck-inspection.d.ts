import { DriverDTO } from './driver';

export type InspectionRecord = {
  id: number;
  checklistId: string;
  date: string;
  driver: DriverDTO;
  status: string;
  notes?: string;
};
