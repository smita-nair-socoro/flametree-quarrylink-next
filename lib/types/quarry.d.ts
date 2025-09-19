import { QUARRY_STATUS } from './quarry-enums';

export interface Quarry {
  id: number;
  quarry_name: string;
  status: QUARRY_STATUS;
  version: number;
  is_deleted: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}
