import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserRole, CollectorInfo } from "@/types/collector-roles";
import { RoleAssignment } from "./RoleAssignment";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { RoleVerificationPanel } from "./RoleVerificationPanel";

interface CollectorRolesRowProps {
  collector: CollectorInfo;
  onRoleChange: (userId: string, role: UserRole, action: 'add' | 'remove') => Promise<void>;
  onSync: (userId: string) => Promise<void>;
  permissions?: {
    canManageUsers: boolean;
    canCollectPayments: boolean;
    canAccessSystem: boolean;
    canViewAudit: boolean;
    canManageCollectors: boolean;
  };
}

export const CollectorRolesRow = ({
  collector,
  onRoleChange,
  onSync,
  permissions
}: CollectorRolesRowProps) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-dashboard-accent1/20 text-dashboard-accent1 border-dashboard-accent1';
      case 'collector':
        return 'bg-dashboard-accent2/20 text-dashboard-accent2 border-dashboard-accent2';
      default:
        return 'bg-dashboard-accent3/20 text-dashboard-accent3 border-dashboard-accent3';
    }
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    const isAssigned = collector.roles.includes(role);
    onRoleChange(userId, role, isAssigned ? 'remove' : 'add');
  };

  return (
    <>
      <TableRow className="border-dashboard-cardBorder hover:bg-dashboard-card/5">
        <TableCell className="font-medium text-dashboard-text">
          {collector.full_name || 'N/A'}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="bg-dashboard-accent1/10 text-dashboard-accent1">
            {collector.member_number || 'N/A'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="text-dashboard-text">{collector.email || 'N/A'}</div>
            <div className="text-dashboard-muted">{collector.phone || 'N/A'}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-2">
            <div className="space-y-1">
              {collector.roles.map((role, idx) => (
                <Badge
                  key={`${role}-${idx}`}
                  variant="outline"
                  className={`mr-1 ${getRoleBadgeColor(role)}`}
                >
                  {role}
                </Badge>
              ))}
            </div>
            <RoleAssignment
              userId={collector.auth_user_id}
              currentRoles={collector.roles}
              onRoleChange={handleRoleChange}
            />
          </div>
        </TableCell>
        <TableCell>
          <RoleVerificationPanel collector={collector} />
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            {collector.enhanced_roles?.map((role, index) => (
              <Badge 
                key={`${role.role_name}-${index}`}
                variant="outline"
                className={`${role.is_active ? 'bg-dashboard-accent3/10 text-dashboard-accent3' : 'bg-dashboard-muted/10 text-dashboard-muted'} border-current`}
              >
                {role.role_name}
              </Badge>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <SyncStatusIndicator status={collector.sync_status} />
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => collector.auth_user_id && onSync(collector.auth_user_id)}
            disabled={!collector.auth_user_id}
            className="text-dashboard-accent1 hover:bg-dashboard-accent1/10"
          >
            <Shield className="h-4 w-4 mr-2" />
            Sync Roles
          </Button>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            {permissions && Object.entries(permissions).map(([key, value]) => (
              <Badge 
                key={key}
                variant="outline"
                className={`${value ? 'bg-dashboard-accent3/10 text-dashboard-accent3' : 'bg-dashboard-muted/10 text-dashboard-muted'} border-current mr-1`}
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ))}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};