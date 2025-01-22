import { Collector } from "@/types/collector";
import { Database } from "@/integrations/supabase/types";
import CollectorTableHeader from './CollectorTableHeader';
import CollectorTableRow from './CollectorTableRow';

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorsTableProps {
  collectors: Collector[];
  onRoleUpdate: (collector: Collector, role: UserRole, action: 'add' | 'remove') => Promise<void>;
  onEnhancedRoleUpdate: (collector: Collector, roleName: string, isActive: boolean) => Promise<void>;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

const CollectorsTable = ({
  collectors,
  onRoleUpdate,
  onEnhancedRoleUpdate,
  onSync,
  isSyncing
}: CollectorsTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <CollectorTableHeader />
        <tbody className="bg-white divide-y divide-gray-200">
          {collectors.map((collector) => (
            <CollectorTableRow
              key={collector.id}
              collector={collector}
              onRoleUpdate={onRoleUpdate}
              onEnhancedRoleUpdate={onEnhancedRoleUpdate}
              onSync={onSync}
              isSyncing={isSyncing}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CollectorsTable;