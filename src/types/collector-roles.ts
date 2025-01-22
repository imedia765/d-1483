import { Database } from "@/integrations/supabase/types";

export type UserRole = Database['public']['Enums']['app_role'];

export interface SyncStatus {
  id: string;
  user_id: string;
  sync_started_at: string | null;
  last_attempted_sync_at: string | null;
  status: string;
  error_message: string | null;
  store_status: string;
  store_error: string | null;
}

export interface CollectorInfo {
  full_name: string;
  member_number: string;
  roles: UserRole[];
  auth_user_id: string;
  role_details: {
    role: UserRole;
    created_at: string;
  }[];
  email: string | null;
  phone: string | null;
  prefix: string | null;
  number: string | null;
  enhanced_roles: {
    role_name: string;
    is_active: boolean;
  }[];
  sync_status?: SyncStatus;
}

export const isValidRole = (role: string): role is UserRole => {
  return ['admin', 'collector', 'member'].includes(role);
};