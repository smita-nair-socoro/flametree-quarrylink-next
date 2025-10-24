import { TEAM_MEMBER_ROLE, TEAM_MEMBER_STATUS } from './team-member-enums';

export interface TeamMember {
  id: number;
  user_name: string;
  email: string;
  role: TEAM_MEMBER_ROLE;
  status: TEAM_MEMBER_STATUS;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}
