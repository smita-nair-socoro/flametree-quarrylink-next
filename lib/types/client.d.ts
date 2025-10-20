import { CLIENT_STATUS, SUBSCRIPTION_TYPE } from './client-enums';

export interface Client {
  id: number;
  client: string;
  contact_name: string;
  email: string;
  phone: string;
  subscription: SUBSCRIPTION_TYPE;
  users: number;
  max_users: number;
  status: CLIENT_STATUS;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}
