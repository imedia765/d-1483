import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { format } from 'date-fns';
import { CollectorInfo } from "@/types/collector-roles";

interface RoleVerificationPanelProps {
  collector: CollectorInfo;
}

export const RoleVerificationPanel = ({ collector }: RoleVerificationPanelProps) => {
  const hasCollectorRole = collector.roles.includes('collector');
  const hasValidSync = collector.sync_status?.status === 'completed';
  const lastSyncAttempt = collector.sync_status?.last_attempted_sync_at;
  
  const issues = [
    !hasCollectorRole && 'Missing collector role',
    !hasValidSync && 'Role sync incomplete',
    collector.sync_status?.error_message,
  ].filter(Boolean);

  return (
    <Card className="p-4 bg-dashboard-card/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-dashboard-accent1" />
          <h4 className="font-medium">Role Verification</h4>
        </div>
        <Badge variant={issues.length ? 'destructive' : 'default'}>
          {issues.length ? `${issues.length} Issues` : 'Verified'}
        </Badge>
      </div>

      {issues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Role Configuration Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-dashboard-muted">Role Status</div>
          <div className="flex items-center gap-2">
            {hasCollectorRole ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>Collector Role</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-dashboard-muted">Last Sync</div>
          <div className="flex items-center gap-2">
            {hasValidSync ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>
              {lastSyncAttempt 
                ? format(new Date(lastSyncAttempt), 'PPp')
                : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};