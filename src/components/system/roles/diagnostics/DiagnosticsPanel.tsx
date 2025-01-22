import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import RolesSection from "./RolesSection";
import PermissionsSection from "./PermissionsSection";
import { Button } from "@/components/ui/button";

interface DiagnosticsPanelProps {
  isLoading: boolean;
  userDiagnostics: any;
  logs: string[];
  onRunDiagnostics: () => void;
}

const DiagnosticsPanel = ({
  isLoading,
  userDiagnostics,
  logs,
  onRunDiagnostics
}: DiagnosticsPanelProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Role Diagnostics</h3>
        <Button onClick={onRunDiagnostics} variant="outline" size="sm">
          Run Diagnostics
        </Button>
      </div>

      {userDiagnostics && (
        <div className="space-y-4">
          <RolesSection roles={userDiagnostics.roles || []} />
          <PermissionsSection permissions={userDiagnostics.permissions || {}} />
          
          <div>
            <h5 className="font-medium mb-2">Diagnostic Logs</h5>
            <Card className="bg-dashboard-cardHover p-3">
              <div className="space-y-1 text-sm font-mono">
                {logs.map((log, idx) => (
                  <div key={idx} className="text-dashboard-text">
                    {log}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;