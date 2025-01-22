import { Json } from '../json';
import { DatabaseEnums } from '../enums';

export type RoleTables = {
  enhanced_roles: {
    Row: {
      created_at: string | null;
      id: string;
      is_active: boolean | null;
      last_updated_at: string | null;
      role_name: string;
      updated_by: string | null;
      user_id: string | null;
    };
    Insert: {
      created_at?: string | null;
      id?: string;
      is_active?: boolean | null;
      last_updated_at?: string | null;
      role_name: string;
      updated_by?: string | null;
      user_id?: string | null;
    };
    Update: {
      created_at?: string | null;
      id?: string;
      is_active?: boolean | null;
      last_updated_at?: string | null;
      role_name?: string;
      updated_by?: string | null;
      user_id?: string | null;
    };
    Relationships: [];
  };
  user_roles: {
    Row: {
      created_at: string;
      id: string;
      role: DatabaseEnums['app_role'];
      user_id: string | null;
    };
    Insert: {
      created_at?: string;
      id?: string;
      role: DatabaseEnums['app_role'];
      user_id?: string | null;
    };
    Update: {
      created_at?: string;
      id?: string;
      role?: DatabaseEnums['app_role'];
      user_id?: string | null;
    };
    Relationships: [];
  };
  role_history: {
    Row: {
      change_type: string | null;
      changed_by_user_id: string | null;
      created_at: string;
      id: string;
      new_value: Json | null;
      old_value: Json | null;
      role: DatabaseEnums['app_role'] | null;
      role_id: string | null;
      user_id: string | null;
    };
    Insert: {
      change_type?: string | null;
      changed_by_user_id?: string | null;
      created_at?: string;
      id?: string;
      new_value?: Json | null;
      old_value?: Json | null;
      role?: DatabaseEnums['app_role'] | null;
      role_id?: string | null;
      user_id?: string | null;
    };
    Update: {
      change_type?: string | null;
      changed_by_user_id?: string | null;
      created_at?: string;
      id?: string;
      new_value?: Json | null;
      old_value?: Json | null;
      role?: DatabaseEnums['app_role'] | null;
      role_id?: string | null;
      user_id?: string | null;
    };
    Relationships: [];
  };
};
