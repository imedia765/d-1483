import { RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SyncStatusIndicatorProps {
  status?: {
    status?: string;
    store_status?: string;
    last_attempted_sync_at?: string;
    store_error?: string | null;
  } | null;
}

export const SyncStatusIndicator = ({ status }: SyncStatusIndicatorProps) => {
  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (status.store_error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <RefreshCw className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status?.status === 'completed' ? 'default' : 'secondary'}
              className="flex items-center gap-2"
            >
              {getStatusIcon()}
              {status?.status || 'Not synced'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p>Last sync attempt: {status?.last_attempted_sync_at ? 
                format(new Date(status.last_attempted_sync_at), 'PPp') : 
                'Never'}</p>
              {status?.store_status && (
                <p>Store status: {status.store_status}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {status?.store_error && (
        <div className="text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {status.store_error}
        </div>
      )}
    </div>
  );
};