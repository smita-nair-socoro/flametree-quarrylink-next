export interface User {
  id: number;
  organisation_id: number;
  username?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Organisation {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithRelations {
  user: User;
  organisation: Organisation;
  groups: Group[];
}
