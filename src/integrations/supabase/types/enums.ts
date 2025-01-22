export type DatabaseEnums = {
  app_role: "admin" | "collector" | "member";
  audit_operation: "create" | "update" | "delete" | "INSERT" | "UPDATE" | "DELETE";
  backup_operation_type: "backup" | "restore";
  monitoring_event_type: "system_performance" | "api_latency" | "error_rate" | "user_activity" | "resource_usage";
  payment_method: "bank_transfer" | "cash";
  performance_metric: "response_time" | "query_performance" | "connection_count" | "cache_hit_ratio";
  severity_level: "info" | "warning" | "error" | "critical";
  note_type: "admin" | "payment" | "general";
};