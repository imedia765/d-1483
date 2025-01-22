import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { RoleAccessColumn } from "./roles/RoleAccessColumn";
import { RoleHistoryColumn } from "./roles/RoleHistoryColumn";
import { EnhancedRoleColumn } from "./roles/EnhancedRoleColumn";
import { Collector } from "@/types/collector";
import { Database } from "@/integrations/supabase/types";
import { format } from 'date-fns';

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorTableRowProps {
  collector: Collector;
  onRoleUpdate: (collector: Collector, role: UserRole, action: 'add' | 'remove') => Promise<void>;
  onEnhancedRoleUpdate: (collector: Collector, roleName: string, isActive: boolean) => Promise<void>;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

const CollectorTableRow = ({
  collector,
  onRoleUpdate,
  onEnhancedRoleUpdate,
  onSync,
  isSyncing
}: CollectorTableRowProps) => {
  const roleHistory = collector.roles.map(role => ({
    role,
    timestamp: new Date().toISOString(), // Replace with actual timestamp from your data
    changedBy: 'System' // Replace with actual user who made the change
  }));

  return (
    <tr key={collector.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{collector.name}</div>
            <div className="text-sm text-gray-500">{collector.member_number}</div>
            <div className="text-xs text-gray-400">{collector.prefix}-{collector.number}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <RoleAccessColumn
          collector={collector}
          onRoleUpdate={(role, action) => onRoleUpdate(collector, role, action)}
        />
      </td>

      <td className="px-6 py-4">
        <RoleHistoryColumn history={roleHistory} />
      </td>

      <td className="px-6 py-4">
        <EnhancedRoleColumn
          roles={collector.enhanced_roles}
          onRoleUpdate={(roleName, isActive) => onEnhancedRoleUpdate(collector, roleName, isActive)}
        />
      </td>

      <td className="px-6 py-4">
        <div className="space-y-2">
          <Badge variant={collector.syncStatus?.store_status === 'ready' ? 'default' : 'secondary'}>
            Store: {collector.syncStatus?.store_status || 'N/A'}
          </Badge>
          {collector.syncStatus?.store_error && (
            <div className="text-sm text-red-500">
              Error: {collector.syncStatus.store_error}
            </div>
          )}
          <div className="text-xs text-gray-500">
            Last updated: {collector.syncStatus?.last_attempted_sync_at ? 
              format(new Date(collector.syncStatus.last_attempted_sync_at), 'PPp') : 
              'Never'}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <Badge variant={collector.syncStatus?.status === 'completed' ? 'default' : 'secondary'}>
            {collector.syncStatus?.status || 'Not synced'}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sync
          </Button>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="space-y-1">
          {Object.entries(collector.permissions || {}).map(([key, value]) => (
            <Badge
              key={key}
              variant={value ? 'default' : 'secondary'}
              className="mr-1 mb-1"
            >
              {key}
            </Badge>
          ))}
        </div>
      </td>
    </tr>
  );
};

export default CollectorTableRow;