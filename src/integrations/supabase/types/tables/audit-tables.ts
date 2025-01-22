import { Json } from '../json';
import { DatabaseEnums } from '../enums';

export type AuditTables = {
  audit_logs: {
    Row: {
      compressed: boolean | null;
      id: string;
      new_values: Json | null;
      old_values: Json | null;
      operation: DatabaseEnums['audit_operation'];
      record_id: string | null;
      severity: DatabaseEnums['severity_level'] | null;
      table_name: string;
      timestamp: string | null;
      user_id: string | null;
    };
    Insert: {
      compressed?: boolean | null;
      id?: string;
      new_values?: Json | null;
      old_values?: Json | null;
      operation: DatabaseEnums['audit_operation'];
      record_id?: string | null;
      severity?: DatabaseEnums['severity_level'] | null;
      table_name: string;
      timestamp?: string | null;
      user_id?: string | null;
    };
    Update: {
      compressed?: boolean | null;
      id?: string;
      new_values?: Json | null;
      old_values?: Json | null;
      operation?: DatabaseEnums['audit_operation'];
      record_id?: string | null;
      severity?: DatabaseEnums['severity_level'] | null;
      table_name?: string;
      timestamp?: string | null;
      user_id?: string | null;
    };
    Relationships: [];
  };
  monitoring_logs: {
    Row: {
      details: Json | null;
      event_type: DatabaseEnums['monitoring_event_type'];
      id: string;
      metric_name: string;
      metric_value: number;
      severity: DatabaseEnums['severity_level'] | null;
      timestamp: string | null;
    };
    Insert: {
      details?: Json | null;
      event_type: DatabaseEnums['monitoring_event_type'];
      id?: string;
      metric_name: string;
      metric_value: number;
      severity?: DatabaseEnums['severity_level'] | null;
      timestamp?: string | null;
    };
    Update: {
      details?: Json | null;
      event_type?: DatabaseEnums['monitoring_event_type'];
      id: string;
      metric_name: string;
      metric_value: number;
      severity?: DatabaseEnums['severity_level'] | null;
      timestamp?: string | null;
    };
    Relationships: [];
  };
};
