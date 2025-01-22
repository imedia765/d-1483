import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['app_role'];

export interface Collector {
  id: string;
  name: string | null;
  prefix: string | null;
  number: string | null;
  email: string | null;
  phone: string | null;
  active: boolean | null;
  created_at: string;
  updated_at: string;
  member_number: string | null;
  auth_user_id?: string | null;
  memberCount?: number;
  roles: UserRole[];
  enhanced_roles: {
    role_name: string;
    is_active: boolean;
  }[];
  syncStatus?: {
    status: string;
    store_status?: string;
    last_attempted_sync_at?: string;
    store_error?: string | null;
  };
  permissions?: {
    canManageUsers: boolean;
    canCollectPayments: boolean;
    canAccessSystem: boolean;
    canViewAudit: boolean;
    canManageCollectors: boolean;
  };
}