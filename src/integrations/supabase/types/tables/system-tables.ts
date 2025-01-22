import { Json } from '../json';
import { DatabaseEnums } from '../enums';

export type SystemTables = {
  documentation: {
    Row: {
      created_at: string;
      created_by: string | null;
      file_path: string;
      id: string;
      is_current: boolean | null;
      metadata: Json | null;
      title: string;
      updated_at: string;
      version: string;
    };
    Insert: {
      created_at?: string;
      created_by?: string | null;
      file_path: string;
      id?: string;
      is_current?: boolean | null;
      metadata?: Json | null;
      title: string;
      updated_at?: string;
      version: string;
    };
    Update: {
      created_at?: string;
      created_by?: string | null;
      file_path?: string;
      id?: string;
      is_current?: boolean | null;
      metadata?: Json | null;
      title?: string;
      updated_at?: string;
      version?: string;
    };
    Relationships: [];
  };
  backup_history: {
    Row: {
      backup_file_name: string | null;
      collectors_count: number | null;
      error_message: string | null;
      id: string;
      members_count: number | null;
      operation_type: DatabaseEnums['backup_operation_type'];
      performed_at: string | null;
      performed_by: string | null;
      policies_count: number | null;
      roles_count: number | null;
      status: string | null;
    };
    Insert: {
      backup_file_name?: string | null;
      collectors_count?: number | null;
      error_message?: string | null;
      id?: string;
      members_count?: number | null;
      operation_type: DatabaseEnums['backup_operation_type'];
      performed_at?: string | null;
      performed_by?: string | null;
      policies_count?: number | null;
      roles_count?: number | null;
      status?: string | null;
    };
    Update: {
      backup_file_name?: string | null;
      collectors_count?: number | null;
      error_message?: string | null;
      id?: string;
      members_count?: number | null;
      operation_type?: DatabaseEnums['backup_operation_type'];
      performed_at?: string | null;
      performed_by?: string | null;
      policies_count?: number | null;
      roles_count?: number | null;
      status?: string | null;
    };
    Relationships: [];
  };
  sync_status: {
    Row: {
      error_message: string | null;
      id: string;
      last_attempted_sync_at: string | null;
      status: string | null;
      store_error: string | null;
      store_status: string | null;
      sync_started_at: string | null;
      user_id: string | null;
    };
    Insert: {
      error_message?: string | null;
      id?: string;
      last_attempted_sync_at?: string | null;
      status?: string | null;
      store_error?: string | null;
      store_status?: string | null;
      sync_started_at?: string | null;
      user_id?: string | null;
    };
    Update: {
      error_message?: string | null;
      id?: string;
      last_attempted_sync_at?: string | null;
      status?: string | null;
      store_error?: string | null;
      store_status?: string | null;
      sync_started_at?: string | null;
      user_id?: string | null;
    };
    Relationships: [];
  };
  system_announcements: {
    Row: {
      created_at: string;
      created_by: string | null;
      expires_at: string | null;
      id: string;
      is_active: boolean | null;
      message: string;
      priority: number | null;
      severity: string | null;
      title: string;
    };
    Insert: {
      created_at?: string;
      created_by?: string | null;
      expires_at?: string | null;
      id?: string;
      is_active?: boolean | null;
      message: string;
      priority?: number | null;
      severity?: string | null;
      title: string;
    };
    Update: {
      created_at?: string;
      created_by?: string | null;
      expires_at?: string | null;
      id?: string;
      is_active?: boolean | null;
      message?: string;
      priority?: number | null;
      severity?: string | null;
      title?: string;
    };
    Relationships: [];
  };
};
