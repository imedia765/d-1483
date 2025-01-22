import { Json } from '../json';

export type GitTables = {
  git_repositories: {
    Row: {
      branch: string;
      created_at: string | null;
      created_by: string | null;
      custom_url: string | null;
      id: string;
      is_master: boolean;
      last_sync_at: string | null;
      name: string;
      source_url: string;
      status: string | null;
      target_url: string | null;
    };
    Insert: {
      branch?: string;
      created_at?: string | null;
      created_by?: string | null;
      custom_url?: string | null;
      id?: string;
      is_master?: boolean;
      last_sync_at?: string | null;
      name: string;
      source_url: string;
      status?: string | null;
      target_url?: string | null;
    };
    Update: {
      branch?: string;
      created_at?: string | null;
      created_by?: string | null;
      custom_url?: string | null;
      id?: string;
      is_master?: boolean;
      last_sync_at?: string | null;
      name?: string;
      source_url?: string;
      status?: string | null;
      target_url?: string | null;
    };
    Relationships: [];
  };
  git_sync_logs: {
    Row: {
      created_at: string | null;
      created_by: string | null;
      error_details: string | null;
      id: string;
      message: string | null;
      operation_type: string;
      repository_id: string | null;
      status: string;
    };
    Insert: {
      created_at?: string | null;
      created_by?: string | null;
      error_details?: string | null;
      id?: string;
      message?: string | null;
      operation_type: string;
      repository_id?: string | null;
      status: string;
    };
    Update: {
      created_at?: string | null;
      created_by?: string | null;
      error_details?: string | null;
      id?: string;
      message?: string | null;
      operation_type: string;
      repository_id?: string | null;
      status: string;
    };
    Relationships: [];
  };
};
