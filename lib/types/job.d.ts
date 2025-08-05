import { AddressType } from './address';
import { Customer } from './customer';

export enum JOB_STATUS {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

export interface Job {
  id: number;
  job_number: string;
  job_type: string;
  customer: Customer;
  project_name: string;
  job_status: JOB_STATUS;
  address: AddressType;
  po_number: string;
  contact_person_name: string;
  contact_person_phone: string;
  docket_email: string;
  uninvoiced_dockets: string;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}
